'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Camera,
    MapPin,
    Calendar,
    User as UserIcon,
    Settings,
    LogOut,
    Loader2,
    Edit2,
    Save,
    X,
    Heart,
    Sparkles,
    Shield,
    ChevronRight,
    Plus,
    Trash2,
    Zap,
    Play
} from 'lucide-react';
import { LocationMap } from '@/components/ui/LocationMap';
import { VideoAdModal } from '@/components/ui/VideoAdModal';

interface Profile {
    _id: string;
    email: string;
    name: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    photos: string[];
    location?: {
        type: string;
        coordinates: [number, number];
    };
    preferences: {
        ageRange: { min: number; max: number };
        distance: number;
        gender: string;
    };
    isVerified?: boolean;
    createdAt?: string;
    boostedUntil?: string;
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

export default function ProfilePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editData, setEditData] = useState({
        name: '',
        bio: '',
        gender: '',
        dateOfBirth: '',
    });
    const [preferences, setPreferences] = useState({
        ageMin: 18,
        ageMax: 50,
        distance: 50,
        gender: 'both',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/users/profile');
            const data = await res.json();
            setProfile(data.user);
            setEditData({
                name: data.user.name || '',
                bio: data.user.bio || '',
                gender: data.user.gender || '',
                dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '',
            });
            setPreferences({
                ageMin: data.user.preferences?.ageRange?.min || 18,
                ageMax: data.user.preferences?.ageRange?.max || 50,
                distance: data.user.preferences?.distance || 50,
                gender: data.user.preferences?.gender || 'both',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editData,
                    dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined,
                    preferences: {
                        ageRange: { min: preferences.ageMin, max: preferences.ageMax },
                        distance: preferences.distance,
                        gender: preferences.gender,
                    },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setEditing(false);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const { url } = await uploadRes.json();
                const updateRes = await fetch('/api/users/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        photos: [...(profile?.photos || []), url],
                    }),
                });

                if (updateRes.ok) {
                    const data = await updateRes.json();
                    setProfile(data.user);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    }

    async function handleDeletePhoto(index: number) {
        if (!profile) return;
        const newPhotos = profile.photos.filter((_, i) => i !== index);

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photos: newPhotos }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
            }
        } catch (error) {
            console.error('Failed to delete photo:', error);
        }
    }

    async function requestLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await fetch('/api/users/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            location: {
                                type: 'Point',
                                coordinates: [position.coords.longitude, position.coords.latitude],
                            },
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data.user);
                    }
                } catch (error) {
                    console.error('Failed to update location:', error);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Failed to get your location. Please enable location services.');
            }
        );
    }

    async function handleBoostReward() {
        try {
            const res = await fetch('/api/users/boost', {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => prev ? { ...prev, boostedUntil: data.boostedUntil } : null);
                alert('Profile boosted for 15 minutes! 🚀');
            }
        } catch (error) {
            console.error('Boost failed:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <p className="text-zinc-400">Failed to load profile</p>
            </div>
        );
    }

    const age = calculateAge(profile.dateOfBirth);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header with gradient */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 via-purple-500/10 to-transparent h-48" />

                <div className="relative px-4 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Profile</h1>
                        <div className="flex items-center gap-2">
                            {editing ? (
                                <>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setEditing(false)}
                                        className="p-2.5 rounded-full bg-zinc-800/80 backdrop-blur text-zinc-400 hover:bg-zinc-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditing(true)}
                                    className="p-2.5 rounded-full bg-zinc-800/80 backdrop-blur text-zinc-400 hover:bg-zinc-700"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 p-5 mb-6 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl" />

                        <div className="relative flex items-center gap-4">
                            {/* Main Photo */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 flex-shrink-0">
                                {profile.photos[0] ? (
                                    <Image
                                        src={profile.photos[0]}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {profile.isVerified && (
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                                        <Shield className="w-3 h-3 text-white" fill="white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white truncate">
                                        {profile.name}{age ? `, ${age}` : ''}
                                    </h2>
                                </div>
                                <p className="text-zinc-400 text-sm truncate">{session?.user?.email}</p>
                                {profile.bio && (
                                    <p className="text-zinc-300 text-sm mt-1 line-clamp-2">{profile.bio}</p>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-around mt-5 pt-5 border-t border-zinc-800/50">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-pink-400">
                                    <Heart className="w-4 h-4" fill="currentColor" />
                                    <span className="font-bold">0</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Likes</p>
                            </div>
                            <div className="w-px h-8 bg-zinc-800" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-purple-400">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-bold">0</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Matches</p>
                            </div>
                            <div className="w-px h-8 bg-zinc-800" />
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-cyan-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-bold">{preferences.distance}km</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Range</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Photos Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => {
                            const photo = profile.photos[i];
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="aspect-square rounded-2xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50 relative group"
                                >
                                    {photo ? (
                                        <>
                                            <Image
                                                src={photo}
                                                alt={`Photo ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => handleDeletePhoto(i)}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {i === 0 && (
                                                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-medium">
                                                    Main
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-pink-400 transition-colors"
                                        >
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Plus className="w-6 h-6" />
                                                    <span className="text-xs mt-1">Add</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                />

                {/* Edit Mode */}
                {editing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Edit Profile</h3>

                        <div className="space-y-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Bio</label>
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 resize-none transition-colors"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Gender</label>
                                    <select
                                        value={editData.gender}
                                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Birthday</label>
                                    <input
                                        type="date"
                                        value={editData.dateOfBirth}
                                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pt-2">Preferences</h3>

                        <div className="space-y-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Age Range: {preferences.ageMin} - {preferences.ageMax}
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min="18"
                                        max="80"
                                        value={preferences.ageMin}
                                        onChange={(e) => setPreferences({ ...preferences, ageMin: parseInt(e.target.value) })}
                                        className="flex-1 accent-pink-500"
                                    />
                                    <input
                                        type="range"
                                        min="18"
                                        max="80"
                                        value={preferences.ageMax}
                                        onChange={(e) => setPreferences({ ...preferences, ageMax: parseInt(e.target.value) })}
                                        className="flex-1 accent-pink-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Distance: {preferences.distance}km
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={preferences.distance}
                                    onChange={(e) => setPreferences({ ...preferences, distance: parseInt(e.target.value) })}
                                    className="w-full accent-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Show me</label>
                                <div className="flex gap-2">
                                    {['male', 'female', 'both'].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setPreferences({ ...preferences, gender: g })}
                                            className={`flex-1 py-2 rounded-xl border transition-colors capitalize ${preferences.gender === g
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white'
                                                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                        >
                                            {g === 'both' ? 'Everyone' : g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Info Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Boost Section */}
                            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                            <Zap className="w-6 h-6 text-white fill-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">Boost Profile</h3>
                                            <p className="text-xs text-yellow-500/80">Get 15 mins of high visibility</p>
                                        </div>
                                    </div>
                                    {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() ? (
                                        <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                                            Active
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                                            Free
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Watch a short video to boost your profile to the top of the stack for 15 minutes.
                                </p>
                                <button
                                    onClick={() => setShowAd(true)}
                                    disabled={!!profile.boostedUntil && new Date(profile.boostedUntil) > new Date()}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() ? (
                                            <>Boost Active</>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 fill-current" /> Watch Video to Boost
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>

                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">About Me</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500">Gender</p>
                                        <p className="text-white capitalize font-medium">{profile.gender || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500">Age</p>
                                        <p className="text-white font-medium">{age ? `${age} years` : 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Location */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Location</h3>
                            {profile.location && profile.location.coordinates[0] !== 0 ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Location enabled</p>
                                            <p className="text-xs text-zinc-500">
                                                {profile.location.coordinates[1].toFixed(4)}, {profile.location.coordinates[0].toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                    <LocationMap
                                        initialCoordinates={profile.location.coordinates}
                                        onLocationSelect={async (coords) => {
                                            try {
                                                const res = await fetch('/api/users/profile', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        location: { type: 'Point', coordinates: coords },
                                                    }),
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setProfile(data.user);
                                                }
                                            } catch (error) {
                                                console.error('Failed to update location:', error);
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-zinc-400 mb-2">Click the map or use &quot;Use my location&quot; to set your location</p>
                                    <LocationMap
                                        onLocationSelect={async (coords) => {
                                            try {
                                                const res = await fetch('/api/users/profile', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        location: { type: 'Point', coordinates: coords },
                                                    }),
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setProfile(data.user);
                                                }
                                            } catch (error) {
                                                console.error('Failed to update location:', error);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </>
                )}

                {/* Settings & Logout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2 pt-2"
                >
                    <button
                        onClick={() => router.push('/settings')}
                        className="w-full rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-zinc-400" />
                        </div>
                        <span className="text-white font-medium flex-1 text-left">Settings</span>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </button>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-4 hover:bg-red-500/20 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-red-400 font-medium">Log Out</span>
                    </button>
                </motion.div>
            </div>

            <VideoAdModal
                isOpen={showAd}
                onClose={() => setShowAd(false)}
                onReward={() => {
                    setShowAd(false);
                    handleBoostReward();
                }}
            />
        </div>
    );
}
