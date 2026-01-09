'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SlidersHorizontal, MapPin, Loader2, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NearbyUser {
    _id: string;
    name: string;
    photos: string[];
    dateOfBirth: string;
    age: number;
    isOnline: boolean;
    location?: {
        type: string;
        coordinates: number[];
    };
}

export default function NearbyPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNearbyUsers();
    }, []);

    async function fetchNearbyUsers() {
        try {
            const res = await fetch('/api/users/nearby');
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch nearby users:', error);
        } finally {
            setLoading(false);
        }
    }

    // Pick a featured user (random for now, or first one)
    const featuredUser = users.length > 0 ? users[0] : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)] bg-zinc-950">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">Nearby</h1>
                <div className="flex gap-4">
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <Loader2 className="w-6 h-6 text-pink-500" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <SlidersHorizontal className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
                Good vibes and great chats start here. Chat now, match later.
            </p>

            {/* Featured User - "Connect instantly" */}
            {featuredUser && (
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 p-1">
                            {featuredUser.photos[0] ? (
                                <Image
                                    src={featuredUser.photos[0]}
                                    alt={featuredUser.name}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {featuredUser.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-2 bg-pink-500 text-white p-2 rounded-full border-4 border-zinc-950">
                            <MapPin className="w-4 h-4" fill="currentColor" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Connect instantly</h2>
                    <p className="text-zinc-400 text-center text-sm mb-4 max-w-xs">
                        There&apos;s no need to wait for a match — you can message them straight away
                    </p>

                    <Link
                        href={`/chat/new?userId=${featuredUser._id}`}
                        className="px-8 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-white font-semibold hover:bg-zinc-800 transition-colors"
                        onClick={(e) => {
                            // Temporary: since we don't have a direct "new chat" route that accepts userId param perfectly yet,
                            // we might want to just go to their profile or trigger a match.
                            // For this demo, let's link to profile or existing chat flow.
                            // Actually, the user wants "Show list", so clicking might just go to profile first.
                            e.preventDefault();
                            // Logic to start chat or go to profile
                            window.location.href = `/user/${featuredUser._id}`;
                        }}
                    >
                        Message {featuredUser.name}
                    </Link>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {users.map((user) => (
                    <Link href={`/user/${user._id}`} key={user._id} className="relative group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 relative">
                            {user.photos[0] ? (
                                <Image
                                    src={user.photos[0]}
                                    alt={user.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-4xl font-bold">
                                    {user.name.charAt(0)}
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white font-semibold truncate">
                                        {user.name}, {user.age}
                                    </h3>
                                    {user.isOnline && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
