'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Heart,
    MessageSquare,
    TrendingUp,
    UserCheck,
    UserX,
    Activity
} from 'lucide-react';

interface Stats {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    newUsersToday: number;
    newUsersMonth: number;
    totalMatches: number;
    matchesToday: number;
    totalMessages: number;
    bannedUsers: number;
    verifiedUsers: number;
    genderStats: { _id: string; count: number }[];
    recentSignups: { _id: string; count: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats(data.stats);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Active Today',
            value: stats?.activeUsersToday || 0,
            icon: Activity,
            gradient: 'from-green-500 to-green-600',
        },
        {
            label: 'Total Matches',
            value: stats?.totalMatches || 0,
            icon: Heart,
            gradient: 'from-pink-500 to-purple-600',
        },
        {
            label: 'Messages Sent',
            value: stats?.totalMessages || 0,
            icon: MessageSquare,
            gradient: 'from-orange-500 to-orange-600',
        },
        {
            label: 'New This Month',
            value: stats?.newUsersMonth || 0,
            icon: TrendingUp,
            gradient: 'from-cyan-500 to-cyan-600',
        },
        {
            label: 'Verified Users',
            value: stats?.verifiedUsers || 0,
            icon: UserCheck,
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            label: 'Banned Users',
            value: stats?.bannedUsers || 0,
            icon: UserX,
            gradient: 'from-red-500 to-red-600',
        },
        {
            label: 'Matches Today',
            value: stats?.matchesToday || 0,
            icon: Heart,
            gradient: 'from-violet-500 to-violet-600',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Welcome to the NearMatch admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`} />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">{card.label}</p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender Distribution */}
                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                    <div className="flex flex-wrap gap-4">
                        {stats?.genderStats?.map((g) => (
                            <div key={g._id || 'unknown'} className="flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${g._id === 'male' ? 'bg-blue-500' :
                                            g._id === 'female' ? 'bg-pink-500' : 'bg-purple-500'
                                        }`}
                                />
                                <span className="text-zinc-300 capitalize">
                                    {g._id || 'Not specified'}: {g.count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Simple bar chart */}
                    <div className="mt-4 space-y-2">
                        {stats?.genderStats?.map((g) => {
                            const total = stats.genderStats.reduce((acc, cur) => acc + cur.count, 0);
                            const percentage = total > 0 ? (g.count / total) * 100 : 0;
                            return (
                                <div key={g._id || 'unknown'}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-zinc-400 capitalize">{g._id || 'Not specified'}</span>
                                        <span className="text-zinc-400">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${g._id === 'male' ? 'bg-blue-500' :
                                                    g._id === 'female' ? 'bg-pink-500' : 'bg-purple-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Signups */}
                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Signups (7 days)</h3>
                    <div className="flex items-end gap-2 h-40">
                        {stats?.recentSignups?.map((day) => {
                            const maxCount = Math.max(...(stats.recentSignups.map(d => d.count) || [1]));
                            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                            return (
                                <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-zinc-400">{day.count}</span>
                                    <div
                                        className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg transition-all duration-500"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                    <span className="text-xs text-zinc-500">
                                        {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
