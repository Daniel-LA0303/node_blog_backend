import mongoose, { Model } from "mongoose";
import { ILeaderboard } from "../interfaces/quiz.interfaces";

// to tag an leader board for some resource for example quiz, badge etc
const LeaderboardSchema = new mongoose.Schema<ILeaderboard>(
    {
        type: {
            type: String,
            enum: [
                'QUIZ',
                'BADGE',
                'COMMUNITY',
                'OTHER'
            ],
            required: true,
            index: true
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        status: {
            type: String,
            enum: [
                'ACTIVE',
                'INACTIVE'
            ],
            default: 'ACTIVE',
            index: true
        }
    },
    {
        timestamps: true
    }
);

const Leaderboard: Model<ILeaderboard> = mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
export default Leaderboard;