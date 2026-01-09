'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Loader2, Sparkles, Search } from 'lucide-react';
import Image from 'next/image';

interface User {
    _id: string;
    name: string;
    bio?: string;
    photos: string[];
    gender?: string;
    dateOfBirth?: string;
    distance: number;
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

export default function DiscoverPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [swiping, setSwiping] = useState<'left' | 'right' | null>(null);
    const [matchModal, setMatchModal] = useState<User | null>(null);

    const [locationError, setLocationError] = useState(false);
    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [customLocation, setCustomLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingLocation, setSearchingLocation] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [customLocation]);

    async function fetchUsers() {
        try {
            setLoading(true);
            let url = '/api/users/nearby';

            if (customLocation) {
                url += `?lat=${customLocation.lat}&lng=${customLocation.lng}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.error && data.error.includes('location') && !customLocation) {
                setLocationError(true);
                return;
            }

            if (data.error) {
                console.error(data.error);
                return;
            }

            setUsers(data.users || []);
            setLocationError(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
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
                setCustomLocation({
                    lat: parseFloat(place.lat),
                    lng: parseFloat(place.lon),
                    name: place.display_name.split(',')[0]
                });
                setShowLocationSearch(false);
                setSearchQuery('');
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Location search failed:', error);
            alert('Failed to search location');
        } finally {
            setSearchingLocation(false);
        }
    }

    function handleEnableLocation() {
        setLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;

                        // Update user profile
                        await fetch('/api/users/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                location: {
                                    type: 'Point',
                                    coordinates: [longitude, latitude] // MongoDB expects [lng, lat]
                                }
                            })
                        });

                        // Clear custom location if utilizing GPS
                        setCustomLocation(null);

                        // Retry fetching users
                        setLocationError(false);
                        // fetchUsers will be triggered because customLocation changed to null, or we call explicitly?
                        // If we customized fetchUsers to depend on customLocation, changing it to null triggers reload.
                        // But if it was already null (initial error state), setting it to null won't trigger effect.
                        // So calling fetchUsers directly is safer.
                        fetchUsers();
                    } catch (error) {
                        console.error('Failed to update location:', error);
                        setLoading(false);
                        alert('Failed to update location. Please try again.');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLoading(false);
                    alert('Please enable location permission in your browser settings.');
                }
            );
        } else {
            setLoading(false);
            alert('Geolocation is not supported by your browser.');
        }
    }

    async function handleSwipe(direction: 'left' | 'right') {
        if (!users[currentIndex]) return;

        setSwiping(direction);
        const user = users[currentIndex];

        try {
            const res = await fetch('/api/users/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user._id,
                    action: direction === 'right' ? 'like' : 'dislike',
                }),
            });

            const data = await res.json();

            if (data.isMatch) {
                setMatchModal(user);
            }
        } catch (error) {
            console.error('Swipe failed:', error);
        } finally {
            setTimeout(() => {
                setSwiping(null);
                setCurrentIndex((prev) => prev + 1);
            }, 200);
        }
    }

    function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        const threshold = 100;
        if (info.offset.x > threshold) {
            handleSwipe('right');
        } else if (info.offset.x < -threshold) {
            handleSwipe('left');
        }
    }

    const currentUser = users[currentIndex];

    // Render Location Search Modal
    const renderLocationSearch = () => (
        <AnimatePresence>
            {showLocationSearch && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setShowLocationSearch(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Search Location</h3>
                        <form onSubmit={handleLocationSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter city name..."
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={searchingLocation}
                                className="px-4 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50"
                            >
                                {searchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>
                        <button
                            onClick={() => {
                                setCustomLocation(null); // Reset to GPS
                                setShowLocationSearch(false);
                            }}
                            className="mt-4 w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2"
                        >
                            <MapPin className="w-4 h-4" />
                            Use My Current Location
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    if (locationError) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] text-center px-8">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                    <MapPin className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enable Location</h2>
                <p className="text-zinc-400 max-w-sm mb-6">
                    We need your location to find matches nearby. Please enable location access.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleEnableLocation}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium"
                    >
                        Enable Location
                    </button>
                    <button
                        onClick={() => setShowLocationSearch(true)}
                        className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                    >
                        Or search manually
                    </button>
                </div>
                {renderLocationSearch()}
            </div>
        );
    }

    if (users.length === 0 || !currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] text-center px-8">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Profiles Found</h2>
                <p className="text-zinc-400 max-w-sm">
                    {customLocation
                        ? `No users found around ${customLocation.name}. Try a different location.`
                        : "You've seen everyone nearby. Check back later for new matches or change your location."}
                </p>
                <div className="flex flex-col gap-3 mt-6">
                    <button
                        onClick={() => {
                            setCurrentIndex(0);
                            setLoading(true);
                            fetchUsers();
                        }}
                        className="px-6 py-3 rounded-full bg-zinc-800 text-white font-medium hover:bg-zinc-700"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowLocationSearch(true)}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium"
                    >
                        Change Location
                    </button>
                </div>
                {renderLocationSearch()}
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-5rem)] overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4">
                <button
                    onClick={() => setShowLocationSearch(true)}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <h1 className="text-2xl font-bold text-white text-center">
                        {customLocation ? customLocation.name : 'Discover'}
                    </h1>
                    <div className="px-2 py-1 rounded-full bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-500" />
                        <span className="text-xs text-zinc-300">
                            {customLocation ? 'Custom' : 'Nearby'}
                        </span>
                    </div>
                </button>
            </div>

            {renderLocationSearch()}

            {/* Cards Stack */}
            <div className="absolute inset-4 top-16 bottom-24 flex items-center justify-center">
                <AnimatePresence>
                    {users.slice(currentIndex, currentIndex + 2).reverse().map((user, index) => {
                        const isTop = index === (users.slice(currentIndex, currentIndex + 2).length - 1);

                        return (
                            <motion.div
                                key={user._id}
                                className="absolute w-full max-w-sm h-full"
                                initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
                                animate={{
                                    scale: isTop ? 1 : 0.95,
                                    y: isTop ? 0 : 10,
                                    x: isTop && swiping ? (swiping === 'right' ? 300 : -300) : 0,
                                    rotate: isTop && swiping ? (swiping === 'right' ? 15 : -15) : 0,
                                    opacity: isTop && swiping ? 0 : 1,
                                }}
                                exit={{ x: swiping === 'right' ? 300 : -300, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                drag={isTop ? 'x' : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={isTop ? handleDragEnd : undefined}
                            >
                                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-zinc-800 shadow-2xl">
                                    {/* Photo */}
                                    {user.photos[0] ? (
                                        <Image
                                            src={user.photos[0]}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-6xl font-bold text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    {/* User Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            {user.name}
                                            {user.dateOfBirth && (
                                                <span className="font-normal">, {calculateAge(user.dateOfBirth)}</span>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1 text-zinc-300">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.distance} km away</span>
                                        </div>
                                        {user.bio && (
                                            <p className="mt-2 text-zinc-300 line-clamp-2">{user.bio}</p>
                                        )}
                                    </div>

                                    {/* Swipe Indicators */}
                                    {isTop && (
                                        <>
                                            <motion.div
                                                className="absolute top-6 left-6 px-4 py-2 rounded-lg border-4 border-green-500 text-green-500 font-bold text-xl rotate-[-20deg]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: swiping === 'right' ? 1 : 0 }}
                                            >
                                                LIKE
                                            </motion.div>
                                            <motion.div
                                                className="absolute top-6 right-6 px-4 py-2 rounded-lg border-4 border-red-500 text-red-500 font-bold text-xl rotate-[20deg]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: swiping === 'left' ? 1 : 0 }}
                                            >
                                                NOPE
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-8">
                <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:scale-110 hover:bg-red-500/20 hover:border-red-500 transition-all"
                >
                    <X className="w-8 h-8 text-red-500" />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-pink-500/30"
                >
                    <Heart className="w-10 h-10 text-white" fill="white" />
                </button>
            </div>

            {/* Match Modal */}
            <AnimatePresence>
                {matchModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setMatchModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-center max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">It&apos;s a Match!</h2>
                            <p className="text-white/80 mb-6">
                                You and {matchModal.name} liked each other.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMatchModal(null)}
                                    className="flex-1 py-3 rounded-full bg-white/20 text-white font-medium hover:bg-white/30 transition-colors"
                                >
                                    Keep Swiping
                                </button>
                                <button
                                    onClick={() => {
                                        setMatchModal(null);
                                        window.location.href = '/messages';
                                    }}
                                    className="flex-1 py-3 rounded-full bg-white text-pink-500 font-medium hover:bg-white/90 transition-colors"
                                >
                                    Send Message
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
