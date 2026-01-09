import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// Remove push subscription
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Remove subscription from user document
        await User.findByIdAndUpdate(session.user.id, {
            $unset: { pushSubscription: 1 },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
