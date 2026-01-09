import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteConfig extends Document {
    _id: mongoose.Types.ObjectId;

    // Site Information
    siteName: string;
    siteDescription: string;
    siteLogo?: string;
    siteFavicon?: string;
    siteUrl?: string;
    supportEmail?: string;

    // PWA Configuration
    pwa: {
        enabled: boolean;
        name: string;
        shortName: string;
        description: string;
        themeColor: string;
        backgroundColor: string;
        display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
        orientation: 'portrait' | 'landscape' | 'any';
        startUrl: string;
        icons: {
            src: string;
            sizes: string;
            type: string;
        }[];
    };

    // Social Links
    social: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };

    // SEO
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
        ogImage?: string;
    };

    // Ads Configuration
    ads: {
        interstitialEnabled: boolean;
        interstitialInterval: number; // minutes
        rewardEnabled: boolean; // profile boost
        rewardDuration: number; // minutes
        chatAdFrequency: number; // messages count
        adCodes: {
            interstitial: string;
            chat: string;
            reward: string;
        };
    };

    // App Settings
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

    createdAt: Date;
    updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
    {
        siteName: { type: String, default: 'NearMatch' },
        siteDescription: { type: String, default: 'Find your perfect match nearby' },
        siteLogo: { type: String },
        siteFavicon: { type: String },
        siteUrl: { type: String },
        supportEmail: { type: String },

        pwa: {
            enabled: { type: Boolean, default: true },
            name: { type: String, default: 'NearMatch' },
            shortName: { type: String, default: 'NearMatch' },
            description: { type: String, default: 'Dating app to find people near you' },
            themeColor: { type: String, default: '#ec4899' },
            backgroundColor: { type: String, default: '#09090b' },
            display: {
                type: String,
                enum: ['standalone', 'fullscreen', 'minimal-ui', 'browser'],
                default: 'standalone'
            },
            orientation: {
                type: String,
                enum: ['portrait', 'landscape', 'any'],
                default: 'portrait'
            },
            startUrl: { type: String, default: '/discover' },
            icons: [{
                src: { type: String },
                sizes: { type: String },
                type: { type: String },
            }],
        },

        social: {
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            tiktok: { type: String },
        },

        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
            metaKeywords: [{ type: String }],
            ogImage: { type: String },
        },

        ads: {
            interstitialEnabled: { type: Boolean, default: true },
            interstitialInterval: { type: Number, default: 30 },
            rewardEnabled: { type: Boolean, default: true },
            rewardDuration: { type: Number, default: 15 },
            chatAdFrequency: { type: Number, default: 5 },
            adCodes: {
                interstitial: { type: String, default: '' },
                chat: { type: String, default: '' },
                reward: { type: String, default: '' },
            },
        },

        app: {
            maintenanceMode: { type: Boolean, default: false },
            maintenanceMessage: { type: String, default: 'We are currently undergoing maintenance. Please check back soon!' },
            allowRegistration: { type: Boolean, default: true },
            requireEmailVerification: { type: Boolean, default: false },
            maxPhotosPerUser: { type: Number, default: 6 },
            maxDistanceKm: { type: Number, default: 100 },
            minAge: { type: Number, default: 18 },
            maxAge: { type: Number, default: 100 },
        },
    },
    {
        timestamps: true,
    }
);

const SiteConfig: Model<ISiteConfig> = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);

export default SiteConfig;

// Helper to get or create site config (singleton pattern)
export async function getSiteConfig(): Promise<ISiteConfig> {
    let config = await SiteConfig.findOne();
    if (!config) {
        config = await SiteConfig.create({});
    }
    return config;
}
