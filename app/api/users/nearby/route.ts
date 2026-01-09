import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const maxDistance = parseInt(searchParams.get('distance') || '50') * 1000; // Convert km to meters
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');
        const latParam = searchParams.get('lat');
        const lngParam = searchParams.get('lng');

        await connectDB();

        // Get current user with their location and preferences
        const currentUser = await User.findById(session.user.id);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let searchCoordinates = currentUser.location?.coordinates;

        // Use custom coordinates if provided
        if (latParam && lngParam) {
            const lat = parseFloat(latParam);
            const lng = parseFloat(lngParam);
            if (!isNaN(lat) && !isNaN(lng)) {
                searchCoordinates = [lng, lat]; // MongoDB uses [lng, lat]
            }
        }

        // Validate coordinates
        if (!searchCoordinates || (searchCoordinates[0] === 0 && searchCoordinates[1] === 0)) {
            return NextResponse.json(
                { error: 'Please enable location to find nearby users' },
                { status: 400 }
            );
        }

        // Calculate age range dates
        const today = new Date();
        const minBirthDate = new Date(today.getFullYear() - currentUser.preferences.ageRange.max, today.getMonth(), today.getDate());
        const maxBirthDate = new Date(today.getFullYear() - currentUser.preferences.ageRange.min, today.getMonth(), today.getDate());

        // Build gender filter
        const genderFilter = currentUser.preferences.gender === 'both'
            ? ['male', 'female']
            : [currentUser.preferences.gender];

        // Get already interacted users (liked + disliked)
        const excludeIds = [
            currentUser._id,
            ...currentUser.likedUsers,
            ...currentUser.dislikedUsers,
        ];

        // Find nearby users using geospatial query
        const nearbyUsers = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: searchCoordinates,
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistance,
                    spherical: true,
                },
            },
            {
                $match: {
                    _id: { $nin: excludeIds },
                    isBanned: false,
                    gender: { $in: genderFilter },
                    dateOfBirth: {
                        $gte: minBirthDate,
                        $lte: maxBirthDate,
                    },
                },
            },
            {
                $project: {
                    password: 0,
                    likedUsers: 0,
                    dislikedUsers: 0,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);

        // Convert distance from meters to km
        const usersWithDistance = nearbyUsers.map(user => ({
            ...user,
            distance: Math.round(user.distance / 1000 * 10) / 10, // km with 1 decimal
        }));

        return NextResponse.json({
            users: usersWithDistance,
            hasMore: nearbyUsers.length === limit,
        });
    } catch (error) {
        console.error('Nearby users error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
