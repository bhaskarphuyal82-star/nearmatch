import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Match from '@/lib/models/Match';
import Message from '@/lib/models/Message';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ matchId: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const matchId = params.matchId;

        await connectDB();

        // Verify user is part of the match
        const match = await Match.findOne({
            _id: matchId,
            users: session.user.id,
        });

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Delete the match
        await Match.findByIdAndDelete(matchId);

        // Delete associated messages (optional, usually good practice to clean up)
        await Message.deleteMany({ match: matchId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete match error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
