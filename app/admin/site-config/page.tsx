'use client';

import { useEffect, useState, useRef } from 'react';
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
    Megaphone,
    Upload,
    FileText,
    BookOpen
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
        googleAnalyticsId?: string;
        googleConsoleVerification?: string;
        googleTagManagerId?: string;
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
        googleAdSenseId?: string;
        adCodes: {
            interstitial: string;
            chat: string;
            reward: string;
        };
    };
    legal: {
        about?: string;
        privacyPolicy?: string;
        termsService?: string;
        cookiePolicy?: string;
        communityGuidelines?: string;
        noticeAtCollection?: string;
        contactDetails?: string;
        homeContent?: string;
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
    seo: {
        metaKeywords: [],
    },
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
        googleAdSenseId: '',
        adCodes: {
            interstitial: '',
            chat: '',
            reward: '',
        },
    },
    legal: {
        about: '',
        privacyPolicy: '',
        termsService: '',
        cookiePolicy: '',
        communityGuidelines: '',
        noticeAtCollection: '',
        contactDetails: '',
        homeContent: '',
    },
};

type TabType = 'general' | 'pwa' | 'social' | 'seo' | 'app' | 'ads' | 'legal' | 'api';

export default function SiteConfigPage() {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [hasChanges, setHasChanges] = useState(false);
    const [uploading, setUploading] = useState<{ logo: boolean; favicon: boolean; ogImage: boolean }>({
        logo: false,
        favicon: false,
        ogImage: false,
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const ogImageInputRef = useRef<HTMLInputElement>(null);

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

    async function handleFileUpload(
        file: File,
        type: 'logo' | 'favicon' | 'ogImage'
    ) {
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (type === 'logo') {
                    updateRootConfig('siteLogo', data.url);
                } else if (type === 'favicon') {
                    updateRootConfig('siteFavicon', data.url);
                } else if (type === 'ogImage') {
                    updateConfig('seo', 'ogImage', data.url);
                }
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    }

    const tabs = [
        { id: 'general' as TabType, label: 'General', icon: Globe },
        { id: 'pwa' as TabType, label: 'PWA', icon: Smartphone },
        { id: 'social' as TabType, label: 'Social', icon: Share2 },
        { id: 'seo' as TabType, label: 'SEO', icon: Search },
        { id: 'app' as TabType, label: 'App Settings', icon: Settings },
        { id: 'ads' as TabType, label: 'Ads', icon: Megaphone },
        { id: 'legal' as TabType, label: 'Legal Pages', icon: FileText },
        { id: 'api' as TabType, label: 'API', icon: Link },
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
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={config.siteLogo || ''}
                                        onChange={(e) => updateRootConfig('siteLogo', e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                    />
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file, 'logo');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploading.logo}
                                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploading.logo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    </button>
                                </div>
                                {config.siteLogo && (
                                    <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg inline-block">
                                        <img src={config.siteLogo} alt="Logo preview" className="h-10 max-w-[120px] object-contain" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-1" /> Favicon URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={config.siteFavicon || ''}
                                        onChange={(e) => updateRootConfig('siteFavicon', e.target.value)}
                                        placeholder="https://example.com/favicon.ico"
                                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                    />
                                    <input
                                        type="file"
                                        ref={faviconInputRef}
                                        accept="image/*,.ico"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file, 'favicon');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => faviconInputRef.current?.click()}
                                        disabled={uploading.favicon}
                                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploading.favicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    </button>
                                </div>
                                {config.siteFavicon && (
                                    <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg inline-block">
                                        <img src={config.siteFavicon} alt="Favicon preview" className="h-8 w-8 object-contain" />
                                    </div>
                                )}
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
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                <ImageIcon className="w-4 h-4 inline mr-1" /> OG Image URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={config.seo.ogImage || ''}
                                    onChange={(e) => updateConfig('seo', 'ogImage', e.target.value)}
                                    placeholder="https://nearmatch.com/og-image.jpg"
                                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                                <input
                                    type="file"
                                    ref={ogImageInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'ogImage');
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => ogImageInputRef.current?.click()}
                                    disabled={uploading.ogImage}
                                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {uploading.ogImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </button>
                            </div>
                            {config.seo.ogImage && (
                                <div className="mt-2 p-2 bg-zinc-800/50 rounded-lg inline-block">
                                    <img src={config.seo.ogImage} alt="OG Image preview" className="h-20 max-w-[200px] object-contain rounded" />
                                </div>
                            )}
                        </div>

                        <hr className="border-zinc-700" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Google Analytics ID</label>
                                <input
                                    type="text"
                                    value={config.seo.googleAnalyticsId || ''}
                                    onChange={(e) => updateConfig('seo', 'googleAnalyticsId', e.target.value)}
                                    placeholder="G-XXXXXXXXXX"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Google Search Console Code</label>
                                <input
                                    type="text"
                                    value={config.seo.googleConsoleVerification || ''}
                                    onChange={(e) => updateConfig('seo', 'googleConsoleVerification', e.target.value)}
                                    placeholder="Verification Code"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500"
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    The code from the meta tag content attribute
                                </p>
                            </div>
                        </div>

                        <hr className="border-zinc-700" />

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Google Tag Manager ID</label>
                            <input
                                type="text"
                                value={config.seo.googleTagManagerId || ''}
                                onChange={(e) => updateConfig('seo', 'googleTagManagerId', e.target.value)}
                                placeholder="GTM-XXXXXXX"
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
                                    Google AdSense Publisher ID
                                </label>
                                <input
                                    type="text"
                                    value={config.ads.googleAdSenseId || ''}
                                    onChange={(e) => updateConfig('ads', 'googleAdSenseId', e.target.value)}
                                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Format: ca-pub-1234567890123456
                                </p>
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

                {/* Legal Pages Tab */}
                {activeTab === 'legal' && (
                    <div className="space-y-6">
                        <p className="text-zinc-400 mb-4">Manage the content of your legal and informational pages</p>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { key: 'about', label: 'About Us', icon: BookOpen },
                                { key: 'privacyPolicy', label: 'Privacy Policy', icon: Shield },
                                { key: 'termsService', label: 'Terms & Conditions', icon: FileText },
                                { key: 'cookiePolicy', label: 'Cookie Policy', icon: Shield },
                                { key: 'communityGuidelines', label: 'Community Guidelines', icon: Users },
                                { key: 'noticeAtCollection', label: 'Notice At Collection', icon: Shield },
                                { key: 'contactDetails', label: 'Contact Information', icon: Mail },
                                { key: 'homeContent', label: 'Home Page Dynamic Content', icon: Globe },
                            ].map((page) => (
                                <div key={page.key} className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                        <page.icon className="w-4 h-4" />
                                        {page.label}
                                    </label>
                                    <textarea
                                        value={config.legal[page.key as keyof typeof config.legal] || ''}
                                        onChange={(e) => updateConfig('legal', page.key, e.target.value)}
                                        rows={6}
                                        placeholder={`Enter ${page.label} content here (supports plain text)...`}
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-pink-500 resize-y"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Tab */}
                {activeTab === 'api' && (
                    <div className="space-y-8">
                        <div>
                            <p className="text-zinc-400">
                                Comprehensive list of public API endpoints for mobile app development and external integrations.
                            </p>
                        </div>

                        {[
                            {
                                title: 'System & Configuration',
                                endpoints: [
                                    { method: 'GET', url: '/api/config', desc: 'Get public site configuration, IDs, and app rules' },
                                    { method: 'GET', url: '/api/manifest', desc: 'Web App Manifest for PWA installation' },
                                    { method: 'GET', url: '/sitemap.xml', desc: 'XML Sitemap for search engines' },
                                ]
                            },
                            {
                                title: 'Authentication',
                                endpoints: [
                                    { method: 'POST', url: '/api/auth/register', desc: 'Register a new user account' },
                                    { method: 'GET', url: '/api/auth/session', desc: 'Get current user session (NextAuth)' },
                                    { method: 'POST', url: '/api/auth/signin', desc: 'Sign in credentials (NextAuth)' },
                                    { method: 'POST', url: '/api/auth/signout', desc: 'Sign out current user' },
                                ]
                            },
                            {
                                title: 'User Operations',
                                endpoints: [
                                    { method: 'GET', url: '/api/users/profile', desc: 'Get current user profile details' },
                                    { method: 'PUT', url: '/api/users/profile', desc: 'Update user profile' },
                                    { method: 'GET', url: '/api/users/nearby', desc: 'Get nearby users for discovery' },
                                    { method: 'POST', url: '/api/users/swipe', desc: 'Swipe left/right on a user' },
                                    { method: 'POST', url: '/api/users/boost', desc: 'Activate profile boost' },
                                ]
                            },
                            {
                                title: 'Communication',
                                endpoints: [
                                    { method: 'GET', url: '/api/matches', desc: 'Get list of matched users' },
                                    { method: 'GET', url: '/api/messages?chatId={id}', desc: 'Get messages for a specific chat' },
                                    { method: 'POST', url: '/api/messages', desc: 'Send a new message' },
                                    { method: 'GET', url: '/api/notifications', desc: 'Get user notifications' },
                                    { method: 'PUT', url: '/api/notifications', desc: 'Mark notifications as read' },
                                ]
                            },
                            {
                                title: 'Utilities',
                                endpoints: [
                                    { method: 'POST', url: '/api/upload', desc: 'Upload media files (images/videos)' },
                                ]
                            }
                        ].map((category, catIndex) => (
                            <div key={catIndex} className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">
                                    {category.title}
                                </h3>
                                <div className="grid gap-4">
                                    {category.endpoints.map((api, index) => (
                                        <div key={index} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${api.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                                        api.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                                            api.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {api.method}
                                                    </span>
                                                    <code className="text-sm font-mono text-pink-400">
                                                        {api.url}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-zinc-500">{api.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const fullUrl = `${config.siteUrl || window.location.origin}${api.url}`;
                                                    navigator.clipboard.writeText(fullUrl);
                                                    alert('Copied to clipboard!');
                                                }}
                                                className="self-start md:self-center p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors flex items-center gap-2 text-xs"
                                                title="Copy Full URL"
                                            >
                                                <Link className="w-4 h-4" />
                                                <span className="md:hidden">Copy URL</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
