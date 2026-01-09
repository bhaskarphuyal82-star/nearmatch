'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, Phone, Video, MoreVertical, Smile, Image as ImageIcon, Sticker, X, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ChatAdModal } from '@/components/ui/ChatAdModal';
import { AdRenderer } from '@/components/ui/AdRenderer';
import { useToast } from '@/components/ui/Toast';

interface Message {
    _id: string;
    content: string;
    type: 'text' | 'image' | 'sticker';
    sender: {
        _id: string;
        name: string;
        photos: string[];
    };
    createdAt: string;
}

interface Match {
    id: string;
    user: {
        _id: string;
        name: string;
        photos: string[];
        lastActive: string;
        isBanned?: boolean;
    };
}

const STICKERS = [
    '👻', '🔥', '💖', '👋', '🎉', '😡', '😭', '😍',
    '🤔', '👍', '👎', '💩', '🍆', '🍑', '👀', '💯'
];

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.matchId as string;
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [match, setMatch] = useState<Match | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showStickers, setShowStickers] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const { showToast } = useToast();

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ad State
    const [showAd, setShowAd] = useState(false);
    const [messagesSent, setMessagesSent] = useState(0);
    const [adConfig, setAdConfig] = useState({ frequency: 5, html: '' });

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.ads) {
                    setAdConfig({
                        frequency: data.ads.chatAdFrequency || 5,
                        html: data.ads.adCodes?.chat || ''
                    });
                }
            })
            .catch(err => console.error('Failed to load ad config:', err));
    }, []);

    useEffect(() => {
        fetchMessages();
        fetchMatch();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [matchId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/messages?matchId=${matchId}`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMatch() {
        try {
            const res = await fetch('/api/users/matches');
            const data = await res.json();
            const currentMatch = data.matches?.find((m: Match) => m.id === matchId);
            setMatch(currentMatch);
        } catch (error) {
            console.error('Failed to fetch match:', error);
        }
    }

    async function sendMessage(content: string, type: 'text' | 'image' | 'sticker' = 'text') {
        if (!content && type === 'text') return;
        setSending(true);
        setShowStickers(false);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    content,
                    type,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) => [...prev, data.message]);

                // Ad Logic
                const newCount = messagesSent + 1;
                setMessagesSent(newCount);
                if (newCount % adConfig.frequency === 0) {
                    setShowAd(true);
                }
            } else {
                const data = await res.json();
                if (data.error) {
                    showToast(data.error, 'error');
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Don't modify new message state on error so user can retry or see it failed
        } finally {
            setSending(false);
            if (type === 'text') {
                setNewMessage('');
                inputRef.current?.focus();
            }
        }
    }

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        sendMessage(newMessage, 'text');
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // 2MB Limit
        if (file.size > 2 * 1024 * 1024) {
            showToast('File size must be less than 2MB', 'error');
            e.target.value = ''; // Reset input
            return;
        }

        setSending(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                await sendMessage(data.url, 'image');
            } else {
                showToast('Failed to upload image', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Error uploading image', 'error');
        } finally {
            setSending(false);
            e.target.value = ''; // Reset input
        }
    }

    async function handleUnmatch() {
        if (!confirm('Are you sure you want to unmatch? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/matches/${matchId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToast('Unmatched successfully', 'success');
                router.push('/messages');
            } else {
                showToast('Failed to unmatch', 'error');
            }
        } catch (error) {
            console.error('Failed to unmatch:', error);
            showToast('Something went wrong', 'error');
        }
    }

    const isOnline = match?.user?.lastActive
        ? new Date(match.user.lastActive) > new Date(Date.now() - 5 * 60 * 1000)
        : false;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-zinc-950">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-shrink-0 flex items-center gap-3 p-4 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 relative z-20"
            >
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </button>

                {match && (
                    <Link href={`/user/${match.user._id}`} className="flex items-center gap-3 flex-1">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
                                {match.user.photos[0] ? (
                                    <Image
                                        src={match.user.photos[0]}
                                        alt={match.user.name}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                        {match.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-zinc-900" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">{match.user.name}</h2>
                            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-zinc-500'}`}>
                                {isOnline ? 'Online now' : 'Offline'}
                            </p>
                        </div>
                    </Link>
                )}

                <div className="flex items-center gap-1 relative">
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <Phone className="w-5 h-5 text-zinc-400" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <Video className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    <button
                                        onClick={handleUnmatch}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-zinc-800 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Unmatch
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                    >
                        {/* Empty state content */}
                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            Start the conversation
                        </h3>
                        <p className="text-zinc-400 text-sm">Say hi to {match?.user.name}!</p>
                    </motion.div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                            const isOwn = message.sender._id === session?.user?.id;
                            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender._id !== message.sender._id);
                            const isLast = index === messages.length - 1 || messages[index + 1]?.sender._id !== message.sender._id;

                            return (
                                <div key={message._id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
                                    >
                                        {!isOwn && (
                                            <div className="w-7 flex-shrink-0">
                                                {showAvatar && match?.user.photos[0] ? (
                                                    <Link href={`/user/${match.user._id}`} className="block w-7 h-7 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
                                                        <Image
                                                            src={match.user.photos[0]}
                                                            alt={match.user.name}
                                                            width={28}
                                                            height={28}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </Link>
                                                ) : null}
                                            </div>
                                        )}

                                        <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                                            {message.type === 'text' && (
                                                <div
                                                    className={`px-4 py-2.5 ${isOwn
                                                        ? `bg-gradient-to-r from-pink-500 to-purple-600 text-white ${isLast ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                                                        : `bg-zinc-800/80 text-white ${isLast ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                                                        }`}
                                                >
                                                    <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                                                </div>
                                            )}

                                            {message.type === 'image' && (
                                                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                                                    <Image
                                                        src={message.content}
                                                        alt="Sent image"
                                                        width={300}
                                                        height={300}
                                                        className="w-full h-auto max-w-[250px] object-cover"
                                                    />
                                                </div>
                                            )}

                                            {message.type === 'sticker' && (
                                                <div className="text-6xl p-2 hover:scale-110 transition-transform cursor-pointer">
                                                    {message.content}
                                                </div>
                                            )}

                                            {isLast && (
                                                <p className={`text-[10px] text-zinc-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Inline Ad Banner every 5 messages */}
                                    {(index + 1) % 5 === 0 && adConfig.html && (
                                        <div className="my-6 flex justify-center">
                                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 max-w-full overflow-hidden">
                                                <p className="text-[10px] text-zinc-500 text-center mb-2 uppercase tracking-wider">Sponsored</p>
                                                <AdRenderer html={adConfig.html} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Sticker Picker */}
            <AnimatePresence>
                {showStickers && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="h-48 bg-zinc-900 border-t border-zinc-800 p-4 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-zinc-400 text-sm font-semibold">Stickers</h3>
                            <button onClick={() => setShowStickers(false)}>
                                <X className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                        <div className="grid grid-cols-8 gap-4">
                            {STICKERS.map((sticker) => (
                                <button
                                    key={sticker}
                                    onClick={() => sendMessage(sticker, 'sticker')}
                                    className="text-3xl hover:scale-125 transition-transform"
                                >
                                    {sticker}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input - Hidden if user is banned */}
            {match?.user?.isBanned ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-shrink-0 p-4 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50 relative z-20"
                >
                    <div className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium">
                        This user is currently unavailable.
                    </div>
                </motion.div>
            ) : (
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSend}
                    className="flex-shrink-0 p-4 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50 relative z-20"
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending}
                            className="p-2.5 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <ImageIcon className="w-5 h-5 text-pink-400" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowStickers(!showStickers)}
                            className="p-2.5 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <Sticker className="w-5 h-5 text-yellow-400" />
                        </button>

                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onFocus={() => setShowStickers(false)}
                                placeholder="Type a message..."
                                className="w-full px-4 py-3 pr-12 rounded-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-700 rounded-full transition-colors"
                            >
                                <Smile className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25 transition-opacity"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 text-white ml-0.5" />
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            )}

            <ChatAdModal
                isOpen={showAd}
                onClose={() => setShowAd(false)}
                html={adConfig.html}
            />
        </div>
    );
}
