'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User, MapPin } from 'lucide-react';

const navItems = [
    { href: '/discover', label: 'Match', icon: Home },
    { href: '/nearby', label: 'Nearby', icon: MapPin },
    { href: '/messages', label: 'Chat', icon: MessageCircle },
    { href: '/matches', label: 'Likes', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 md:hidden">
            <div className="flex items-center justify-around p-2 pb-6">
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
        </div>
    );
}
