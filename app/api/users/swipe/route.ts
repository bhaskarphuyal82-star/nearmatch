import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Match from '@/lib/models/Match';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId, action } = await request.json();

        if (!targetUserId || !['like', 'dislike'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        await connectDB();

        const currentUser = await User.findById(session.user.id);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (targetUser.isBanned) {
            return NextResponse.json({ error: 'User not available' }, { status: 400 });
        }

        // Check if already interacted
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        const recentSkip = currentUser.tempSkips?.find(
            (skip: { user: mongoose.Types.ObjectId; timestamp: Date }) =>
                skip.user.toString() === targetUserId && new Date(skip.timestamp) > threeHoursAgo
        );

        if (currentUser.likedUsers.includes(targetUserId) ||
            currentUser.dislikedUsers.includes(targetUserId) ||
            recentSkip) {
            return NextResponse.json(
                { error: 'Already interacted with this user recently' },
                { status: 400 }
            );
        }

        if (action === 'like') {
            // Add to liked users
            await User.findByIdAndUpdate(session.user.id, {
                $push: { likedUsers: targetUserId },
            });

            // Check if it's a mutual match
            const isMatch = targetUser.likedUsers.some(
                (id: mongoose.Types.ObjectId) => id.toString() === session.user.id
            );

            if (isMatch) {
                // Create match
                const match = await Match.create({
                    users: [session.user.id, targetUserId],
                });

                return NextResponse.json({
                    success: true,
                    isMatch: true,
                    match: {
                        id: match._id,
                        user: {
                            id: targetUser._id,
                            name: targetUser.name,
                            photos: targetUser.photos,
                        },
                    },
                });
            }

            return NextResponse.json({
                success: true,
                isMatch: false,
            });
        } else {
            // Add to tempSkips (temporary dislike)
            await User.findByIdAndUpdate(session.user.id, {
                $push: {
                    tempSkips: {
                        user: targetUserId,
                        timestamp: new Date()
                    }
                },
            });

            return NextResponse.json({
                success: true,
                isMatch: false,
            });
        }
    } catch (error) {
        console.error('Swipe error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
