import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Match from '@/lib/models/Match';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Filters from query params
        const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
        const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
        const maxDistance = parseInt(searchParams.get('distance') || '50'); // km
        const gender = searchParams.get('gender'); // 'male', 'female', 'both'
        const ageMin = parseInt(searchParams.get('ageMin') || '18');
        const ageMax = parseInt(searchParams.get('ageMax') || '100');
        const onlineOnly = searchParams.get('onlineOnly') === 'true';

        // Fetch current user to get interaction history and their own location
        const currentUser = await User.findById(session.user.id).select('likedUsers dislikedUsers tempSkips location preferences');
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Calculate recently skipped users (within last 3 hours)
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const recentSkippedIds = (currentUser.tempSkips || [])
            .filter((skip: { timestamp: Date }) => new Date(skip.timestamp) > threeHoursAgo)
            .map((skip: { user: any }) => skip.user);

        const excludedIds = [
            session.user.id,
            ...(currentUser.likedUsers || []),
            ...(currentUser.dislikedUsers || []),
            ...recentSkippedIds
        ].map(id => id.toString());

        // Base query
        const query: any = {
            _id: { $nin: excludedIds.map(id => new mongoose.Types.ObjectId(id)) }, // Interaction with aggregation needs valid ObjectIds
            isBanned: { $ne: true },
            role: { $ne: 'admin' },
            onboardingComplete: true
        };

        // 2. Gender Filter
        if (gender && gender !== 'both') {
            query.gender = gender;
        } else if (!gender && currentUser.preferences?.gender && currentUser.preferences.gender !== 'both') {
            query.gender = currentUser.preferences.gender;
        }

        // 3. Age Filter
        const today = new Date();
        const minBirthDate = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate() + 1);
        const maxBirthDate = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());

        query.dateOfBirth = {
            $gte: minBirthDate,
            $lte: maxBirthDate
        };

        // 4. Online Only Filter
        if (onlineOnly) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            query.lastActive = { $gte: fiveMinutesAgo };
        }

        // Geospatial Logic using Aggregation
        const searchLat = lat ?? currentUser.location?.coordinates[1];
        const searchLng = lng ?? currentUser.location?.coordinates[0];

        let usersWithDetails;

        if (searchLat !== undefined && searchLng !== undefined) {
            // Use $geoNear for accurate distance and sorting
            usersWithDetails = await User.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [searchLng, searchLat] },
                        distanceField: 'distance',
                        maxDistance: maxDistance * 1000,
                        query: query,
                        spherical: true
                    }
                },
                { $sort: { boostedUntil: -1, distance: 1 } }, // Boosted users first, then by distance
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        name: 1,
                        photos: 1,
                        dateOfBirth: 1,
                        lastActive: 1,
                        location: 1,
                        address: 1,
                        gender: 1,
                        interests: 1,
                        bio: 1,
                        jobTitle: 1,
                        company: 1,
                        boostedUntil: 1,
                        distance: { $round: [{ $divide: ['$distance', 1000] }, 1] } // Round to 1 decimal place (km)
                    }
                }
            ]);
        } else {
            // Fallback for no location
            const nearbyUsers = await User.find(query)
                .select('name photos dateOfBirth lastActive location address gender interests bio jobTitle company boostedUntil')
                .skip(skip)
                .limit(limit)
                .lean();

            usersWithDetails = nearbyUsers.map((user: any) => ({
                ...user,
                distance: 0
            }));
        }

        // Add computed fields
        const formattedUsers = usersWithDetails.map((user: any) => {
            const birthDate = new Date(user.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            const isOnline = user.lastActive
                ? new Date(user.lastActive) > new Date(Date.now() - 5 * 60 * 1000)
                : false;

            return {
                ...user,
                age,
                isOnline
            };
        });

        return NextResponse.json({ users: formattedUsers });

    } catch (error) {
        console.error('Get nearby users error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
