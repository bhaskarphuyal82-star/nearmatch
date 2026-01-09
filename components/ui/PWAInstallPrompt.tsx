'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
            return;
        }

        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            // Show again after 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return;
            }
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
        setIsIOS(isIOSDevice);

        // Listen for beforeinstallprompt event (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a delay
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show manual instructions after delay
        if (isIOSDevice) {
            setTimeout(() => setShowPrompt(true), 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    async function handleInstall() {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    }

    function handleDismiss() {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }

    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
                <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl shadow-pink-500/10 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Install NearMatch</h3>
                                <p className="text-xs text-zinc-400">Get the app experience</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4 space-y-1">
                        <p className="text-sm text-zinc-300">✓ Works offline</p>
                        <p className="text-sm text-zinc-300">✓ Push notifications</p>
                        <p className="text-sm text-zinc-300">✓ Faster loading</p>
                    </div>

                    {/* Action */}
                    {isIOS ? (
                        <div className="bg-zinc-800/50 rounded-xl p-3">
                            <p className="text-sm text-zinc-300 mb-2">To install on iOS:</p>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="flex items-center gap-1">
                                    1. Tap <Share className="w-4 h-4" />
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                                <span className="flex items-center gap-1">
                                    2. Select &quot;Add to Home Screen&quot; <Plus className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstall}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-500/25 transition-shadow"
                        >
                            <Download className="w-5 h-5" />
                            Install App
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
