'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
import { LocationPicker } from '@/components/ui/LocationMap';
import { VideoAdModal } from '@/components/ui/VideoAdModal';
import { useToast } from '@/components/ui/Toast';

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
    address?: string; // Add address field
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
    const { showToast } = useToast();
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

    useEffect(() => {
        // Fetch address if user has location but no address string (legacy data)
        if (profile?.location && !profile.address) {
            async function fetchAddress() {
                try {
                    const [lng, lat] = profile!.location!.coordinates;
                    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (!token) return;

                    const res = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data.features && data.features.length > 0) {
                            const newAddress = data.features[0].place_name;
                            setProfile(prev => prev ? { ...prev, address: newAddress } : null);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch address:', error);
                }
            }
            fetchAddress();
        }
    }, [profile?.location]);

    const handleLocationSelect = useCallback(async (loc: any, addr?: string) => {
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: loc,
                    address: addr
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                showToast('Location updated', 'success');
            }
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    }, [showToast]);

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
            showToast('Geolocation is not supported by your browser', 'error');
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
                showToast('Failed to get your location. Please enable location services.', 'error');
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
                showToast('Profile boosted for 15 minutes! 🚀', 'success');
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
            {/* Header with vibrant mesh gradient */}
            <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-500/30 via-purple-500/20 to-transparent h-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 h-80" />

                <div className="relative px-4 pt-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                            Profile
                        </h1>
                        <div className="flex items-center gap-3">
                            {editing ? (
                                <>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setEditing(false)}
                                        className="p-3 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setEditing(true)}
                                    className="p-3 rounded-full bg-zinc-900/50 backdrop-blur border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
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
                        className="relative rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 mb-8 overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10" />

                        <div className="relative flex flex-col items-center text-center">
                            {/* Main Photo with Ring */}
                            <div className="relative w-28 h-28 mb-4">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse blur-sm opacity-50" />
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-zinc-950 ring-2 ring-pink-500/50">
                                    {profile.photos[0] ? (
                                        <Image
                                            src={profile.photos[0]}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white text-3xl font-bold">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {profile.isVerified && (
                                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-zinc-950 text-white shadow-lg">
                                        <Shield className="w-4 h-4" fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                    {profile.name}
                                    <span className="text-xl font-normal text-zinc-400">
                                        {age ? `, ${age}` : ''}
                                    </span>
                                </h2>
                                <p className="text-zinc-400 text-sm mt-1">{session?.user?.email}</p>
                                {profile.bio && (
                                    <p className="text-zinc-300 text-sm mt-3 max-w-xs mx-auto leading-relaxed opacity-90">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Stats Pills */}
                            <div className="flex items-center gap-3 w-full justify-center">
                                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-1.5 text-pink-400 mb-1">
                                        <Heart className="w-4 h-4 fill-current" />
                                        <span className="font-bold">0</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Likes</p>
                                </div>
                                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="font-bold">0</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Matches</p>
                                </div>
                                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-bold">{preferences.distance}km</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Range</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Photos Grid */}
                {/* Photos Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 pl-1">Photos</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => {
                            const photo = profile.photos[i];
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 relative group shadow-sm"
                                >
                                    {photo ? (
                                        <>
                                            <Image
                                                src={photo}
                                                alt={`Photo ${i + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <button
                                                onClick={() => handleDeletePhoto(i)}
                                                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {i === 0 && (
                                                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                    Main
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-full h-full flex flex-col items-center justify-center text-zinc-600 hover:text-pink-500 hover:bg-zinc-800/50 transition-all gap-2"
                                        >
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-medium uppercase tracking-wider">Add</span>
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">Edit Profile</h3>

                        <div className="space-y-4 rounded-[2rem] bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-zinc-600"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Bio</label>
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none transition-all placeholder:text-zinc-600"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Gender</label>
                                    <div className="relative">
                                        <select
                                            value={editData.gender}
                                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-pink-500 appearance-none transition-all"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Birthday</label>
                                    <input
                                        type="date"
                                        value={editData.dateOfBirth}
                                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-pink-500 transition-all calendar-picker-indicator-invert"
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1 pt-2">Preferences</h3>

                        <div className="space-y-6 rounded-[2rem] bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6">
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Age Range</label>
                                    <span className="text-sm font-medium text-pink-500">{preferences.ageMin} - {preferences.ageMax}</span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="range"
                                        min="18"
                                        max="80"
                                        value={preferences.ageMin}
                                        onChange={(e) => setPreferences({ ...preferences, ageMin: parseInt(e.target.value) })}
                                        className="flex-1 accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <input
                                        type="range"
                                        min="18"
                                        max="80"
                                        value={preferences.ageMax}
                                        onChange={(e) => setPreferences({ ...preferences, ageMax: parseInt(e.target.value) })}
                                        className="flex-1 accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Distance</label>
                                    <span className="text-sm font-medium text-pink-500">{preferences.distance}km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={preferences.distance}
                                    onChange={(e) => setPreferences({ ...preferences, distance: parseInt(e.target.value) })}
                                    className="w-full accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Show me</label>
                                <div className="bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 flex">
                                    {['male', 'female', 'both'].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setPreferences({ ...preferences, gender: g })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all capitalize ${preferences.gender === g
                                                ? 'bg-zinc-800 text-white shadow-sm'
                                                : 'text-zinc-500 hover:text-zinc-300'
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
                            <div className="relative overflow-hidden rounded-[2rem] p-6 border border-yellow-500/20 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl opacity-50" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <Zap className="w-6 h-6 text-white fill-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Boost Profile</h3>
                                                <p className="text-sm text-yellow-500/80">Get high visibility for 15m</p>
                                            </div>
                                        </div>
                                        {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() ? (
                                            <div className="px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                                Active
                                            </div>
                                        ) : (
                                            <div className="px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                                Free
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 mb-6 leading-relaxed">
                                        Stand out from the crowd! Watch a short video to boost your profile to the top of the stack.
                                    </p>
                                    <button
                                        onClick={() => setShowAd(true)}
                                        disabled={!!profile.boostedUntil && new Date(profile.boostedUntil) > new Date()}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() ? (
                                                <>Boost Active</>
                                            ) : (
                                                <>
                                                    <Play className="w-5 h-5 fill-current" /> Watch Video to Boost
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider pl-1">About Me</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[2rem] bg-zinc-900/50 backdrop-blur border border-zinc-800 p-5 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-pink-400 ring-1 ring-inset ring-pink-500/20">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gender</p>
                                        <p className="text-white capitalize font-medium text-lg">{profile.gender || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] bg-zinc-900/50 backdrop-blur border border-zinc-800 p-5 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-purple-400 ring-1 ring-inset ring-purple-500/20">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Age</p>
                                        <p className="text-white font-medium text-lg">{age ? `${age}` : 'N/A'}</p>
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
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 pl-1">Location</h3>
                            {profile.location && profile.location.coordinates[0] !== 0 ? (
                                <div className="space-y-4">
                                    <div className="rounded-[2rem] overflow-hidden border border-zinc-800 shadow-lg">
                                        <LocationPicker
                                            currentLocation={profile.location}
                                            currentAddress={profile.address}
                                            gpsOnly={true}
                                            onLocationSelect={handleLocationSelect}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-[2rem] overflow-hidden border border-zinc-800 shadow-lg">
                                        <LocationPicker
                                            currentLocation={null}
                                            currentAddress={''}
                                            gpsOnly={true}
                                            onLocationSelect={handleLocationSelect}
                                        />
                                    </div>
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
                    className="space-y-3 pt-4"
                >
                    <button
                        onClick={() => router.push('/settings')}
                        className="w-full rounded-[2rem] bg-zinc-900/50 backdrop-blur border border-zinc-800 p-5 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                            <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-white font-medium flex-1 text-left text-lg">Settings</span>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </button>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full rounded-[2rem] bg-red-500/5 border border-red-500/10 p-5 flex items-center gap-4 hover:bg-red-500/10 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-red-400 font-medium text-lg">Log Out</span>
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
