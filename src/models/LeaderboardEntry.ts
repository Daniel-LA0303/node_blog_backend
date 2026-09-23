import mongoose, { Model } from "mongoose";
import { ILeaderboardEntry } from "../interfaces/quiz.interfaces";

// save users that 
const LeaderboardEntrySchema = new mongoose.Schema<ILeaderboardEntry>(
    {
        leaderboard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Leaderboard',
            required: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        score: {
            type: Number,
            required: true,
            default: 0
        },

        position: {
            type: Number,
            required: true
        },

        attempts: {
            type: Number,
            default: 0
        },

        bestScore: {
            type: Number,
            default: 0
        },

        metadata: {
            correctAnswers: {
                type: Number,
                default: 0
            },

            totalQuestions: {
                type: Number,
                default: 0
            },

            duration: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

LeaderboardEntrySchema.index(
    { leaderboard: 1, user: 1 },
    { unique: true }
);

const LeaderboardEntry: Model<ILeaderboardEntry> = mongoose.model<ILeaderboardEntry>("LeaderboardEntry", LeaderboardEntrySchema);
export default LeaderboardEntry;