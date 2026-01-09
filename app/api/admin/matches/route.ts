import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const matches = await Match.find()
            .populate('users', 'name email photos')
            .sort({ matchedAt: -1 });

        return NextResponse.json({ matches });
    } catch (error) {
        console.error('Admin get matches error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
