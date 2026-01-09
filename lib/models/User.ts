import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password?: string;
    name: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'non-binary' | 'other';
    photos: string[];
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    preferences: {
        ageRange: { min: number; max: number };
        distance: number; // in kilometers
        gender: 'male' | 'female' | 'both';
    };
    role: 'user' | 'admin';
    isVerified: boolean;
    isBanned: boolean;
    onboardingComplete: boolean;
    lastActive: Date;
    likedUsers: mongoose.Types.ObjectId[];
    dislikedUsers: mongoose.Types.ObjectId[];
    boostedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include password in queries by default
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'non-binary', 'other'],
        },
        photos: {
            type: [String],
            default: [],
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
        preferences: {
            ageRange: {
                min: { type: Number, default: 18 },
                max: { type: Number, default: 50 },
            },
            distance: { type: Number, default: 50 }, // km
            gender: {
                type: String,
                enum: ['male', 'female', 'both'],
                default: 'both',
            },
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
        lastActive: {
            type: Date,
            default: Date.now,
        },
        likedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        dislikedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        boostedUntil: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ lastActive: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
