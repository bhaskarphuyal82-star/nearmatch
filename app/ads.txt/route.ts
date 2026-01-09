import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export async function GET() {
    try {
        await connectDB();
        const config = await getSiteConfig();
        const adSenseId = config.ads.googleAdSenseId;

        if (!adSenseId) {
            return new NextResponse('', {
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        // Standard format for Google AdSense
        // google.com, PUB_ID, DIRECT, f08c47fec0942fa0
        const content = `google.com, ${adSenseId}, DIRECT, f08c47fec0942fa0`;

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
            },
        });
    } catch (error) {
        console.error('ads.txt route error:', error);
        return new NextResponse('', {
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}
