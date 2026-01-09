import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export async function GET() {
    try {
        await connectDB();
        const config = await getSiteConfig();

        return NextResponse.json({
            ads: config.ads,
            pwa: {
                enabled: config.pwa.enabled,
                name: config.pwa.name,
            }
        });
    } catch (error) {
        console.error('Get public config error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
