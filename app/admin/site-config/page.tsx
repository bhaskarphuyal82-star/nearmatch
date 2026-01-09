'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Globe,
    Smartphone,
    Palette,
    Share2,
    Search,
    Loader2,
    Save,
    RefreshCw,
    Image as ImageIcon,
    Link,
    Mail,
    Shield,
    Users,
    MapPin,
    Camera,
    Megaphone
} from 'lucide-react';

interface SiteConfig {
    siteName: string;
    siteDescription: string;
    siteLogo?: string;
    siteFavicon?: string;
    siteUrl?: string;
    supportEmail?: string;
    pwa: {
        enabled: boolean;
        name: string;
        shortName: string;
        description: string;
        themeColor: string;
        backgroundColor: string;
        display: string;
        orientation: string;
        startUrl: string;
    };
    social: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
        ogImage?: string;
    };
    app: {
        maintenanceMode: boolean;
        maintenanceMessage?: string;
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        maxPhotosPerUser: number;
        maxDistanceKm: number;
        minAge: number;
        maxAge: number;
    };
    ads: {
        interstitialEnabled: boolean;
        interstitialInterval: number;
        rewardEnabled: boolean;
        rewardDuration: number;
        chatAdFrequency: number;
        adCodes: {
            interstitial: string;
            chat: string;
            reward: string;
        };
    };
}

const defaultConfig: SiteConfig = {
    siteName: 'NearMatch',
    siteDescription: 'Find your perfect match nearby',
    pwa: {
        enabled: true,
        name: 'NearMatch',
        shortName: 'NearMatch',
        description: 'Dating app to find people near you',
        themeColor: '#ec4899',
        backgroundColor: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        startUrl: '/discover',
    },
    social: {},
    seo: {},
    app: {
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        maxPhotosPerUser: 6,
        maxDistanceKm: 100,
        minAge: 18,
        maxAge: 100,
    },
    ads: {
        interstitialEnabled: true,
        interstitialInterval: 30,
        rewardEnabled: true,
        rewardDuration: 15,
        chatAdFrequency: 5,
        adCodes: {
            interstitial: '',
            chat: '',
            reward: '',
        },
    },
};

type TabType = 'general' | 'pwa' | 'social' | 'seo' | 'app' | 'ads';

