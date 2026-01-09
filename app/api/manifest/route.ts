import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

// Generate manifest.json dynamically from site config
export async function GET() {
    try {
        await connectDB();
        const config = await getSiteConfig();

        if (!config.pwa.enabled) {
            return NextResponse.json({ error: 'PWA is disabled' }, { status: 404 });
        }

        const manifest = {
            name: config.pwa.name,
            short_name: config.pwa.shortName,
            description: config.pwa.description,
            start_url: config.pwa.startUrl,
            display: config.pwa.display,
            orientation: config.pwa.orientation,
            theme_color: config.pwa.themeColor,
            background_color: config.pwa.backgroundColor,
            icons: config.pwa.icons.length > 0
                ? config.pwa.icons
                : [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
        };

        return NextResponse.json(manifest, {
            headers: {
                'Content-Type': 'application/manifest+json',
            },
        });
    } catch (error) {
        console.error('Manifest generation error:', error);
        // Return default manifest on error
        return NextResponse.json({
            name: 'NearMatch',
            short_name: 'NearMatch',
            description: 'Dating app to find people near you',
            start_url: '/discover',
            display: 'standalone',
            orientation: 'portrait',
            theme_color: '#ec4899',
            background_color: '#09090b',
            icons: [
                {
                    src: '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: '/icons/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        }, {
            headers: {
                'Content-Type': 'application/manifest+json',
            },
        });
    }
}
