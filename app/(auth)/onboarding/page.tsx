'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    MapPin,
    User,
    Briefcase,
    Heart,
    Activity,
    Camera,
    Sparkles,
    Loader2,
    ArrowLeft,
    X,
    Plus
} from 'lucide-react';
import { LocationPicker } from '@/components/ui/LocationMap'; // Ensure this component exists and handles map logic

// --- Types ---
interface Lifestyle {
    smoking: string;
    drinking: string;
    workout: string;
    diet: string;
    pets: string;
}

interface OnboardingData {
    // Basic Info
    name: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;

    // Interests
    interests: string[];

    // Physical & Preferences
    height: string;
    weight: string;
    relationshipGoal: string;
    preferences: {
        ageRange: { min: number; max: number };
        gender: string;
        distance: number;
    };

    // Lifestyle
    lifestyle: Lifestyle;

    // Location
    location: {
        type: string;
        coordinates: [number, number];
    } | null;

    // Career & About
    jobTitle: string;
    company: string;
    educationLevel: string;
    university: string;
    bio: string;

    // Photos
    photos: string[];
}

const steps = [
    { id: 'basic', title: 'Basic Info', icon: User, completed: false },
    { id: 'interests', title: 'Interests', icon: Heart, completed: false },
    { id: 'physical', title: 'Physical & Preferences', icon: Activity, completed: false },
    { id: 'lifestyle', title: 'Lifestyle', icon: Sparkles, completed: false },
    { id: 'location', title: 'Location', icon: MapPin, completed: false },
    { id: 'career', title: 'Career & About', icon: Briefcase, completed: false },
    { id: 'photos', title: 'Photos', icon: Camera, completed: false },
];

