import mongoose, { Schema } from "mongoose";
import { IUserBadge } from "../interfaces/badges.interfaces";


const UserBadgeSchema = new Schema<IUserBadge>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        badge: {
            type: Schema.Types.ObjectId,
            ref: 'Badge',
            required: true,
            index: true,
        },

        awardedAt: {
            type: Date,
            default: Date.now,
        },

        isDisplayed: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// unique 
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);