import mongoose, { Schema } from "mongoose";
import { IBadge } from "../interfaces/badges.interfaces";

const BadgeSchema = new Schema<IBadge>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        img:{
            type: String,
            required: false,
            default: ""
        }, 
        icon: {
            type: String,
            required: false,
        },

        type: {
            type: String,
            enum: ['ACHIEVEMENT'],
            default: 'ACHIEVEMENT',
            required: true,
        },

        condition: {
            type: {
                type: String,
                enum: [
                    'BLOG_COUNT',
                    'COMMENT_COUNT',
                    'QUIZ_COUNT',
                    'FOLLOWER_COUNT',
                    'QUIZ_SCORE',
                    'QUIZ_COUNT',
                    'PROJECT_COUNT',
                    'LIST_COUNT',
                    'COLLABORATION_COUNT'
                ],
                required: true,
            },

            value: {
                type: Number,
                required: true,
            },
        },

        status: {
            type: String,
            enum: ['ACTIVE', 'HIDDEN','DELETED'],
            default: 'ACTIVE',
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


BadgeSchema.index({ status: 1, createdAt: -1 });

BadgeSchema.index({ 'condition.type': 1, 'condition.value': 1, status: 1 });

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);