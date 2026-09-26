import mongoose, { Model } from "mongoose";
import { IQuizAttempt } from "../interfaces/quiz.interfaces";

// to save when a user answer a quiz
const QuizAttemptSchema = new mongoose.Schema<IQuizAttempt>(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
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

        correctAnswers: {
            type: Number,
            required: true,
            default: 0
        },

        totalQuestions: {
            type: Number,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        startedAt: {
            type: Date,
            required: true,
            default: Date.now
        },

        completedAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const QuizAttempt: Model<IQuizAttempt> = mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
export default QuizAttempt;