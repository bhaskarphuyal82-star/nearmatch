'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { BanCheck } from './auth/BanCheck';
import { useEffect } from 'react';

function GlobalBanCheck() {
    // @ts-ignore
    // @ts-ignore
    const { data: session, status } = useSession();

    if (status === 'loading') return null;

    // @ts-ignore
    return <BanCheck isBanned={session?.user?.isBanned} />;
}

import { ToastProvider } from '@/components/ui/Toast';
import { Session } from 'next-auth';

export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }
    }, []);

    return (
        <SessionProvider session={session}>
            <ToastProvider>
                <GlobalBanCheck />
                {children}
            </ToastProvider>
        </SessionProvider>
    );
}
