'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Sparkles, X, MapPin, Briefcase, GraduationCap, Ruler, Weight, Wine, Cigarette, Dumbbell, Dog, MessageCircle } from 'lucide-react';

interface LikedByUser {
    _id: string;
    name: string;
    photos: string[];
    lastActive: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    location?: { coordinates: [number, number] };
    address?: string;
    interests?: string[];
    height?: string;
    weight?: string;
    relationshipGoal?: string;
    lifestyle?: {
        smoking?: string;
        drinking?: string;
        workout?: string;
        diet?: string;
        pets?: string;
    };
    jobTitle?: string;
    company?: string;
    educationLevel?: string;
    university?: string;
}

function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function LikesPage() {
    const router = useRouter();
    const [likedBy, setLikedBy] = useState<LikedByUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<LikedByUser | null>(null);
    const [matching, setMatching] = useState(false);

    useEffect(() => {
        async function fetchLikes() {
            try {
                const res = await fetch('/api/users/matches');
                const data = await res.json();
                setLikedBy(data.likedBy || []);
            } catch (error) {
                console.error('Failed to fetch likes:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLikes();
    }, []);

    async function handleStartChat(user: LikedByUser) {
        try {
            setMatching(true);
            const res = await fetch('/api/users/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user._id,
                    action: 'like',
                }),
            });

            const data = await res.json();

            if (data.isMatch && data.match) {
                router.push(`/chat/${data.match.id}`);
            } else {
                // Should technically be a match since they liked you, but if not:
                // Just refresh to remove them from list or show error
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            setMatching(false);
        }
    }

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
                <div className="relative px-6 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Connection Requests</h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                {likedBy.length > 0
                                    ? `${likedBy.length} people want to connect`
                                    : 'See who wants to connect'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <Heart className="w-6 h-6 text-white" fill="white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4">
                {likedBy.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-[50vh] text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-pink-500/50" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No requests yet</h2>
                        <p className="text-zinc-400 max-w-xs mb-8">
                            Don't worry, building your network takes time. Boost your profile to get more visibility!
                        </p>
                        <Link
                            href="/discover"
                            className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Discover People
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {likedBy.map((user, index) => (
                                <motion.div
                                    key={user._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    layoutId={`user-card-${user._id}`}
                                    onClick={() => setSelectedUser(user)}
                                    className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                                >
                                    <Image
                                        src={user.photos[0] || '/placeholder-user.jpg'}
                                        alt={user.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                        <h3 className="text-white font-bold text-lg">
                                            {user.name}
                                            {user.dateOfBirth && <span className="ml-1 font-normal opacity-80">, {calculateAge(user.dateOfBirth)}</span>}
                                        </h3>
                                        {user.bio && (
                                            <p className="text-white/80 text-xs line-clamp-1">{user.bio}</p>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                                            <Heart className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            layoutId={`user-card-${selectedUser._id}`}
                            className="w-full max-w-lg bg-zinc-900 rounded-3xl overflow-hidden relative mb-20 md:mb-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Scrollable Content */}
                            <div className="max-h-[80vh] overflow-y-auto pb-24">
                                {/* Photos Carousel (Simplified to just full stack for now or main photo) */}
                                <div className="relative h-96 w-full">
                                    <Image
                                        src={selectedUser.photos[0]}
                                        alt={selectedUser.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Info Section */}
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                            {selectedUser.name}
                                            {selectedUser.dateOfBirth && <span className="font-normal text-2xl text-zinc-400">{calculateAge(selectedUser.dateOfBirth)}</span>}
                                        </h2>
                                        {selectedUser.jobTitle && (
                                            <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{selectedUser.jobTitle} {selectedUser.company ? `at ${selectedUser.company}` : ''}</span>
                                            </div>
                                        )}
                                        {selectedUser.educationLevel && (
                                            <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{selectedUser.educationLevel} {selectedUser.university ? `from ${selectedUser.university}` : ''}</span>
                                            </div>
                                        )}
                                        {selectedUser.address && (
                                            <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{selectedUser.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* About */}
                                    {selectedUser.bio && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">About</h3>
                                            <p className="text-zinc-200 leading-relaxed">{selectedUser.bio}</p>
                                        </div>
                                    )}

                                    {/* Basic Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedUser.height && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                                                <Ruler className="w-5 h-5 text-pink-500" />
                                                <span className="text-zinc-300">{selectedUser.height}</span>
                                            </div>
                                        )}
                                        {selectedUser.lifestyle?.drinking && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                                                <Wine className="w-5 h-5 text-purple-500" />
                                                <span className="text-zinc-300">{selectedUser.lifestyle.drinking}</span>
                                            </div>
                                        )}
                                        {selectedUser.lifestyle?.smoking && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                                                <Cigarette className="w-5 h-5 text-orange-500" />
                                                <span className="text-zinc-300">{selectedUser.lifestyle.smoking}</span>
                                            </div>
                                        )}
                                        {selectedUser.lifestyle?.workout && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
                                                <Dumbbell className="w-5 h-5 text-blue-500" />
                                                <span className="text-zinc-300">{selectedUser.lifestyle.workout}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Interests */}
                                    {selectedUser.interests && selectedUser.interests.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Interests</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.interests.map((interest) => (
                                                    <span key={interest} className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Floating Action Button */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 via-zinc-900/90 to-transparent">
                                <button
                                    onClick={() => handleStartChat(selectedUser)}
                                    disabled={matching}
                                    className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {matching ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Starting Chat...
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle className="w-6 h-6 fill-current" />
                                            Start Chat
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
