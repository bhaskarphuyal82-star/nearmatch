'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalContentProps {
    title: string;
    content: string;
}

export function LegalContent({ title, content }: LegalContentProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" fill="white" />
                            </div>
                            <span className="font-bold">NearMatch</span>
                        </Link>
                        <Link
                            href="/"
                            className="text-sm text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="pt-32 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                            {title}
                        </h1>
                        <div className="prose prose-invert max-w-none prose-zinc lg:prose-lg prose-p:text-zinc-400 prose-headings:text-white prose-strong:text-white prose-a:text-pink-400 hover:prose-a:text-pink-300">
                            {content ? (
                                content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4">
                                        {line}
                                    </p>
                                ))
                            ) : (
                                <p className="text-zinc-500 italic">Content coming soon...</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-zinc-500">
                        © 2026 NearMatch. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
