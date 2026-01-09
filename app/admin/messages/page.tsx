'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    match: {
        _id: string;
        users: { name: string }[];
    };
    createdAt: string;
    type: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/messages')
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Recent Messages (Last 100)</h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Sender</th>
                            <th className="p-4">Content</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                        {messages.map(message => (
                            <tr key={message._id} className="hover:bg-zinc-800/30">
                                <td className="p-4">
                                    <div className="font-medium text-white">{message.sender?.name}</div>
                                    <div className="text-xs text-zinc-500">{message.sender?.email}</div>
                                </td>
                                <td className="p-4 max-w-md truncate">
                                    {message.type === 'image' ? '[Image]' :
                                        message.type === 'sticker' ? `[Sticker: ${message.content}]` :
                                            message.content}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">
                                        {message.type || 'text'}
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-500">
                                    {new Date(message.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
