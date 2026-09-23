import mongoose, { Model } from "mongoose";
import { IQuizQuestion } from "../interfaces/quiz.interfaces";

const QuizQuestionSchema = new mongoose.Schema<IQuizQuestion>(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    order: {
      type: Number,
      required: true
    },

    points: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

QuizQuestionSchema.index(
  { quiz: 1, order: 1 },
  { unique: true }
);

const QuizQuestion: Model<IQuizQuestion> = mongoose.model<IQuizQuestion>("QuizQuestion",QuizQuestionSchema);
export default QuizQuestion;