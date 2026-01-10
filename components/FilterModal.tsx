'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';

interface FilterState {
    gender: string;
    ageRange: number[];
    distance: number;
    onlineOnly: boolean;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
    currentLocationName: string;
    onLocationClick: () => void;
}

export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    currentLocationName,
    onLocationClick
}: FilterModalProps) {
    const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters);

    // Reset temp filters when modal opens or initialFilters change
    useEffect(() => {
        if (isOpen) {
            setTempFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);

    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-md border-t sm:border border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-white">Filter People</h3>
                            <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-white">
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
                                            onClick={() => setTempFilters(prev => ({ ...prev, gender: g }))}
                                            className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${tempFilters.gender === g
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                                : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
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
                                    <span className="text-pink-500 font-bold">{tempFilters.ageRange[0]} - {tempFilters.ageRange[1]}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1 uppercase tracking-tighter">
                                            <span>Min Age</span>
                                            <span>{tempFilters.ageRange[0]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="18"
                                            max="80"
                                            value={tempFilters.ageRange[0]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempFilters(prev => ({ ...prev, ageRange: [val, Math.max(val, prev.ageRange[1])] }))
                                            }}
                                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1 uppercase tracking-tighter">
                                            <span>Max Age</span>
                                            <span>{tempFilters.ageRange[1]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="18"
                                            max="80"
                                            value={tempFilters.ageRange[1]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setTempFilters(prev => ({ ...prev, ageRange: [Math.min(val, prev.ageRange[0]), val] }))
                                            }}
                                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Distance */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-medium text-zinc-400 tracking-wider uppercase">Max Distance</label>
                                    <span className="text-pink-500 font-bold">{tempFilters.distance} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    value={tempFilters.distance}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setTempFilters(prev => ({ ...prev, distance: val }))
                                    }}
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
                                        <p className="text-xs text-zinc-500">Only show users active recently</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTempFilters(prev => ({ ...prev, onlineOnly: !prev.onlineOnly }))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${tempFilters.onlineOnly ? 'bg-pink-500' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${tempFilters.onlineOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Location Selector Row */}
                            <div
                                onClick={onLocationClick}
                                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 cursor-pointer hover:bg-zinc-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Location</p>
                                        <p className="text-xs text-zinc-500">{currentLocationName}</p>
                                    </div>
                                </div>
                                <span className="text-pink-500 text-sm font-bold">Change</span>
                            </div>
                        </div>

                        <button
                            onClick={handleApply}
                            className="mt-10 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-lg active:scale-95 transition-all shadow-xl shadow-pink-500/20"
                        >
                            Apply Filters
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
