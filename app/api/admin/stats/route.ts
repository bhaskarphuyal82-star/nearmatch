import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Match from '@/lib/models/Match';
import Message from '@/lib/models/Message';

// Admin middleware check
async function isAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return false;

    await connectDB();
    const user = await User.findById(session.user.id);
    return user?.role === 'admin';
}

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        // Get stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            activeUsersToday,
            activeUsersWeek,
            newUsersToday,
            newUsersMonth,
            totalMatches,
            matchesToday,
            totalMessages,
            bannedUsers,
            verifiedUsers,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastActive: { $gte: todayStart } }),
            User.countDocuments({ lastActive: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: monthAgo } }),
            Match.countDocuments(),
            Match.countDocuments({ createdAt: { $gte: todayStart } }),
            Message.countDocuments(),
            User.countDocuments({ isBanned: true }),
            User.countDocuments({ isVerified: true }),
        ]);

        // Gender distribution
        const genderStats = await User.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } },
        ]);

        // Recent signups (last 7 days)
        const recentSignups = await User.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsersToday,
                activeUsersWeek,
                newUsersToday,
                newUsersMonth,
                totalMatches,
                matchesToday,
                totalMessages,
                bannedUsers,
                verifiedUsers,
                genderStats,
                recentSignups,
            },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
