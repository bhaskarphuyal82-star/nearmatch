import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
    _id: mongoose.Types.ObjectId;
    users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
    matchedAt: Date;
    lastMessage?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        users: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            required: true,
            validate: {
                validator: function (v: mongoose.Types.ObjectId[]) {
                    return v.length === 2;
                },
                message: 'A match must have exactly 2 users',
            },
        },
        matchedAt: {
            type: Date,
            default: Date.now,
        },
        lastMessage: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding matches by user
MatchSchema.index({ users: 1 });
MatchSchema.index({ matchedAt: -1 });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