export default function SiteConfigPage() {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        try {
            const res = await fetch('/api/admin/site-config');
            if (res.ok) {
                const data = await res.json();
                setConfig({ ...defaultConfig, ...data.config });
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setHasChanges(false);
                alert('Settings saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    }

    function updateConfig(section: keyof SiteConfig, field: string, value: unknown) {
        setConfig(prev => {
            if (typeof prev[section] === 'object' && prev[section] !== null) {
                return {
                    ...prev,
                    [section]: { ...(prev[section] as Record<string, unknown>), [field]: value },
                };
            }
            return { ...prev, [section]: value };
        });
        setHasChanges(true);
    }

    function updateRootConfig(field: keyof SiteConfig, value: unknown) {
        setConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }

    const tabs = [
        { id: 'general' as TabType, label: 'General', icon: Globe },
        { id: 'pwa' as TabType, label: 'PWA', icon: Smartphone },
        { id: 'social' as TabType, label: 'Social', icon: Share2 },
        { id: 'seo' as TabType, label: 'SEO', icon: Search },
        { id: 'app' as TabType, label: 'App Settings', icon: Settings },
        { id: 'ads' as TabType, label: 'Ads', icon: Megaphone },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Site Configuration</h1>
                    <p className="text-zinc-400">Manage your site settings and PWA configuration</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchConfig}
                        className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`px-6 py-2 rounded-lg flex items-center gap-2 ${hasChanges
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30'
                            : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6"
            >
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Site Name</label>
                                <input
                                    type="text"
                                    value={config.siteName}
                                    onChange={(e) => updateRootConfig('siteName', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Site URL</label>
                                <input
                                    type="url"
                                    value={config.siteUrl || ''}
                                    onChange={(e) => updateRootConfig('siteUrl', e.target.value)}
                                    placeholder="https://nearmatch.com"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Site Description</label>
                            <textarea
                                value={config.siteDescription}
                                onChange={(e) => updateRootConfig('siteDescription', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-1" /> Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={config.siteLogo || ''}
                                    onChange={(e) => updateRootConfig('siteLogo', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-1" /> Favicon URL
                                </label>
                                <input
                                    type="url"
                                    value={config.siteFavicon || ''}
                                    onChange={(e) => updateRootConfig('siteFavicon', e.target.value)}
                                    placeholder="https://example.com/favicon.ico"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                <Mail className="w-4 h-4 inline mr-1" /> Support Email
                            </label>
                            <input
                                type="email"
                                value={config.supportEmail || ''}
                                onChange={(e) => updateRootConfig('supportEmail', e.target.value)}
                                placeholder="support@nearmatch.com"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                            />
                        </div>
                    </div>
                )}

                {/* PWA Tab */}
                {activeTab === 'pwa' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Smartphone className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Enable PWA</p>
                                    <p className="text-xs text-zinc-500">Allow users to install the app on their devices</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateConfig('pwa', 'enabled', !config.pwa.enabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${config.pwa.enabled ? 'bg-pink-500' : 'bg-zinc-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.pwa.enabled ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">App Name</label>
                                <input
                                    type="text"
                                    value={config.pwa.name}
                                    onChange={(e) => updateConfig('pwa', 'name', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Short Name</label>
                                <input
                                    type="text"
                                    value={config.pwa.shortName}
                                    onChange={(e) => updateConfig('pwa', 'shortName', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">App Description</label>
                            <textarea
                                value={config.pwa.description}
                                onChange={(e) => updateConfig('pwa', 'description', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <Palette className="w-4 h-4 inline mr-1" /> Theme Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.pwa.themeColor}
                                        onChange={(e) => updateConfig('pwa', 'themeColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.pwa.themeColor}
                                        onChange={(e) => updateConfig('pwa', 'themeColor', e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <Palette className="w-4 h-4 inline mr-1" /> Background Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.pwa.backgroundColor}
                                        onChange={(e) => updateConfig('pwa', 'backgroundColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.pwa.backgroundColor}
                                        onChange={(e) => updateConfig('pwa', 'backgroundColor', e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Display Mode</label>
                                <select
                                    value={config.pwa.display}
                                    onChange={(e) => updateConfig('pwa', 'display', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option value="standalone">Standalone</option>
                                    <option value="fullscreen">Fullscreen</option>
                                    <option value="minimal-ui">Minimal UI</option>
                                    <option value="browser">Browser</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Orientation</label>
                                <select
                                    value={config.pwa.orientation}
                                    onChange={(e) => updateConfig('pwa', 'orientation', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                    <option value="any">Any</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Start URL</label>
                                <input
                                    type="text"
                                    value={config.pwa.startUrl}
                                    onChange={(e) => updateConfig('pwa', 'startUrl', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Social Tab */}
                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <p className="text-zinc-400 mb-4">Add links to your social media profiles</p>

                        {[
                            { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/nearmatch' },
                            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/nearmatch' },
                            { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/nearmatch' },
                            { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@nearmatch' },
                        ].map((social) => (
                            <div key={social.key}>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">{social.label}</label>
                                <input
                                    type="url"
                                    value={config.social[social.key as keyof typeof config.social] || ''}
                                    onChange={(e) => updateConfig('social', social.key, e.target.value)}
                                    placeholder={social.placeholder}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Meta Title</label>
                            <input
                                type="text"
                                value={config.seo.metaTitle || ''}
                                onChange={(e) => updateConfig('seo', 'metaTitle', e.target.value)}
                                placeholder="NearMatch - Find Your Perfect Match Nearby"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Meta Description</label>
                            <textarea
                                value={config.seo.metaDescription || ''}
                                onChange={(e) => updateConfig('seo', 'metaDescription', e.target.value)}
                                rows={3}
                                placeholder="Discover and connect with amazing people near you..."
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">OG Image URL</label>
                            <input
                                type="url"
                                value={config.seo.ogImage || ''}
                                onChange={(e) => updateConfig('seo', 'ogImage', e.target.value)}
                                placeholder="https://nearmatch.com/og-image.jpg"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                            />
                        </div>
                    </div>
                )}

                {/* App Settings Tab */}
                {activeTab === 'app' && (
                    <div className="space-y-6">
                        {/* Maintenance Mode */}
                        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Maintenance Mode</p>
                                        <p className="text-xs text-zinc-500">Temporarily disable access to the app</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig('app', 'maintenanceMode', !config.app.maintenanceMode)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${config.app.maintenanceMode ? 'bg-red-500' : 'bg-zinc-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.app.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                            {config.app.maintenanceMode && (
                                <input
                                    type="text"
                                    value={config.app.maintenanceMessage || ''}
                                    onChange={(e) => updateConfig('app', 'maintenanceMessage', e.target.value)}
                                    placeholder="Maintenance message..."
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                                />
                            )}
                        </div>

                        {/* Registration & Verification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-white text-sm font-medium">Allow Registration</p>
                                        <p className="text-xs text-zinc-500">New users can sign up</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig('app', 'allowRegistration', !config.app.allowRegistration)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${config.app.allowRegistration ? 'bg-green-500' : 'bg-zinc-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.app.allowRegistration ? 'translate-x-5' : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-white text-sm font-medium">Require Email Verification</p>
                                        <p className="text-xs text-zinc-500">Users must verify email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig('app', 'requireEmailVerification', !config.app.requireEmailVerification)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${config.app.requireEmailVerification ? 'bg-blue-500' : 'bg-zinc-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.app.requireEmailVerification ? 'translate-x-5' : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <Camera className="w-4 h-4 inline mr-1" /> Max Photos Per User
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={config.app.maxPhotosPerUser}
                                    onChange={(e) => updateConfig('app', 'maxPhotosPerUser', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" /> Max Distance (km)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={config.app.maxDistanceKm}
                                    onChange={(e) => updateConfig('app', 'maxDistanceKm', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Minimum Age</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="99"
                                    value={config.app.minAge}
                                    onChange={(e) => updateConfig('app', 'minAge', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Maximum Age</label>
                                <input
                                    type="number"
                                    min="18"
                                    max="120"
                                    value={config.app.maxAge}
                                    onChange={(e) => updateConfig('app', 'maxAge', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Ads Tab */}
                {activeTab === 'ads' && (
                    <div className="space-y-6">
                        {/* Interstitial Ads */}
                        <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                        <Megaphone className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Interstitial Ads</p>
                                        <p className="text-xs text-zinc-500">Pop-up ads that appear periodically</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig('ads', 'interstitialEnabled', !config.ads.interstitialEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${config.ads.interstitialEnabled ? 'bg-yellow-500' : 'bg-zinc-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.ads.interstitialEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Interval (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1440"
                                        value={config.ads.interstitialInterval}
                                        onChange={(e) => updateConfig('ads', 'interstitialInterval', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-yellow-500"
                                    />
                                    <p className="mt-2 text-xs text-zinc-500">
                                        How often ads should appear (minimum 1 minute)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reward Ads */}
                        <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Megaphone className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Reward Ads</p>
                                        <p className="text-xs text-zinc-500">Video ads for profile boost rewards</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig('ads', 'rewardEnabled', !config.ads.rewardEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${config.ads.rewardEnabled ? 'bg-green-500' : 'bg-zinc-600'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.ads.rewardEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Reward Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="1440"
                                        value={config.ads.rewardDuration}
                                        onChange={(e) => updateConfig('ads', 'rewardDuration', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
                                    />
                                    <p className="mt-2 text-xs text-zinc-500">
                                        How long profile boost lasts after watching an ad
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Ads & Ad Codes */}
                        <div className="p-6 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Ad Configuration</p>
                                    <p className="text-xs text-zinc-500">Advanced ad settings and codes</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Chat Ad Frequency
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={config.ads.chatAdFrequency}
                                        onChange={(e) => updateConfig('ads', 'chatAdFrequency', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Show ad after every X messages sent
                                    </p>
                                </div>
                            </div>

                            <hr className="border-zinc-700" />

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Interstitial Ad Code (HTML)
                                </label>
                                <textarea
                                    value={config.ads.adCodes?.interstitial || ''}
                                    onChange={(e) => {
                                        setConfig(prev => ({
                                            ...prev,
                                            ads: {
                                                ...prev.ads,
                                                adCodes: { ...prev.ads.adCodes, interstitial: e.target.value }
                                            }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    rows={4}
                                    placeholder="<script>...</script> or <div class='ad'>...</div>"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Chat Ad Code (HTML)
                                </label>
                                <textarea
                                    value={config.ads.adCodes?.chat || ''}
                                    onChange={(e) => {
                                        setConfig(prev => ({
                                            ...prev,
                                            ads: {
                                                ...prev.ads,
                                                adCodes: { ...prev.ads.adCodes, chat: e.target.value }
                                            }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    rows={4}
                                    placeholder="<script>...</script>"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Reward Ad Code (HTML)
                                </label>
                                <textarea
                                    value={config.ads.adCodes?.reward || ''}
                                    onChange={(e) => {
                                        setConfig(prev => ({
                                            ...prev,
                                            ads: {
                                                ...prev.ads,
                                                adCodes: { ...prev.ads.adCodes, reward: e.target.value }
                                            }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    rows={4}
                                    placeholder="<script>...</script> - Code for video ad or reward unit"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                                />
                            </div>
                        </div>

                    </div>
                )}
            </motion.div>
        </div>
    );
}
