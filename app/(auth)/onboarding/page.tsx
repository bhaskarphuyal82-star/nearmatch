'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    ChevronRight,
    ChevronLeft,
    MapPin,
    Camera,
    Check,
    Loader2,
    User,
    Calendar,
    Heart,
    Sparkles,
    X,
    Plus
} from 'lucide-react';
import { LocationPicker } from '@/components/ui/LocationMap';

interface OnboardingData {
    gender: string;
    name: string;
    dateOfBirth: string;
    location: {
        type: string;
        coordinates: [number, number];
    } | null;
    photos: string[];
    preferences: {
        ageRange: { min: number; max: number };
        distance: number;
        gender: string;
    };
    bio: string;
}

const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'basics', title: 'Introduce yourself' },
    { id: 'location', title: 'Location' },
    { id: 'photos', title: 'Add photos' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'complete', title: 'All set!' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        gender: '',
        name: '',
        dateOfBirth: '',
        location: null,
        photos: [],
        preferences: {
            ageRange: { min: 18, max: 35 },
            distance: 50,
            gender: 'both',
        },
        bio: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        // Pre-fill name from session
        if (session?.user?.name) {
            setData(prev => ({ ...prev, name: session.user.name || '' }));
        }
    }, [session]);

    const progress = ((currentStep + 1) / steps.length) * 100;

    async function handleNext() {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await completeOnboarding();
        }
    }

    async function handleBack() {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }

    async function requestLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData(prev => ({
                    ...prev,
                    location: {
                        type: 'Point',
                        coordinates: [position.coords.longitude, position.coords.latitude],
                    },
                }));
                setLocationLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Failed to get location. Please enable location services and try again.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true }
        );
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || data.photos.length >= 6) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { url } = await res.json();
                setData(prev => ({
                    ...prev,
                    photos: [...prev.photos, url],
                }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    }

    function removePhoto(index: number) {
        setData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index),
        }));
    }

    async function completeOnboarding() {
        setLoading(true);

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    gender: data.gender,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                    location: data.location,
                    photos: data.photos,
                    preferences: data.preferences,
                    bio: data.bio,
                    onboardingComplete: true,
                }),
            });

            if (res.ok) {
                // Use window.location for hard redirect to ensure layout re-checks user
                window.location.href = '/discover';
            } else {
                console.error('Failed to save profile');
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setLoading(false);
        }
    }

    function canProceed(): boolean {
        switch (steps[currentStep].id) {
            case 'welcome':
                return true;
            case 'basics':
                return data.gender !== '' && data.name.trim() !== '' && data.dateOfBirth !== '';
            case 'location':
                return true; // Location is now optional - can skip
            case 'photos':
                return data.photos.length >= 1;
            case 'preferences':
                return true;
            case 'complete':
                return true;
            default:
                return true;
        }
    }

    function useDefaultLocation() {
        // Default to Kathmandu coordinates for development
        setData(prev => ({
            ...prev,
            location: {
                type: 'Point',
                coordinates: [85.3240, 27.7172],
            },
        }));
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-lg">
                <div className="h-1 bg-zinc-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`p-2 rounded-full transition-colors ${currentStep === 0 ? 'text-zinc-600' : 'text-white hover:bg-zinc-800'
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-sm text-zinc-400">
                        {currentStep + 1} of {steps.length}
                    </span>
                    <div className="w-10" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-20 pb-24 px-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {/* Step: Welcome */}
                        {steps[currentStep].id === 'welcome' && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-8"
                                >
                                    <Heart className="w-12 h-12 text-white" fill="white" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-white mb-4">
                                    Welcome to NearMatch
                                </h1>
                                <p className="text-zinc-400 max-w-sm leading-relaxed">
                                    Let&apos;s set up your profile so you can start meeting amazing people nearby.
                                </p>
                            </div>
                        )}

                        {/* Step: Basics */}
                        {steps[currentStep].id === 'basics' && (
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-bold text-white text-center mb-2">
                                    Introduce yourself
                                </h2>
                                <p className="text-zinc-400 text-center mb-8">
                                    Fill out the rest of your details so people know a little more about you
                                </p>

                                {/* Gender Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                                        You are...
                                    </label>
                                    <div className="space-y-2">
                                        {['female', 'male', 'non-binary', 'other'].map((gender) => (
                                            <button
                                                key={gender}
                                                onClick={() => setData(prev => ({ ...prev, gender }))}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${data.gender === gender
                                                    ? 'border-pink-500 bg-pink-500/10'
                                                    : 'border-zinc-700 hover:border-zinc-600'
                                                    }`}
                                            >
                                                <span className="text-white capitalize">{gender}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.gender === gender ? 'border-pink-500' : 'border-zinc-600'
                                                    }`}>
                                                    {data.gender === gender && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Your first name"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                </div>

                                {/* Birthday */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Birthday
                                    </label>
                                    <input
                                        type="date"
                                        value={data.dateOfBirth}
                                        onChange={(e) => setData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                                    />
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Your age will be shown on your profile
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step: Location */}
                        {steps[currentStep].id === 'location' && (
                            <div className="max-w-md mx-auto">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4"
                                    >
                                        <MapPin className="w-8 h-8 text-white" />
                                    </motion.div>

                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        What&apos;s your location?
                                    </h2>
                                    <p className="text-zinc-400 max-w-xs">
                                        We need this to show you people nearby. Your exact location is never shown.
                                    </p>
                                </div>

                                <LocationPicker
                                    onLocationSelect={(location) => setData(prev => ({ ...prev, location }))}
                                    currentLocation={data.location}
                                />
                            </div>
                        )}

                        {/* Step: Photos */}
                        {steps[currentStep].id === 'photos' && (
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-bold text-white text-center mb-2">
                                    Add your best photos
                                </h2>
                                <p className="text-zinc-400 text-center mb-8">
                                    Add at least 1 photo to get started. You can add up to 6.
                                </p>

                                <div className="grid grid-cols-3 gap-3">
                                    {[...Array(6)].map((_, i) => {
                                        const photo = data.photos[i];
                                        return (
                                            <div
                                                key={i}
                                                className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50 relative"
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
                                                            onClick={() => removePhoto(i)}
                                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                                                        >
                                                            <X className="w-4 h-4 text-white" />
                                                        </button>
                                                        {i === 0 && (
                                                            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-[10px] text-white font-medium">
                                                                Main
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700/50 transition-colors">
                                                        {uploading && data.photos.length === i ? (
                                                            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Plus className="w-8 h-8 text-zinc-500 mb-1" />
                                                                <span className="text-xs text-zinc-500">Add</span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoUpload}
                                                            className="hidden"
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="text-center text-sm text-zinc-500 mt-4">
                                    Tip: Profiles with clear face photos get more matches!
                                </p>
                            </div>
                        )}

                        {/* Step: Preferences */}
                        {steps[currentStep].id === 'preferences' && (
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-bold text-white text-center mb-2">
                                    Who do you want to see?
                                </h2>
                                <p className="text-zinc-400 text-center mb-8">
                                    You can always change this later in settings
                                </p>

                                {/* Interested In */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                                        Interested in
                                    </label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'female', label: 'Women' },
                                            { value: 'male', label: 'Men' },
                                            { value: 'both', label: 'Everyone' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setData(prev => ({
                                                    ...prev,
                                                    preferences: { ...prev.preferences, gender: option.value }
                                                }))}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${data.preferences.gender === option.value
                                                    ? 'border-pink-500 bg-pink-500/10 text-white'
                                                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age Range */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                                        Age range: {data.preferences.ageRange.min} - {data.preferences.ageRange.max}
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="range"
                                            min="18"
                                            max="80"
                                            value={data.preferences.ageRange.min}
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                preferences: {
                                                    ...prev.preferences,
                                                    ageRange: { ...prev.preferences.ageRange, min: parseInt(e.target.value) }
                                                }
                                            }))}
                                            className="flex-1 accent-pink-500"
                                        />
                                        <span className="text-zinc-500">to</span>
                                        <input
                                            type="range"
                                            min="18"
                                            max="80"
                                            value={data.preferences.ageRange.max}
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                preferences: {
                                                    ...prev.preferences,
                                                    ageRange: { ...prev.preferences.ageRange, max: parseInt(e.target.value) }
                                                }
                                            }))}
                                            className="flex-1 accent-pink-500"
                                        />
                                    </div>
                                </div>

                                {/* Distance */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                                        Maximum distance: {data.preferences.distance} km
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={data.preferences.distance}
                                        onChange={(e) => setData(prev => ({
                                            ...prev,
                                            preferences: { ...prev.preferences, distance: parseInt(e.target.value) }
                                        }))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        About you (optional)
                                    </label>
                                    <textarea
                                        value={data.bio}
                                        onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Write something about yourself..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step: Complete */}
                        {steps[currentStep].id === 'complete' && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-8"
                                >
                                    <Sparkles className="w-12 h-12 text-white" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-white mb-4">
                                    You&apos;re all set!
                                </h1>
                                <p className="text-zinc-400 max-w-sm leading-relaxed mb-2">
                                    Your profile is ready. Start discovering amazing people near you.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800/50">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${canProceed()
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                        : 'bg-zinc-800 text-zinc-500'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Setting up...
                        </>
                    ) : currentStep === steps.length - 1 ? (
                        'Start Discovering'
                    ) : (
                        <>
                            Continue
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
