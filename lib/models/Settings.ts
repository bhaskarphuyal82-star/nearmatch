import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    _id: mongoose.Types.ObjectId;
    key: string;
    value: mongoose.Schema.Types.Mixed;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

SettingsSchema.index({ key: 1 });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;

// Default settings
export const DEFAULT_SETTINGS = {
    maxDistance: 100, // km
    minAge: 18,
    maxAge: 100,
    maxPhotos: 6,
    reportThreshold: 3, // auto-ban after this many reports
    maintenanceMode: false,
};
