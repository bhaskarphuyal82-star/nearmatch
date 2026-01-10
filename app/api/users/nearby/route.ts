import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Match from '@/lib/models/Match';

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
        ];

        // Base query
        const query: any = {
            _id: { $nin: excludedIds },
            isBanned: { $ne: true },
            role: { $ne: 'admin' },
            onboardingComplete: true
        };

        // 1. Geospatial Filter
        const searchLat = lat ?? currentUser.location?.coordinates[1];
        const searchLng = lng ?? currentUser.location?.coordinates[0];

        if (searchLat !== undefined && searchLng !== undefined) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [searchLng, searchLat]
                    },
                    $maxDistance: maxDistance * 1000 // Convert km to meters
                }
            };
        }

        // 2. Gender Filter
        if (gender && gender !== 'both') {
            query.gender = gender;
        } else if (!gender && currentUser.preferences?.gender && currentUser.preferences.gender !== 'both') {
            // Use user preferences if no explicit filter
            query.gender = currentUser.preferences.gender;
        }

        // 3. Age Filter
        const today = new Date();
        const minBirthYear = today.getFullYear() - ageMax - 1;
        const maxBirthYear = today.getFullYear() - ageMin;

        // This is a rough age calculation by year
        query.dateOfBirth = {
            $gte: new Date(minBirthYear, today.getMonth(), today.getDate()),
            $lte: new Date(maxBirthYear, today.getMonth(), today.getDate())
        };

        // 4. Online Only Filter
        if (onlineOnly) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            query.lastActive = { $gte: fiveMinutesAgo };
        }

        const nearbyUsers = await User.find(query)
            .select('name photos dateOfBirth lastActive location address gender interests bio jobTitle company boostedUntil')
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate distances and details
        const usersWithDetails = nearbyUsers.map((user: any) => {
            const age = user.dateOfBirth
                ? today.getFullYear() - new Date(user.dateOfBirth).getFullYear()
                : null;

            const isOnline = user.lastActive
                ? new Date(user.lastActive) > new Date(Date.now() - 5 * 60 * 1000)
                : false;

            return {
                ...user,
                age,
                isOnline,
                distance: 1 // Placeholder for now, could calculate properly if needed
            };
        });

        return NextResponse.json({ users: usersWithDetails });

    } catch (error) {
        console.error('Get nearby users error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
