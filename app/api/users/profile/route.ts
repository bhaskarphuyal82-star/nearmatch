import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

// Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id).select('-password -likedUsers -dislikedUsers');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Update user profile
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        // 1. Age Validation Check (18+)
        if (updates.dateOfBirth) {
            const dob = new Date(updates.dateOfBirth);
            const age = Math.floor((new Date().getTime() - dob.getTime()) / (31557600000));
            if (age < 18) {
                // Auto-ban user
                await connectDB();
                await User.findByIdAndUpdate(session.user.id, { isBanned: true });
                return NextResponse.json({
                    error: 'You must be at least 18 years old to use this service. Your account has been suspended.',
                    isBanned: true
                }, { status: 403 });
            }
        }

        // Fields that can be updated
        const allowedFields = [
            'name',
            'bio',
            'dateOfBirth',
            'gender',
            'photos',
            'location',
            'preferences',
            'onboardingComplete',
            // New fields
            'phoneNumber',
            'interests',
            'height',
            'weight',
            'relationshipGoal',
            'lifestyle',
            'jobTitle',
            'company',
            'educationLevel',
            'university',
            'address',
        ];

        // Filter only allowed fields
        const filteredUpdates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: filteredUpdates },
            { new: true }
        ).select('-password -likedUsers -dislikedUsers');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
