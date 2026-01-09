'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Loader2 } from 'lucide-react';

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

export default function MessagesPage() {
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

    const newMatches = matches.filter(match => !match.lastMessage);
    const conversations = matches.filter(match => !!match.lastMessage).sort((a, b) =>
        new Date(b.lastMessage!).getTime() - new Date(a.lastMessage!).getTime()
    );

    return (
        <div className="p-4 pt-6 space-y-8">
            <h1 className="text-2xl font-bold text-white">Chat</h1>

            {/* New Matches Section - "Start Chat" area */}
            {newMatches.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        New Matches
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {newMatches.map((match) => (
                            <Link
                                key={match.id}
                                href={`/chat/${match.id}`}
                                className="flex flex-col items-center gap-2 min-w-[80px]"
                            >
                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-pink-500/50 hover:border-pink-500 transition-colors">
                                    {match.user.photos[0] ? (
                                        <Image
                                            src={match.user.photos[0]}
                                            alt={match.user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold bg-zinc-800">
                                            {match.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {/* Online Indicator */}
                                    {new Date(match.user.lastActive) > new Date(Date.now() - 5 * 60 * 1000) && (
                                        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-900" />
                                    )}
                                </div>
                                <span className="text-sm text-zinc-300 truncate w-full text-center">
                                    {match.user.name.split(' ')[0]}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversations Section */}
            <div>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Messages
                </h2>

                {conversations.length === 0 && newMatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-pink-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No conversations</h2>
                        <p className="text-zinc-400 max-w-sm">
                            Match with someone to start chatting!
                        </p>
                        <Link
                            href="/discover"
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium"
                        >
                            Find Matches
                        </Link>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        No active conversations. Start chatting with your new matches above!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((match) => {
                            const isOnline = new Date(match.user.lastActive) > new Date(Date.now() - 5 * 60 * 1000);

                            return (
                                <Link
                                    key={match.id}
                                    href={`/chat/${match.id}`}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
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
                                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-zinc-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-white font-semibold">{match.user.name}</h3>
                                            <span className="text-xs text-zinc-500">
                                                {new Date(match.lastMessage!).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">
                                            Chat with {match.user.name}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
