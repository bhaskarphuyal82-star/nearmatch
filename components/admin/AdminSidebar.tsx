'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    MessageSquare,
    Heart,
    LogOut,
    Menu,
    X,
    Globe
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/matches', label: 'Matches', icon: Heart },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/site-config', label: 'Site Config', icon: Globe },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 text-white"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64
          bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-800">
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <span className="text-xl font-bold text-white">NearMatch</span>
                        </Link>
                        <p className="text-xs text-zinc-500 mt-2">Admin Panel</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white border border-pink-500/30'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                        }
                  `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-pink-400' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-zinc-800">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
