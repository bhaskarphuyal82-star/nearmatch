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
