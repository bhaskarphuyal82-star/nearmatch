'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Bell,
    Lock,
    Eye,
    HelpCircle,
    FileText,
    Shield,
    LogOut,
    Trash2,
    Moon,
    Globe,
} from 'lucide-react';
import { NotificationToggle } from '@/components/ui/NotificationManager';

export default function SettingsPage() {
    const router = useRouter();

    const settingsSections = [
        {
            title: 'Preferences',
            items: [
                {
                    icon: Moon,
                    label: 'Dark Mode',
                    description: 'Always on',
                    action: null,
                    toggle: true,
                    enabled: true,
                },
                {
                    icon: Globe,
                    label: 'Language',
                    description: 'English',
                    action: null,
                },
            ],
        },
        {
            title: 'Privacy & Safety',
            items: [
                {
                    icon: Eye,
                    label: 'Profile Visibility',
                    description: 'Visible to everyone',
                    action: null,
                },
                {
                    icon: Lock,
                    label: 'Block List',
                    description: 'Manage blocked users',
                    action: null,
                },
                {
                    icon: Shield,
                    label: 'Two-Factor Authentication',
                    description: 'Not enabled',
                    action: null,
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: HelpCircle,
                    label: 'Help Center',
                    action: null,
                },
                {
                    icon: FileText,
                    label: 'Terms of Service',
                    action: null,
                },
                {
                    icon: FileText,
                    label: 'Privacy Policy',
                    action: null,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
                        Notifications
                    </h2>
                    <NotificationToggle />
                </motion.div>

                {/* Other Settings */}
                {settingsSections.map((section, sIdx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (sIdx + 1) }}
                    >
                        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
                            {section.title}
                        </h2>
                        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden divide-y divide-zinc-800">
                            {section.items.map((item) => (
                                <button
                                    key={item.label}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{item.label}</p>
                                        {item.description && (
                                            <p className="text-xs text-zinc-500">{item.description}</p>
                                        )}
                                    </div>
                                    {item.toggle !== undefined && (
                                        <div
                                            className={`w-10 h-5 rounded-full ${item.enabled ? 'bg-pink-500' : 'bg-zinc-600'
                                                }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
                        Account
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-zinc-400" />
                            </div>
                            <span className="text-white font-medium">Log Out</span>
                        </button>

                        <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="text-red-400 font-medium">Delete Account</span>
                                <p className="text-xs text-red-400/70">This action cannot be undone</p>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* App Version */}
                <div className="text-center pt-4 pb-8">
                    <p className="text-xs text-zinc-600">NearMatch v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
