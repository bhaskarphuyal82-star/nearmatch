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

// Get single user details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        await connectDB();

        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Admin get user error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Update user (ban, verify, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const updates = await request.json();

        // Only allow specific fields to be updated by admin
        const allowedFields = ['isBanned', 'isVerified', 'role'];
        const filteredUpdates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            id,
            { $set: filteredUpdates },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Delete user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        await connectDB();

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
