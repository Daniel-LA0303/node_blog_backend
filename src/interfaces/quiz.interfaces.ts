import mongoose, { Types } from "mongoose";


export interface IQuiz extends Document {
    title: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'| 'BANNED' | 'DELETED_BY_ADMIN' | 'HIDDEN_BY_ADMIN';
    questionCount: number;
    isComplete: boolean;
    timeLimit: number;
    categories?: Types.ObjectId[];
    tags: string;
    publishedAt: Date;
    deletedAt: Date;
}

export interface IQuizQuestion extends Document {
    quiz: mongoose.Types.ObjectId;
    question: string;
    order: number;
    points: number;
}

export interface IQuizQuestionOption extends Document {
    question: mongoose.Types.ObjectId;
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface IQuizAttempt extends Document {
    quiz: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    duration: number;
    startedAt: Date;
    completedAt: Date
}

export interface IQuizAttemptAnswer extends Document {
    attempt: mongoose.Types.ObjectId;
    question: mongoose.Types.ObjectId;
    selectedOption: mongoose.Schema.Types.ObjectId,
    isCorrect: boolean;
    points: number;   
}

export interface ILeaderboard extends Document {
    type: string;
    entityId: mongoose.Types.ObjectId;
    name: string;
    status: string;
}

export interface ILeaderboardEntry extends Document {
   leaderboard: mongoose.Types.ObjectId;
   user: mongoose.Types.ObjectId;
   score: number;
   position: number;
   attempts: number;
   bestScore: number;
   metadata: any;
}

export interface CreateQuizInfoRequestI {
    quizId?: string;
    title: string;
    description: string;
    owner: string;
    questionCount: number;
    status: 'PUBLISHED' | 'HIDDEN' | 'DELETED'| 'BANNED' | 'DELETED_BY_ADMIN' | 'HIDDEN_BY_ADMIN';
    categories?: string[];
    timeLimit: number;
}

export interface QuizzOptionRequestI {
    _id?: string;
    isCorrect: boolean,
    order: number,
    text: string,
}

export interface QuizzQuestionRequesI {
    quiz: string;
    questionId?: string;
    question: string;
    order: number;
    points: number;
    options: QuizzOptionRequestI[];
}

export interface SubmitQuizAttemptRequest {
    quizId: string
    userId: string
    answers: {
        questionId: string
        selectedOptionId: string | null
    }[]
    duration: number
}