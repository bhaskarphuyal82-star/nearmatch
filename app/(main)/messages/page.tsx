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

    return (
        <div className="p-4 pt-6">
            <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

            {matches.length === 0 ? (
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
            ) : (
                <div className="space-y-2">
                    {matches.map((match) => {
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
                                    <h3 className="text-white font-semibold">{match.user.name}</h3>
                                    <p className="text-sm text-zinc-400 truncate">
                                        {match.lastMessage
                                            ? `Last message: ${new Date(match.lastMessage).toLocaleDateString()}`
                                            : 'No messages yet. Say hi! 👋'
                                        }
                                    </p>
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {isOnline ? 'Online' : new Date(match.user.lastActive).toLocaleDateString()}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
