'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User, Zap, Settings, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SidebarProps {
    user?: {
        name?: string | null;
        image?: string | null;
        isVerified?: boolean;
    } | null;
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: '/discover', label: 'Match', icon: Home },
        { href: '/nearby', label: 'Nearby', icon: MapPin },
        { href: '/messages', label: 'Chat', icon: MessageCircle },
        { href: '/matches', label: 'Likes', icon: Heart },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-gradient-to-b from-pink-500 to-orange-500 p-6 z-50">
            {/* User Profile */}
            <div className="flex items-center gap-3 mb-8">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-black/20 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg">{user?.name}</h2>
                    <p className="text-white/80 text-xs">Online now</p>
                </div>
            </div>

            {/* Boost Button */}
            <button className="mb-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-colors">
                <Zap className="w-5 h-5 fill-current" />
                Boost
                <div className="ml-auto">
                    <Settings className="w-5 h-5" />
                </div>
            </button>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${isActive
                                ? 'bg-white text-pink-500 font-bold shadow-lg'
                                : 'text-white hover:bg-white/10 font-medium'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="text-white/60 text-xs text-center mt-auto">
                <p>&copy; 2026 NearMatch</p>
            </div>
        </div>
    );
}
