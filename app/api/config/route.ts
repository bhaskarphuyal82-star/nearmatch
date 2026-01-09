import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export async function GET() {
    try {
        await connectDB();
        const config = await getSiteConfig();

        // Return only safe/public information
        const publicConfig = {
            site: {
                name: config.siteName,
                description: config.siteDescription,
                url: config.siteUrl,
                logo: config.siteLogo,
                supportEmail: config.supportEmail,
            },
            ids: {
                googleAnalytics: config.seo.googleAnalyticsId,
                googleTagManager: config.seo.googleTagManagerId,
                adSense: config.ads.googleAdSenseId,
            },
            app: {
                maintenanceMode: config.app.maintenanceMode,
                minAge: config.app.minAge,
                maxAge: config.app.maxAge,
                maxDistanceKm: config.app.maxDistanceKm,
                maxPhotosPerUser: config.app.maxPhotosPerUser,
            },
            ads: {
                interstitialEnabled: config.ads.interstitialEnabled,
                interstitialInterval: config.ads.interstitialInterval,
                rewardEnabled: config.ads.rewardEnabled,
                rewardDuration: config.ads.rewardDuration,
            }
        };

        return NextResponse.json(publicConfig);
    } catch (error) {
        console.error('Config API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
