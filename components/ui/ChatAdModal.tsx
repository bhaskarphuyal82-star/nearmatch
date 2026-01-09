'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AdRenderer } from './AdRenderer';

interface ChatAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    html?: string;
}

export function ChatAdModal({ isOpen, onClose, html }: ChatAdModalProps) {
    const [timeLeft, setTimeLeft] = useState(5);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(5);
            setCanClose(false);
        }
    }, [isOpen]);

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
                        <span className="text-xs font-bold text-blue-500 border border-blue-500/50 px-2 py-0.5 rounded">
                            SPONSORED
                        </span>
                        {canClose ? (
                            <button
                                onClick={onClose}
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
                    <div className="bg-zinc-800 min-h-[300px] flex items-center justify-center overflow-auto p-4">
                        {html ? (
                            <AdRenderer html={html} />
                        ) : (
                            <div className="text-center text-zinc-500 p-8">
                                <p className="text-sm">Advertisement</p>
                                <p className="text-xs mt-2">No ad code configured</p>
                            </div>
                        )}
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
