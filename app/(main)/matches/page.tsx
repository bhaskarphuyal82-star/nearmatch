'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, MessageCircle, Sparkles } from 'lucide-react';

interface Match {
    id: string;
    matchedAt: string;
    lastMessage?: string;
    user: {
        _id: string;
        name: string;
        photos: string[];
        lastActive: string;
    };
}

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const res = await fetch('/api/users/matches');
                const data = await res.json();
                setMatches(data.matches || []);
            } catch (error) {
                console.error('Failed to fetch matches:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent h-32" />
                <div className="relative px-4 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Matches</h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                {matches.length > 0 ? `${matches.length} people like you too!` : 'Find your perfect match'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" fill="white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4">
                {matches.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-10 h-10 text-pink-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No matches yet</h2>
                        <p className="text-zinc-400 max-w-xs">
                            Keep swiping to find people who like you back!
                        </p>
                        <Link
                            href="/discover"
                            className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium shadow-lg shadow-pink-500/25"
                        >
                            Start Discovering
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* New Matches Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                New Matches
                            </h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                <AnimatePresence>
                                    {matches.map((match, index) => (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Link
                                                href={`/chat/${match.id}`}
                                                className="block relative flex-shrink-0"
                                            >
                                                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                                                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900 relative">
                                                        {match.user.photos[0] ? (
                                                            <Image
                                                                src={match.user.photos[0]}
                                                                alt={match.user.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
                                                                <span className="text-2xl font-bold text-white">
                                                                    {match.user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-center text-xs text-zinc-300 mt-2 max-w-[80px] truncate">
                                                    {match.user.name.split(' ')[0]}
                                                </p>
                                                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-900" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Messages Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                Messages
                            </h2>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {matches.map((match, index) => {
                                        const isOnline = new Date(match.user.lastActive) > new Date(Date.now() - 5 * 60 * 1000);
                                        const timeAgo = match.lastMessage
                                            ? formatTimeAgo(new Date(match.lastMessage))
                                            : formatTimeAgo(new Date(match.matchedAt));

                                        return (
                                            <motion.div
                                                key={match.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + index * 0.05 }}
                                            >
                                                <Link
                                                    href={`/chat/${match.id}`}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all duration-200 group"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
                                                            {match.user.photos[0] ? (
                                                                <Image
                                                                    src={match.user.photos[0]}
                                                                    alt={match.user.name}
                                                                    width={56}
                                                                    height={56}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                                                    {match.user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isOnline && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-zinc-900" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-white font-semibold truncate">{match.user.name}</h3>
                                                            <span className="text-xs text-zinc-500">{timeAgo}</span>
                                                        </div>
                                                        <p className="text-sm text-zinc-400 truncate mt-0.5">
                                                            {match.lastMessage ? 'Tap to continue chatting...' : 'Say hi! 👋'}
                                                        </p>
                                                    </div>

                                                    <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-600/10 text-pink-400 group-hover:from-pink-500/20 group-hover:to-purple-600/20 transition-colors">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
