import mongoose, { Model } from "mongoose";
import { IQuizQuestionOption } from "../interfaces/quiz.interfaces";


const QuizQuestionOptionSchema = new mongoose.Schema<IQuizQuestionOption>(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizQuestion',
      required: true,
      index: true
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    isCorrect: {
      type: Boolean,
      required: true,
      default: false
    },

    order: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

QuizQuestionOptionSchema.index(
  { question: 1, order: 1 },
  { unique: true }
);

const QuizQuestionOption: Model<IQuizQuestionOption> = mongoose.model<IQuizQuestionOption>("QuizQuestionOption",QuizQuestionOptionSchema);
export default QuizQuestionOption;