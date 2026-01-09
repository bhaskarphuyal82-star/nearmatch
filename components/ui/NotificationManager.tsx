'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check, Loader2 } from 'lucide-react';

interface NotificationManagerProps {
    onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

export function NotificationManager({ onSubscriptionChange }: NotificationManagerProps) {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [serviceWorker, setServiceWorker] = useState<ServiceWorkerRegistration | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        setPermission(Notification.permission);

        // Register service worker
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            setServiceWorker(registration);

            // Check existing subscription
            registration.pushManager.getSubscription().then((sub) => {
                setSubscription(sub);
                onSubscriptionChange?.(sub);
            });
        });

        // Show banner after delay if not yet asked
        if (Notification.permission === 'default') {
            setTimeout(() => setShowBanner(true), 10000);
        }
    }, [onSubscriptionChange]);

    const requestPermission = useCallback(async () => {
        if (!serviceWorker) return;

        setLoading(true);

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Subscribe to push notifications
                const sub = await serviceWorker.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                    ) as any,
                });

                setSubscription(sub);
                onSubscriptionChange?.(sub);

                // Send subscription to backend
                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sub.toJSON()),
                });

                setShowBanner(false);
            }
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setLoading(false);
        }
    }, [serviceWorker, onSubscriptionChange]);

    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        setLoading(true);

        try {
            await subscription.unsubscribe();
            setSubscription(null);
            onSubscriptionChange?.(null);

            // Notify backend
            await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        } finally {
            setLoading(false);
        }
    }, [subscription, onSubscriptionChange]);

    // SSR safety
    if (!mounted) return null;

    // Don't show if notifications not supported
    if (!('Notification' in window)) return null;

    return (
        <>
            {/* Notification Permission Banner */}
            <AnimatePresence>
                {showBanner && permission === 'default' && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-0 left-0 right-0 z-[100] p-4 bg-gradient-to-r from-pink-600 to-purple-600"
                    >
                        <div className="max-w-lg mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-white" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm">Enable notifications</p>
                                    <p className="text-pink-100 text-xs truncate">Get notified about new matches and messages</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setShowBanner(false)}
                                    className="p-2 text-pink-200 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={requestPermission}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-white text-pink-600 font-medium text-sm hover:bg-pink-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Enable
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Inline notification toggle for settings
export function NotificationToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            setLoading(false);
            return;
        }

        navigator.serviceWorker.ready.then((registration) => {
            registration.pushManager.getSubscription().then((sub) => {
                setEnabled(!!sub);
                setLoading(false);
            });
        });
    }, []);

    async function toggleNotifications() {
        if (!('Notification' in window)) return;

        setLoading(true);

        try {
            if (enabled) {
                // Unsubscribe
                const registration = await navigator.serviceWorker.ready;
                const sub = await registration.pushManager.getSubscription();
                if (sub) {
                    await sub.unsubscribe();
                    await fetch('/api/notifications/unsubscribe', { method: 'POST' });
                }
                setEnabled(false);
            } else {
                // Subscribe
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const registration = await navigator.serviceWorker.ready;
                    const sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(
                            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                        ) as any,
                    });
                    await fetch('/api/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sub.toJSON()),
                    });
                    setEnabled(true);
                }
            }
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) {
        return <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 h-[74px]" />;
    }

    if (!('Notification' in window)) {
        return (
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-3">
                    <BellOff className="w-5 h-5 text-zinc-500" />
                    <div>
                        <p className="text-zinc-400 text-sm">Notifications not supported</p>
                        <p className="text-xs text-zinc-500">Your browser doesn&apos;t support push notifications</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-pink-500/20' : 'bg-zinc-700'}`}>
                    {enabled ? (
                        <Bell className="w-5 h-5 text-pink-400" />
                    ) : (
                        <BellOff className="w-5 h-5 text-zinc-400" />
                    )}
                </div>
                <div>
                    <p className="text-white text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-zinc-500">Get notified about matches & messages</p>
                </div>
            </div>
            <button
                onClick={toggleNotifications}
                disabled={loading}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-pink-500' : 'bg-zinc-600'
                    }`}
            >
                {loading ? (
                    <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
                ) : (
                    <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                            }`}
                    />
                )}
            </button>
        </div>
    );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
