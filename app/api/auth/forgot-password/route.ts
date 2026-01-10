import { NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal that the user doesn't exist
            // Just simulate a success delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash it for storage (optional, but good practice, here we store plain for simplicity/debugging since it's a demo)
        // Actually, let's just store it as is for mvp to make sure logic works easily
        // User schema field expects String

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour text
        await user.save();

        // Construct reset URL
        // Assuming localhost for dev, need env var for prod
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // In a real app, send email here
        // For this demo, we'll log it to console so the developer/user can see it
        console.log('----------------------------------------------------');
        console.log('PASSWORD RESET LINK REQUESTED:');
        console.log(`Email: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('----------------------------------------------------');

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
