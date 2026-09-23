import mongoose, { Model } from "mongoose";
import { IQuiz } from "../interfaces/quiz.interfaces";


const QuizSchema = new mongoose.Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      maxlength: 500
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: [
        'PUBLISHED',
        'HIDDEN',
        'DELETED',
        'BANNED',
        'DELETED_BY_ADMIN',
        'HIDDEN_BY_ADMIN'
      ],
      default: 'PUBLISHED',
      index: true
    },

    questionCount: {
      type: Number,
      default: 0
    },

    isComplete: {
      type: Boolean,
      default: true
    },

    timeLimit: {
      type: Number, // segundos
      default: null
    },

    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
      index: true
    }],

    tags: [{
      type: String,
      trim: true,
      require: false,
      default: null
    }],

    publishedAt: {
      type: Date,
      default: Date.now
    },

    deletedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Quiz: Model<IQuiz> = mongoose.model<IQuiz>("Quiz",QuizSchema);
export default Quiz;