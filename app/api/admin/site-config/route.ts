import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import SiteConfig, { getSiteConfig } from '@/lib/models/SiteConfig';

// Get site config
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const config = await getSiteConfig();

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Get site config error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Update site config
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        await connectDB();

        let config = await SiteConfig.findOne();
        if (!config) {
            config = await SiteConfig.create(updates);
        } else {
            // Update each field explicitly
            if (updates.siteName !== undefined) config.siteName = updates.siteName;
            if (updates.siteDescription !== undefined) config.siteDescription = updates.siteDescription;
            if (updates.siteLogo !== undefined) config.siteLogo = updates.siteLogo;
            if (updates.siteFavicon !== undefined) config.siteFavicon = updates.siteFavicon;
            if (updates.siteUrl !== undefined) config.siteUrl = updates.siteUrl;
            if (updates.supportEmail !== undefined) config.supportEmail = updates.supportEmail;

            // Deep merge nested objects
            if (updates.pwa) config.pwa = { ...config.pwa, ...updates.pwa };
            if (updates.social) config.social = { ...config.social, ...updates.social };
            if (updates.seo) config.seo = { ...config.seo, ...updates.seo };
            if (updates.app) config.app = { ...config.app, ...updates.app };
            if (updates.ads) config.ads = { ...config.ads, ...updates.ads };

            await config.save();
        }

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Update site config error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
