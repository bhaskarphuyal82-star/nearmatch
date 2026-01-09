'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Match {
    _id: string;
    users: {
        _id: string;
        name: string;
        email: string;
        photos: string[];
    }[];
    matchedAt: string;
    isActive: boolean;
}

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/matches')
            .then(res => res.json())
            .then(data => setMatches(data.matches || []))
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
            <h1 className="text-2xl font-bold text-white mb-6">Matches ({matches.length})</h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercas">
                        <tr>
                            <th className="p-4">User 1</th>
                            <th className="p-4">User 2</th>
                            <th className="p-4">Matched At</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                        {matches.map(match => (
                            <tr key={match._id} className="hover:bg-zinc-800/30">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                                            {match.users[0]?.photos?.[0] && (
                                                <Image src={match.users[0].photos[0]} alt="" width={32} height={32} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{match.users[0]?.name}</div>
                                            <div className="text-xs text-zinc-500">{match.users[0]?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                                            {match.users[1]?.photos?.[0] && (
                                                <Image src={match.users[1].photos[0]} alt="" width={32} height={32} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{match.users[1]?.name}</div>
                                            <div className="text-xs text-zinc-500">{match.users[1]?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {new Date(match.matchedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {match.isActive ? 'Active' : 'Diff'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
