import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const messages = await Message.find()
            .populate('sender', 'name email')
            .populate({
                path: 'match',
                populate: {
                    path: 'users',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 messages for basic view

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Admin get messages error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
