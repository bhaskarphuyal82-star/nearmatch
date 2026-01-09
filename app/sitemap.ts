import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();
    const config = await getSiteConfig();
    const baseUrl = config.siteUrl || 'https://nearmatch.site'; // Fallback if not configured

    const staticRoutes = [
        '',
        '/login',
        '/register',
        '/discover',
        '/nearby',
        '/matches',
        '/messages',
        '/profile',
        '/settings',
        '/about',
        '/privacy',
        '/terms',
        '/cookies',
        '/guidelines',
        '/collection-notice',
        '/contact',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [
        ...staticRoutes,
    ];
}
