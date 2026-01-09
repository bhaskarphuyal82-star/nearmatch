'use client';

import Script from 'next/script';

import { usePathname } from 'next/navigation';

interface GoogleAdSenseProps {
    pId: string;
}

export function GoogleAdSense({ pId }: GoogleAdSenseProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (!pId || isAdmin) return null;

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
