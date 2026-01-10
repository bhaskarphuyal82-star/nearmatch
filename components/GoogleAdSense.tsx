'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface GoogleAdSenseProps {
    pId: string;
}

export function GoogleAdSense({ pId }: GoogleAdSenseProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = pathname?.startsWith('/admin');

    if (!pId || isAdmin) return null;

    // 15-minute ad-free period for new users
    if (session?.user?.createdAt) {
        const createdAt = new Date(session.user.createdAt).getTime();
        const now = new Date().getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (now - createdAt < fifteenMinutes) {
            console.log(`[AdSense] New user detected (${Math.round((now - createdAt) / 1000)}s old). Hiding ads for 15m.`);
            return null;
        }
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
