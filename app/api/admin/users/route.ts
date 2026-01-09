import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// Admin middleware check
async function isAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return false;

    await connectDB();
    const user = await User.findById(session.user.id);
    return user?.role === 'admin';
}

// Get all users with pagination and filters
export async function GET(request: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status'); // all, active, banned, verified
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        await connectDB();

        // Build query
        const query: Record<string, unknown> = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (status === 'banned') {
            query.isBanned = true;
        } else if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'active') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query.lastActive = { $gte: weekAgo };
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -likedUsers -dislikedUsers')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
