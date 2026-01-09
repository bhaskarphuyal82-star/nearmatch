'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, Award } from 'lucide-react';
import { AdRenderer } from './AdRenderer';

interface VideoAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReward: () => void;
}

export function VideoAdModal({ isOpen, onClose, onReward }: VideoAdModalProps) {
    const [timeLeft, setTimeLeft] = useState(15);
    const [canSkip, setCanSkip] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [adCode, setAdCode] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Fetch ad config
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.ads?.adCodes?.reward) {
                    setAdCode(data.ads.adCodes.reward);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setTimeLeft(15);
            setCanSkip(false);
            setCompleted(false);

            if (adCode) {
                setIsPlaying(true); // Auto-start timer for HTML ads
            } else {
                setIsPlaying(true);
                if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(() => setIsPlaying(false));
                }
            }
        }
    }, [isOpen, adCode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isOpen && isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanSkip(true);
                        setCompleted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isOpen, isPlaying, timeLeft]);

    function handleClose() {
        if (!canSkip && !confirm('Close video? You will lose your reward.')) {
            return;
        }

        if (completed) {
            onReward();
        }
        onClose();
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white backdrop-blur-md"
                >
                    {canSkip ? <X className="w-6 h-6" /> : <span className="text-xs font-bold px-2">Reward in {timeLeft}s</span>}
                </button>

                {/* Video Player */}
                <div className="relative w-full h-full md:h-auto md:aspect-video md:max-w-4xl bg-black">
                    {!isPlaying && !completed && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                            <button
                                onClick={() => {
                                    setIsPlaying(true);
                                    videoRef.current?.play();
                                }}
                                className="p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                            >
                                <Play className="w-12 h-12 text-white fill-current" />
                            </button>
                        </div>
                    )}

                    {completed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-8 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-center"
                            >
                                <Award className="w-16 h-16 text-white mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Reward Unlocked!</h3>
                                <p className="text-white/90 mb-6">You've earned 15 minutes of Profile Boost.</p>
                                <button
                                    onClick={handleClose}
                                    className="px-8 py-3 rounded-xl bg-white text-pink-600 font-bold hover:bg-zinc-100 transition-colors"
                                >
                                    Claim Reward
                                </button>
                            </motion.div>
                        </div>
                    )}

                    {/* Ad Content */}
                    {adCode ? (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center p-4 overflow-auto min-h-[300px]">
                            <AdRenderer html={adCode} />
                        </div>
                    ) : (
                        <>
                            {/* Simulated Ad Content (using a scenic placeholder video) */}
                            <video
                                ref={videoRef}
                                src="https://videos.pexels.com/video-files/855564/855564-sd_640_360_24fps.mp4"
                                className="w-full h-full object-contain"
                                playsInline
                                onEnded={() => setCompleted(true)}
                                onClick={() => {
                                    // Simulate click-through
                                    window.open('https://google.com', '_blank');
                                }}
                            />

                            {/* Ad UI Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-black text-xs">AD</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">Sponsored Content</p>
                                        <p className="text-white/70 text-xs">Visit advertiser to learn more</p>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold pointer-events-auto">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
