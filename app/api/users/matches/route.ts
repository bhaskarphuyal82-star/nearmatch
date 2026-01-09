import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const matches = await Match.find({
            users: session.user.id,
            isActive: true, // Only consider active matches
        })
            .populate('users', 'name photos lastActive isBanned')
            .sort({ lastMessage: -1, matchedAt: -1 })
            .lean();

        // Get IDs of people I have already matched with
        const matchedUserIds = matches.flatMap((match: any) =>
            match.users.map((u: any) => u._id)
        );

        // Find users who have liked the current user (but are NOT matches yet)
        const likedByUsers = await User.find({
            likedUsers: session.user.id,
            _id: { $nin: matchedUserIds }, // Exclude already matched users
        }).select('name photos lastActive bio dateOfBirth gender location address interests height weight relationshipGoal lifestyle jobTitle company educationLevel university isBanned');

        // Format matches with the other user's info
        const formattedMatches = matches.map((match) => {
            const otherUser = match.users.find(
                (u: { _id: { toString: () => string } }) => u._id.toString() !== session.user.id
            );
            return {
                id: match._id,
                matchedAt: match.matchedAt,
                lastMessage: match.lastMessage,
                user: otherUser,
            };
        }).filter((m: { user: any }) => m.user);

        return NextResponse.json({
            matches: formattedMatches,
            likedBy: likedByUsers
        });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
