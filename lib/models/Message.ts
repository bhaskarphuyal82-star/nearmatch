import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    match: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    type: 'text' | 'image' | 'gif' | 'sticker';
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        match: {
            type: Schema.Types.ObjectId,
            ref: 'Match',
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        type: {
            type: String,
            enum: ['text', 'image', 'gif', 'sticker'],
            default: 'text',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fetching messages by match
MessageSchema.index({ match: 1, createdAt: 1 });
MessageSchema.index({ sender: 1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
