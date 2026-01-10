'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, MapPin, Loader2, MessageCircle, X, Heart, Briefcase, GraduationCap, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NearbyUser {
    _id: string;
    name: string;
    photos: string[];
    dateOfBirth: string;
    age: number;
    isOnline: boolean;
    bio?: string;
    jobTitle?: string;
    company?: string;
    course?: string; // Adding strictly for type compatibility if returned
    university?: string; // Adding strictly for type compatibility if returned
    address?: string; // Add address field
    gender?: string;
    interests?: string[];
    // ... skipping lines, separate chunks needed or just one big update?
    // Interface is at top (line 20), Render is at bottom (line 228).
    // I will use multi_replace.
    location?: {
        type: string;
        coordinates: number[];
    };
}

export default function NearbyPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<NearbyUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        gender: 'both',
        ageRange: [18, 50],
        distance: 50,
        onlineOnly: false,
    });

    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingLocation, setSearchingLocation] = useState(false);

    useEffect(() => {
        fetchNearbyUsers();
    }, [customLocation, filters]);

    async function fetchNearbyUsers() {
        try {
            setLoading(true);
            let url = `/api/users/nearby?gender=${filters.gender}&ageMin=${filters.ageRange[0]}&ageMax=${filters.ageRange[1]}&distance=${filters.distance}&onlineOnly=${filters.onlineOnly}`;

            if (customLocation) {
                url += `&lat=${customLocation.lat}&lng=${customLocation.lng}`;
            }

            const res = await fetch(url);
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

    async function handleLocationSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchingLocation(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const place = data[0];
                const lat = parseFloat(place.lat);
                const lng = parseFloat(place.lon);

                setCustomLocation({
                    lat,
                    lng,
                    name: place.display_name.split(',')[0]
                });

                // Update profile location on every successful search
                try {
                    await fetch('/api/users/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            location: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            }
                        })
                    });
                } catch (err) {
                    console.error('Failed to update profile location:', err);
                }

                setShowLocationSearch(false);
                setSearchQuery('');
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Location search failed:', error);
        } finally {
            setSearchingLocation(false);
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
        <div className="min-h-screen bg-zinc-950 pb-20 p-4 md:p-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">Nearby</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowLocationSearch(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-white"
                    >
                        <MapPin className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium">{customLocation ? customLocation.name : 'Nearby'}</span>
                    </button>
                    <button
                        onClick={() => setShowFilters(true)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-pink-500 text-white' : 'hover:bg-zinc-800 text-white'}`}
                    >
                        <SlidersHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
                Good vibes and great chats start here. Chat now, match later.
            </p>

            {/* Modal Components */}
            <AnimatePresence>
                {showLocationSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setShowLocationSearch(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 rounded-3xl p-6 w-full max-w-sm border border-zinc-800 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Search Location</h3>
                                <button onClick={() => setShowLocationSearch(false)} className="p-2 -mr-2 text-zinc-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleLocationSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter city name..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={searchingLocation}
                                    className="px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50"
                                >
                                    {searchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-4 h-4" />}
                                </button>
                            </form>
                            <button
                                onClick={() => {
                                    setCustomLocation(null);
                                    setShowLocationSearch(false);
                                }}
                                className="mt-4 w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-4 h-4 text-pink-500" />
                                Use My Current Location
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm"
                        onClick={() => setShowFilters(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-md border-t sm:border border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-white">Filter Matches</h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-zinc-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-4 tracking-wider uppercase">Show me</label>
                                    <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-800 rounded-2xl border border-zinc-700">
                                        {['male', 'female', 'both'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setFilters({ ...filters, gender: g })}
                                                className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${filters.gender === g ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'text-zinc-500'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age Range */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-medium text-zinc-400 tracking-wider uppercase">Age Range</label>
                                        <span className="text-pink-500 font-bold">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="18"
                                        max="80"
                                        value={filters.ageRange[1]}
                                        onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                </div>

                                {/* Distance */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-medium text-zinc-400 tracking-wider uppercase">Max Distance</label>
                                        <span className="text-pink-500 font-bold">{filters.distance} km</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="500"
                                        value={filters.distance}
                                        onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                </div>

                                {/* Online Now */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">Online Now</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFilters({ ...filters, onlineOnly: !filters.onlineOnly })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${filters.onlineOnly ? 'bg-pink-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${filters.onlineOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Location Selector Row */}
                                <div
                                    onClick={() => {
                                        setShowFilters(false);
                                        setShowLocationSearch(true);
                                    }}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 cursor-pointer hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">Location</p>
                                            <p className="text-xs text-zinc-500">{customLocation ? customLocation.name : 'Nearby (Current)'}</p>
                                        </div>
                                    </div>
                                    <span className="text-pink-500 text-sm font-bold">Change</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowFilters(false)}
                                className="mt-10 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-lg"
                            >
                                Apply Filters
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Featured User - "Connect instantly" */}
            {featuredUser && (
                <div className="mb-8 flex flex-col items-center">
                    <div
                        className="relative mb-4 cursor-pointer"
                        onClick={() => setSelectedUser(featuredUser)}
                    >
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

                    <button
                        onClick={() => setSelectedUser(featuredUser)}
                        className="px-8 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-white font-semibold hover:bg-zinc-800 transition-colors"
                    >
                        Message {featuredUser.name}
                    </button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {users.map((user) => (
                    <div
                        key={user._id}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                    >
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
                    </div>
                ))}
            </div>

            {/* User Popup Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-50 bg-zinc-900 rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl border-t border-zinc-800"
                        >
                            {/* Close Indicator */}
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

                            <div className="overflow-y-auto flex-1 p-0 pb-20 no-scrollbar">
                                {/* Photo Header */}
                                <div className="relative h-64 md:h-80 w-full">
                                    {selectedUser.photos[0] ? (
                                        <Image
                                            src={selectedUser.photos[0]}
                                            alt={selectedUser.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white text-5xl font-bold">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 to-transparent pt-20">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                                    {selectedUser.name}, {selectedUser.age}
                                                    {selectedUser.isOnline && (
                                                        <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" title="Online" />
                                                    )}
                                                </h2>
                                                {selectedUser.jobTitle && (
                                                    <p className="text-zinc-300 flex items-center gap-1.5 mt-1">
                                                        <Briefcase className="w-4 h-4" />
                                                        {selectedUser.jobTitle} {selectedUser.company && `at ${selectedUser.company}`}
                                                    </p>
                                                )}
                                                {selectedUser.university && (
                                                    <p className="text-zinc-300 flex items-center gap-1.5 mt-1">
                                                        <GraduationCap className="w-4 h-4" />
                                                        {selectedUser.university}
                                                    </p>
                                                )}
                                                {selectedUser.address && (
                                                    <p className="text-zinc-300 flex items-center gap-1.5 mt-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {selectedUser.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Body */}
                                <div className="p-6 space-y-6">
                                    {selectedUser.bio && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                                            <p className="text-zinc-400 leading-relaxed">{selectedUser.bio}</p>
                                        </div>
                                    )}

                                    {selectedUser.interests && selectedUser.interests.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-3">Interests</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.interests.slice(0, 10).map((interest) => (
                                                    <span
                                                        key={interest}
                                                        className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm border border-zinc-700"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-3">
                                        <button className="flex-1 py-4 bg-zinc-800 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                                            <X className="w-5 h-5 text-red-500" />
                                            Pass
                                        </button>
                                        <Link
                                            href={`/chat/new?userId=${selectedUser._id}`}
                                            className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                                        >
                                            <MessageCircle className="w-5 h-5 fill-current" />
                                            Chat
                                        </Link>
                                        {/* Hidden Link for full profile check if needed later */}
                                        <Link
                                            href={`/user/${selectedUser._id}`}
                                            className="flex-none p-4 rounded-2xl border border-zinc-700 text-white hover:bg-zinc-800"
                                            title="View Full Profile"
                                        >
                                            <SlidersHorizontal className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
