'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface Settings {
    maxDistance: number;
    minAge: number;
    maxAge: number;
    maxPhotos: number;
    reportThreshold: number;
    maintenanceMode: boolean;
}

const defaultSettings: Settings = {
    maxDistance: 100,
    minAge: 18,
    maxAge: 100,
    maxPhotos: 6,
    reportThreshold: 3,
    maintenanceMode: false,
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                setSettings({ ...defaultSettings, ...data.settings });
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                throw new Error('Failed to save');
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-zinc-400 mt-1">Configure app-wide settings</p>
            </div>

            {/* Settings Form */}
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-6">
                {/* Max Distance */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Maximum Search Distance (km)
                    </label>
                    <input
                        type="number"
                        value={settings.maxDistance}
                        onChange={(e) => setSettings({ ...settings, maxDistance: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Maximum distance users can set for finding matches</p>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Minimum Age
                        </label>
                        <input
                            type="number"
                            value={settings.minAge}
                            onChange={(e) => setSettings({ ...settings, minAge: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Maximum Age
                        </label>
                        <input
                            type="number"
                            value={settings.maxAge}
                            onChange={(e) => setSettings({ ...settings, maxAge: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Max Photos */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Maximum Photos per Profile
                    </label>
                    <input
                        type="number"
                        value={settings.maxPhotos}
                        onChange={(e) => setSettings({ ...settings, maxPhotos: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                </div>

                {/* Report Threshold */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Auto-ban Report Threshold
                    </label>
                    <input
                        type="number"
                        value={settings.reportThreshold}
                        onChange={(e) => setSettings({ ...settings, reportThreshold: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Number of reports before a user is automatically banned</p>
                </div>

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                    <div>
                        <p className="text-white font-medium">Maintenance Mode</p>
                        <p className="text-sm text-zinc-400">Disable access for non-admin users</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-pink-500' : 'bg-zinc-700'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-8' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Save Settings
                    </button>
                    {message && (
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
