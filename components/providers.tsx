'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { BanCheck } from './auth/BanCheck';

function GlobalBanCheck() {
    // @ts-ignore
    // @ts-ignore
    const { data: session, status } = useSession();

    if (status === 'loading') return null;

    // @ts-ignore
    return <BanCheck isBanned={session?.user?.isBanned} />;
}

import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <GlobalBanCheck />
                {children}
            </ToastProvider>
        </SessionProvider>
    );
}
