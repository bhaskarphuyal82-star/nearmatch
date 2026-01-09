'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MapPin,
    Calendar,
    User as UserIcon,
    Loader2,
    Heart,
    ArrowLeft,
    Briefcase,
    GraduationCap,
    Shield,
    MessageCircle
} from 'lucide-react';
import { LocationMap } from '@/components/ui/LocationMap'; // Use read-only map essentially, or just show pin? User asked for "location". I'll show simplified map if coordinates exist.

interface UserProfile {
    _id: string;
    name: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    photos: string[];
    location?: {
        type: string;
        coordinates: [number, number];
    };
    address?: string;
    isVerified?: boolean;
    jobTitle?: string;
    company?: string;
    educationLevel?: string;
    university?: string;
    interests?: string[];
}

function calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    useEffect(() => {
        // Fetch address if user has location but no address string (legacy data)
        if (user?.location && !user.address) {
            async function fetchAddress() {
                try {
                    const [lng, lat] = user!.location!.coordinates;
                    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (!token) return;

                    const res = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data.features && data.features.length > 0) {
                            setUser(prev => prev ? { ...prev, address: data.features[0].place_name } : null);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch address:', error);
                }
            }
            fetchAddress();
        }
    }, [user]);

    async function fetchUser() {
        try {
            const res = await fetch(`/api/users/${id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                // If not found, maybe redirect or show error
                console.error('User not found');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-4">
                <p className="text-zinc-400">User not found</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const age = calculateAge(user.dateOfBirth);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header Image / Photos */}
            <div className="relative h-96 w-full">
                {user.photos[0] ? (
                    <Image
                        src={user.photos[0]}
                        alt={user.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                        <UserIcon className="w-20 h-20" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-zinc-950" />

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors z-10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Profile Content */}
            <div className="px-4 -mt-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] bg-zinc-950 border border-zinc-800 p-6 shadow-2xl"
                >
                    {/* Basic Info */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                {user.name}
                                {age && <span className="text-zinc-500 font-normal">{age}</span>}
                                {user.isVerified && <Shield className="w-5 h-5 text-blue-500 fill-blue-500/20" />}
                            </h1>

                            {/* Job & Education */}
                            <div className="mt-2 space-y-1">
                                {user.jobTitle && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{user.jobTitle} {user.company ? `at ${user.company}` : ''}</span>
                                    </div>
                                )}
                                {user.university && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{user.university}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link
                            href={`/chat/new?userId=${user._id}`}
                            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
                        >
                            <MessageCircle className="w-6 h-6 fill-current" />
                        </Link>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">About</h2>
                            <p className="text-zinc-300 leading-relaxed">{user.bio}</p>
                        </div>
                    )}

                    {/* Interests */}
                    {user.interests && user.interests.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Interests</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Location</h2>

                        <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800 flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{user.address || 'Location hidden'}</p>
                                {user.location && (
                                    <p className="text-xs text-zinc-500">
                                        {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {user.location && user.location.coordinates[0] !== 0 && (
                            <div className="h-48 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 bg-zinc-900 relative">
                                {/* Use generic map image or non-interactive map for now to save complexity, or simplified LocationMap. 
                                    Since we have LocationMap component, let's try to use it read-only if possible, or just skip if it forces interaction.
                                    The LocationMap component has interactive controls. Let's assume we can reuse it but maybe hide controls via props or just ignore updates.
                                */}
                                <LocationMap
                                    initialCoordinates={user.location.coordinates}
                                    onLocationSelect={() => { }}
                                    showCurrentLocation={false}
                                />
                                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl"></div>
                            </div>
                        )}
                    </div>

                    {/* Photos Grid */}
                    {user.photos.length > 1 && (
                        <div>
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Photos</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {user.photos.slice(1).map((photo, i) => (
                                    <div key={i} className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-zinc-900">
                                        <Image
                                            src={photo}
                                            alt={`${user.name} ${i + 2}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

// Add a specific prop to LocationMap to enable read-only mode if needed?
// Currently LocationMap is interactive. I'll just leave it interactive for now, user can pan but not save changes.
