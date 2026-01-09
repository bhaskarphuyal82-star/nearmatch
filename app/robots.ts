import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export default async function robots(): Promise<MetadataRoute.Robots> {
    await connectDB();
    const config = await getSiteConfig();
    const baseUrl = config.siteUrl || 'https://nearmatch.site';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
