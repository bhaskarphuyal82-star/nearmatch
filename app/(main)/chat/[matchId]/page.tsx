'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, Phone, Video, MoreVertical, Smile, Image as ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ChatAdModal } from '@/components/ui/ChatAdModal';

interface Message {
    _id: string;
    content: string;
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
    };
}

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ad State
    const [showAd, setShowAd] = useState(false);
    const [messagesSent, setMessagesSent] = useState(0);
    const [adConfig, setAdConfig] = useState({ frequency: 5, html: '' });

    useEffect(() => {
        // Fetch ad config
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const tempMessage = newMessage;
        setNewMessage('');
        setSending(true);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    content: tempMessage,
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
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(tempMessage);
        } finally {
            setSending(false);
            inputRef.current?.focus();
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
                className="flex-shrink-0 flex items-center gap-3 p-4 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50"
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

                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <Phone className="w-5 h-5 text-zinc-400" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <Video className="w-5 h-5 text-zinc-400" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <MoreVertical className="w-5 h-5 text-zinc-400" />
                    </button>
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
                        {match && (
                            <>
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
                                    {match.user.photos[0] ? (
                                        <Image
                                            src={match.user.photos[0]}
                                            alt={match.user.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                            {match.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    You matched with {match.user.name}!
                                </h3>
                                <p className="text-zinc-400 text-sm">Say something nice to start the conversation 💕</p>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                            const isOwn = message.sender._id === session?.user?.id;
                            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender._id !== message.sender._id);
                            const isLast = index === messages.length - 1 || messages[index + 1]?.sender._id !== message.sender._id;

                            return (
                                <motion.div
                                    key={message._id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
                                >
                                    {!isOwn && (
                                        <div className="w-7 flex-shrink-0">
                                            {showAvatar && match?.user.photos[0] ? (
                                                <div className="w-7 h-7 rounded-full overflow-hidden">
                                                    <Image
                                                        src={match.user.photos[0]}
                                                        alt={match.user.name}
                                                        width={28}
                                                        height={28}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                                        <div
                                            className={`px-4 py-2.5 ${isOwn
                                                ? `bg-gradient-to-r from-pink-500 to-purple-600 text-white ${isLast ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                                                : `bg-zinc-800/80 text-white ${isLast ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                                                }`}
                                        >
                                            <p className="text-[15px] leading-relaxed">{message.content}</p>
                                        </div>
                                        {isLast && (
                                            <p className={`text-[10px] text-zinc-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSend}
                className="flex-shrink-0 p-4 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50"
            >
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2.5 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-zinc-400" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
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

            <ChatAdModal
                isOpen={showAd}
                onClose={() => setShowAd(false)}
                html={adConfig.html}
            />
        </div>
    );
}
