'use client';

import { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Ban,
    CheckCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye
} from 'lucide-react';
import Image from 'next/image';

interface User {
    _id: string;
    email: string;
    name: string;
    photos: string[];
    gender?: string;
    isVerified: boolean;
    isBanned: boolean;
    role: string;
    createdAt: string;
    lastActive: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    async function fetchUsers() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search,
                status,
            });
            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination((p) => ({ ...p, page: 1 }));
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleAction(userId: string, action: 'ban' | 'unban' | 'verify' | 'delete') {
        try {
            if (action === 'delete') {
                if (!confirm('Are you sure you want to delete this user?')) return;
                await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            } else {
                const updates = {
                    ban: { isBanned: true },
                    unban: { isBanned: false },
                    verify: { isVerified: true },
                };
                await fetch(`/api/admin/users/${userId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates[action]),
                });
            }
            fetchUsers();
            setActiveMenu(null);
        } catch (error) {
            console.error('Action failed:', error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-zinc-400 mt-1">Manage all registered users</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    Total: <span className="text-white font-medium">{pagination.total.toLocaleString()}</span> users
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="pl-10 pr-8 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="verified">Verified</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left p-4 text-zinc-400 font-medium">User</th>
                                <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                                <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                                <th className="text-left p-4 text-zinc-400 font-medium">Role</th>
                                <th className="text-left p-4 text-zinc-400 font-medium">Joined</th>
                                <th className="text-left p-4 text-zinc-400 font-medium">Last Active</th>
                                <th className="text-right p-4 text-zinc-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 overflow-hidden">
                                                    {user.photos[0] ? (
                                                        <Image
                                                            src={user.photos[0]}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white font-medium">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-xs text-zinc-500 capitalize">{user.gender || 'Not set'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-300">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.isBanned ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                                        Banned
                                                    </span>
                                                ) : user.isVerified ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                    : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {new Date(user.lastActive).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                                                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                                                </button>
                                                {activeMenu === user._id && (
                                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl z-10">
                                                        <button
                                                            onClick={() => window.open(`/admin/users/${user._id}`, '_blank')}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-left text-zinc-300 hover:bg-zinc-700 transition-colors rounded-t-xl"
                                                        >
                                                            <Eye className="w-4 h-4" /> View Details
                                                        </button>
                                                        {!user.isVerified && (
                                                            <button
                                                                onClick={() => handleAction(user._id, 'verify')}
                                                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-green-400 hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Verify User
                                                            </button>
                                                        )}
                                                        {user.isBanned ? (
                                                            <button
                                                                onClick={() => handleAction(user._id, 'unban')}
                                                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-yellow-400 hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <Ban className="w-4 h-4" /> Unban User
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAction(user._id, 'ban')}
                                                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-orange-400 hover:bg-zinc-700 transition-colors"
                                                            >
                                                                <Ban className="w-4 h-4" /> Ban User
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction(user._id, 'delete')}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-400 hover:bg-zinc-700 transition-colors rounded-b-xl"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete User
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                        <p className="text-sm text-zinc-400">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-zinc-400 text-sm">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
