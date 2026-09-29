import mongoose, { Model } from "mongoose";
import { IQuizAttemptAnswer } from "../interfaces/quiz.interfaces";

// to save answers user from some quiz
const QuizAttemptAnswerSchema = new mongoose.Schema<IQuizAttemptAnswer>(
    {
        attempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizAttempt',
            required: true,
            index: true
        },

        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizQuestion',
            required: true
        },

        selectedOption: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizQuestionOption',
            required: true
        },

        isCorrect: {
            type: Boolean,
            required: true
        },

        points: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

QuizAttemptAnswerSchema.index(
    { attempt: 1, question: 1 },
    { unique: true }
);

const QuizAttemptAnswer: Model<IQuizAttemptAnswer> = mongoose.model<IQuizAttemptAnswer>("QuizAttemptAnswer", QuizAttemptAnswerSchema);
export default QuizAttemptAnswer;