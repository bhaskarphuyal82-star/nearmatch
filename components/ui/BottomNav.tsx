'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User } from 'lucide-react';

const navItems = [
    { href: '/discover', label: 'Discover', icon: Home },
    { href: '/matches', label: 'Matches', icon: Heart },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 safe-area-bottom">
            <div className="max-w-lg mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${isActive
                                        ? 'text-pink-400'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <item.icon
                                    className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`}
                                    fill={isActive ? 'currentColor' : 'none'}
                                />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
