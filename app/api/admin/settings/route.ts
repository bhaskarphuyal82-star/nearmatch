import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';

// Admin middleware check
async function isAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return false;

    await connectDB();
    const user = await User.findById(session.user.id);
    return user?.role === 'admin';
}

// Get all settings
export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const settings = await Settings.find();

        // Convert to object
        const settingsObj: Record<string, unknown> = {};
        settings.forEach((s) => {
            settingsObj[s.key] = s.value;
        });

        return NextResponse.json({ settings: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Update settings
export async function PUT(request: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updates = await request.json();

        await connectDB();

        // Update each setting
        for (const [key, value] of Object.entries(updates)) {
            await Settings.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
