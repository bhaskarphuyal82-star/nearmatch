import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Match from '@/lib/models/Match';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const matches = await Match.find({
            users: session.user.id,
            isActive: true,
        })
            .populate('users', 'name photos lastActive')
            .sort({ lastMessage: -1, matchedAt: -1 });

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
        });

        return NextResponse.json({ matches: formattedMatches });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
