'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { AdRenderer } from './AdRenderer';

export function InterstitialAd() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [canClose, setCanClose] = useState(false);
    const [config, setConfig] = useState<{
        enabled: boolean;
        interval: number;
        html?: string;
    } | null>(null);

    useEffect(() => {
        // Fetch ad config
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.ads) {
                    setConfig({
                        enabled: data.ads.interstitialEnabled,
                        interval: data.ads.interstitialInterval,
                        html: data.ads.adCodes?.interstitial
                    });
                }
            })
            .catch(err => console.error('Failed to load ad config:', err));
    }, []);

    useEffect(() => {
        if (!config?.enabled) return;

        // Check interval every minute
        const checkInterval = setInterval(() => {
            checkAdStatus();
        }, 60000); // Check every minute

        // Initial check
        checkAdStatus();

        return () => clearInterval(checkInterval);
    }, [pathname, config]); // Re-check when path or config changes

    function checkAdStatus() {
        if (!config?.enabled) return;

        // Only show ads on specific pages
        const allowedPaths = ['/discover', '/matches', '/messages', '/chat'];
        const isAllowedPage = allowedPaths.some(path => pathname?.startsWith(path));

        if (!isAllowedPage) return;

        const lastAdTime = localStorage.getItem('lastInterstitialAd');
        const now = Date.now();
        const intervalMs = config.interval * 60 * 1000;

        if (!lastAdTime || now - parseInt(lastAdTime) > intervalMs) {
            showAd();
        }
    }

    function showAd() {
        setIsOpen(true);
        setTimeLeft(5);
        setCanClose(false);

        // Update timestamp immediately so it doesn't trigger again soon
        localStorage.setItem('lastInterstitialAd', Date.now().toString());
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isOpen && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isOpen, timeLeft]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            >
                <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <span className="text-xs font-bold text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded">
                            AD
                        </span>
                        {canClose ? (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        ) : (
                            <span className="text-xs text-zinc-500 font-mono">
                                Close in {timeLeft}s
                            </span>
                        )}
                    </div>

                    {/* Ad Content */}
                    {/* Ad Content */}
                    {config?.html ? (
                        <div className="bg-zinc-800 min-h-[300px] flex items-center justify-center overflow-auto">
                            <AdRenderer html={config.html} />
                        </div>
                    ) : (
                        <div className="aspect-[4/5] bg-zinc-800 relative group cursor-pointer" onClick={() => window.open('https://google.com', '_blank')}>
                            {/* Placeholder Image */}
                            <img
                                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"
                                alt="Advertisement"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />

                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent p-6">
                                <div className="mt-auto text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">Google Pixel 9</h3>
                                    <p className="text-sm text-zinc-300 mb-4">The only phone with Gemini Nano built in.</p>
                                    <button className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center gap-2 mx-auto">
                                        Learn More <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-3 bg-zinc-950 flex justify-center">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Sponsored Advertisement</p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
