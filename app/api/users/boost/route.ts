import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get reward duration from config
        const config = await getSiteConfig();
        const durationMinutes = config.ads.rewardDuration || 15;
        const boostDuration = durationMinutes * 60 * 1000;
        const boostedUntil = new Date(Date.now() + boostDuration);

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { boostedUntil },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            boostedUntil: user?.boostedUntil
        });
    } catch (error) {
        console.error('Boost error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
