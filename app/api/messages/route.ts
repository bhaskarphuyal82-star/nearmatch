import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Message from '@/lib/models/Message';
import Match from '@/lib/models/Match';

// Get messages for a match
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('matchId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before'); // For pagination

        if (!matchId) {
            return NextResponse.json({ error: 'Match ID required' }, { status: 400 });
        }

        await connectDB();

        // Verify user is part of this match
        const match = await Match.findOne({
            _id: matchId,
            users: session.user.id,
        });

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Build query
        const query: { match: string; createdAt?: { $lt: Date } } = { match: matchId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name photos')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Mark messages as read
        await Message.updateMany(
            {
                match: matchId,
                sender: { $ne: session.user.id },
                isRead: false,
            },
            { isRead: true }
        );

        return NextResponse.json({
            messages: messages.reverse(), // Return in chronological order
            hasMore: messages.length === limit,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Send a message
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { matchId, content, type = 'text' } = await request.json();

        if (!matchId || !content) {
            return NextResponse.json(
                { error: 'Match ID and content are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify user is part of this match
        const match = await Match.findOne({
            _id: matchId,
            users: session.user.id,
            isActive: true,
        });

        if (!match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Create message
        const message = await Message.create({
            match: matchId,
            sender: session.user.id,
            content,
            type,
        });

        // Update match's last message time
        await Match.findByIdAndUpdate(matchId, { lastMessage: new Date() });

        // Populate sender for response
        await message.populate('sender', 'name photos');

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
