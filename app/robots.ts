import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { getSiteConfig } from '@/lib/models/SiteConfig';

export default async function robots(): Promise<MetadataRoute.Robots> {
    await connectDB();
    const config = await getSiteConfig();
    const baseUrl = config.siteUrl || 'https://nearmatch.site';

    const commonDisallows = [
        '/connections/',
        '/forgot_enter.phtml',
        '*/billing/allopass_unsubscribe.phtml',
        '/email*',
        '/*/email*',
        '/pin/',
        '/access-token/', // mobile
        '/new-password/', // mobile
        '/a/', // mobile
        '/w/', // mobile
        '*/too_young.phtml',
        '*/profile/*',
    ];

    return {
        rules: [
            {
                userAgent: 'MJ12bot',
                disallow: '',
            },
            {
                userAgent: 'Googlebot',
                allow: '/access.phtml',
                disallow: [
                    ...commonDisallows,
                    '*/page-',
                ],
            },
            {
                userAgent: ['Mediapartners-Google', 'AdsBot-Google', 'AdsBot-Google-Mobile'],
                disallow: '',
            },
            {
                userAgent: 'msnbot',
                allow: '/access.phtml',
                disallow: commonDisallows,
            },
            {
                userAgent: 'Yandex',
                disallow: [
                    '/access.phtml',
                    ...commonDisallows,
                ],
            },
            {
                userAgent: '*',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/_next/',
                    '/access.phtml',
                    ...commonDisallows,
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