const interestOptions = [
    { label: 'Travel', icon: '✈️' },
    { label: 'Music', icon: '🎵' },
    { label: 'Movies', icon: '🎬' },
    { label: 'Sports', icon: '⚽' },
    { label: 'Reading', icon: '📚' },
    { label: 'Cooking', icon: '👨‍🍳' },
    { label: 'Art', icon: '🎨' },
    { label: 'Photography', icon: '📸' },
    { label: 'Dancing', icon: '💃' },
    { label: 'Hiking', icon: '🥾' },
    { label: 'Gaming', icon: '🎮' },
    { label: 'Fitness', icon: '💪' },
    { label: 'Fashion', icon: '👗' },
    { label: 'Technology', icon: '💻' },
    { label: 'Food', icon: '🍕' },
    { label: 'Animals', icon: '🐕' },
    { label: 'Yoga', icon: '🧘' },
    { label: 'Coffee', icon: '☕' },
    { label: 'Wine', icon: '🍷' },
    { label: 'Beach', icon: '🏖️' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initial State
    const [data, setData] = useState<OnboardingData>({
        name: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        interests: [],
        height: '',
        weight: '',
        relationshipGoal: '',
        preferences: {
            ageRange: { min: 18, max: 35 },
            gender: 'both', // existing default
            distance: 50,
        },
        lifestyle: {
            smoking: '',
            drinking: '',
            workout: '',
            diet: '',
            pets: '',
        },
        location: null,
        jobTitle: '',
        company: '',
        educationLevel: '',
        university: '',
        bio: '',
        photos: [],
    });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (session?.user?.name) {
            setData((prev) => ({ ...prev, name: session.user.name || '' }));
        }
    }, [status, session]);

    // Calculate Progress %
    const progress = Math.round(((currentStep + 1) / steps.length) * 100);

    // --- Actions ---

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            await completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    onboardingComplete: true,
                    ...data,
                    // Ensure date is valid object if set
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                }),
            });

            if (res.ok) {
                window.location.href = '/discover';
            } else {
                console.error('Failed to save profile');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Validation Helper ---
    const canProceed = () => {
        const stepId = steps[currentStep].id;
        switch (stepId) {
            case 'basic':
                return data.name && data.dateOfBirth && data.gender && data.phoneNumber;
            case 'interests':
                return data.interests.length > 0;
            case 'physical':
                // Optional or mandatory? Let's make some mandatory based on UI typical patterns
                // But for now, returning true to not block if user wants to skip optional fields
                // Assuming height/weight/goal might be optional. 
                // Let's make relationshipGoal mandatory if possible
                return true;
            case 'photos':
                return data.photos.length >= 2; // Require at least 2 photos? Or 1? Image shows "Incomplete"
            default:
                return true;
        }
    };

    // --- Sub-components for Form Sections ---

    const BasicInfo = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Full Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Birthday</label>
                    <input
                        type="date"
                        value={data.dateOfBirth}
                        onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Gender</label>
                <select
                    value={data.gender}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium appearance-none"
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Phone Number</label>
                <input
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-2 border-zinc-900 focus:ring-0 text-zinc-900 font-medium"
                    placeholder="+1 234 567 8900"
                />
            </div>
        </div>
    );

    const Interests = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900">What are you passionate about?</h2>
                <p className="text-zinc-500">Select up to 8 interests that represent you</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interestOptions.map((option) => {
                    const isSelected = data.interests.includes(option.label);
                    return (
                        <button
                            key={option.label}
                            onClick={() => {
                                if (isSelected) {
                                    setData({ ...data, interests: data.interests.filter((i) => i !== option.label) });
                                } else {
                                    if (data.interests.length < 8) {
                                        setData({ ...data, interests: [...data.interests, option.label] });
                                    }
                                }
                            }}
                            className={`flex items-center justify-center gap-2 p-3 rounded-full border transition-all ${isSelected
                                    ? 'border-pink-500 bg-pink-50 text-pink-600 font-semibold'
                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                                }`}
                        >
                            <span>{option.icon}</span>
                            <span className="text-sm">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const PhysicalPreferences = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Height</label>
                    <select
                        value={data.height}
                        onChange={(e) => setData({ ...data, height: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none text-zinc-900"
                    >
                        <option value="">Select</option>
                        {Array.from({ length: 40 }, (_, i) => i + 140).map(cm => (
                            <option key={cm} value={`${cm} cm`}>{cm} cm</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Weight</label>
                    <select
                        value={data.weight}
                        onChange={(e) => setData({ ...data, weight: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none text-zinc-900"
                    >
                        <option value="">Select</option>
                        {Array.from({ length: 100 }, (_, i) => i + 40).map(kg => (
                            <option key={kg} value={`${kg} kg`}>{kg} kg</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-3">What are you looking for?</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Long-term relationship', 'Something casual', 'New friends', 'Still figuring it out'].map(goal => (
                        <button
                            key={goal}
                            onClick={() => setData({ ...data, relationshipGoal: goal })}
                            className={`p-4 rounded-xl border text-left transition-all ${data.relationshipGoal === goal
                                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white border-transparent shadow-lg shadow-pink-500/20'
                                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            <span className="font-medium text-sm">{goal}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-3">Age Range Preference</label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-zinc-400 mb-1 block">Min Age</label>
                        <input
                            type="number"
                            value={data.preferences.ageRange.min}
                            onChange={(e) => setData({
                                ...data,
                                preferences: { ...data.preferences, ageRange: { ...data.preferences.ageRange, min: parseInt(e.target.value) } }
                            })}
                            className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-200"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-zinc-400 mb-1 block">Max Age</label>
                        <input
                            type="number"
                            value={data.preferences.ageRange.max}
                            onChange={(e) => setData({
                                ...data,
                                preferences: { ...data.preferences, ageRange: { ...data.preferences.ageRange, max: parseInt(e.target.value) } }
                            })}
                            className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const LifestyleSection = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900">Tell us about your lifestyle</h2>
                <p className="text-zinc-500">This helps us find compatible matches</p>
            </div>

            {[
                { key: 'smoking', label: 'Smoking', options: ['Never', 'Socially', 'Regularly', 'Trying to quit'], icon: '🚬' },
                { key: 'drinking', label: 'Drinking', options: ['Never', 'Socially', 'Regularly'], icon: '🍷' },
                { key: 'workout', label: 'Workout', options: ['Never', 'Sometimes', 'Regularly', 'Athlete'], icon: '💪' },
                { key: 'diet', label: 'Diet', options: ['None', 'Vegan', 'Vegetarian', 'Keto'], icon: '🥗' },
                { key: 'pets', label: 'Pets', options: ['No pets', 'Dog lover', 'Cat lover', 'Other'], icon: '🐾' }
            ].map((item) => (
                <div key={item.key}>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 flex items-center gap-1">
                        {item.icon} {item.label}
                    </label>
                    <select
                        value={(data.lifestyle as any)[item.key]}
                        onChange={(e) => setData({
                            ...data,
                            lifestyle: { ...data.lifestyle, [item.key]: e.target.value }
                        })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 font-medium appearance-none"
                    >
                        <option value="">Select option</option>
                        {item.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );

    const LocationSection = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <MapPin className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900">Where are you located?</h2>
                <p className="text-zinc-500">We use this to find matches near you.</p>
            </div>
            <div className="h-64 rounded-2xl overflow-hidden border border-zinc-200">
                <LocationPicker
                    currentLocation={data.location}
                    onLocationSelect={(loc) => setData({ ...data, location: loc })}
                />
            </div>
            <p className="text-center text-xs text-zinc-400">
                Your exact location will not be shared with others.
            </p>
        </div>
    );

    const CareerSection = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <Briefcase className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900">Tell us about yourself</h2>
                <p className="text-zinc-500">Your career, education, and a short bio</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Job Title</label>
                    <input
                        type="text"
                        value={data.jobTitle}
                        onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                        placeholder="Software Engineer"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Company</label>
                    <input
                        type="text"
                        value={data.company}
                        onChange={(e) => setData({ ...data, company: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                        placeholder="Google"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Education Level</label>
                    <select
                        value={data.educationLevel}
                        onChange={(e) => setData({ ...data, educationLevel: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                    >
                        <option value="">Select</option>
                        <option value="High School">High School</option>
                        <option value="Undergrad">Undergrad</option>
                        <option value="Postgrad">Postgrad</option>
                        <option value="Doctorate">Doctorate</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">University / College</label>
                    <input
                        type="text"
                        value={data.university}
                        onChange={(e) => setData({ ...data, university: e.target.value })}
                        className="w-full p-4 bg-zinc-50 rounded-xl border-none"
                        placeholder="Stanford University"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Short Bio</label>
                <textarea
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    rows={4}
                    className="w-full p-4 bg-zinc-50 rounded-xl border-none resize-none"
                    placeholder="Write a short bio about yourself..."
                />
            </div>
        </div>
    );

    const PhotosSection = () => {
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
                    setData(prev => ({ ...prev, photos: [...prev.photos, url] }));
                }
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }

        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <Camera className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-zinc-900">Add your best photos</h2>
                    <p className="text-zinc-500">Add at least 2 photos to get started</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-100 relative overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-200 hover:border-pink-300 transition-colors">
                            {data.photos[i] ? (
                                <>
                                    <Image src={data.photos[i]} alt="User photo" fill className="object-cover" />
                                    <button
                                        onClick={() => setData({ ...data, photos: data.photos.filter((_, idx) => idx !== i) })}
                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                    {uploading && i === data.photos.length ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                                    ) : (
                                        <Plus className="w-8 h-8 text-zinc-300" />
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading || i !== data.photos.length} />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-pink-50">
            {/* Sidebar */}
            <div className="hidden lg:flex flex-col w-80 bg-gradient-to-b from-pink-500 to-rose-600 p-8 text-white fixed h-full z-10">
                <div className="mb-10">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        Back home
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-bold">{progress}%</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                        ? 'bg-white/20 backdrop-blur-sm'
                                        : 'opacity-70'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-400 text-white' : 'bg-white/20 text-white'
                                    }`}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{step.title}</h3>
                                    <p className="text-xs text-white/60">{isCompleted ? 'Completed' : 'Incomplete'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:pl-80">
                <div className="w-full max-w-2xl mx-auto py-12 px-6">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl shadow-xl p-8 min-h-[600px] relative"
                    >
                        <AnimatePresence mode="wait">
                            {currentStep === 0 && <BasicInfo key="basic" />}
                            {currentStep === 1 && <Interests key="interests" />}
                            {currentStep === 2 && <PhysicalPreferences key="physical" />}
                            {currentStep === 3 && <LifestyleSection key="lifestyle" />}
                            {currentStep === 4 && <LocationSection key="location" />}
                            {currentStep === 5 && <CareerSection key="career" />}
                            {currentStep === 6 && <PhotosSection key="photos" />}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-zinc-100">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                            )}
                            <div className="ml-auto"> {/* Pushes Next button to the right if Previous is the only button */}
                                <button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            {currentStep === steps.length - 1 ? 'Finish Profile' : 'Next'}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
