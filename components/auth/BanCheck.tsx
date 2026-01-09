'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export function BanCheck({ isBanned }: { isBanned?: boolean }) {
    useEffect(() => {
        if (isBanned) {
            signOut({ callbackUrl: '/login?error=Banned' });
        }
    }, [isBanned]);

    return null;
}
