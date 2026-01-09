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

        // Get IDs of users already matched (optional, Badoo shows everyone, but typical nearby might exclude matches)
        // For now, let's keep it simple and just exclude the current user and banned users

        // Fetch current user to get interaction history
        const currentUser = await User.findById(session.user.id).select('likedUsers dislikedUsers tempSkips');
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

        const nearbyUsers = await User.find({
            _id: { $nin: excludedIds },
            isBanned: { $ne: true },
            role: { $ne: 'admin' },
            // Add other filters here later (gender, age, location)
        })
            .select('name photos dateOfBirth lastActive location address gender interests bio jobTitle company')
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate Age and isOnline status
        const usersWithDetails = nearbyUsers.map(user => {
            const age = user.dateOfBirth
                ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
                : null;

            const isOnline = user.lastActive
                ? new Date(user.lastActive) > new Date(Date.now() - 5 * 60 * 1000)
                : false;

            return {
                ...user,
                age,
                isOnline,
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
