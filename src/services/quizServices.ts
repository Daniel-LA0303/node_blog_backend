import { CreateQuizInfoRequestI, QuizzQuestionRequesI } from "../interfaces/quiz.interfaces";
import Quiz from "../models/Quiz";
import QuizQuestion from "../models/QuizQuestion";
import QuizQuestionOption from "../models/QuizQuestionOption";
import { ServiceException } from "../utils/exception/ServiceException";


// create quiz info
const createQuizInfoService = async (request: CreateQuizInfoRequestI) => {

    // create quiz
    const quiz = await Quiz.create({
        title: request.title,
        description: request.description,
        owner: request.owner,
        questionCount: request.questionCount,
        timeLimit: request.timeLimit,
        categories: request.categories
    });

    return {
        id: quiz._id,
        owner: quiz.owner,
        status: quiz.status,
        questionCount: quiz.questionCount,
        isComisComplete: quiz.isComplete,
        publishedAt: quiz.publishedAt,
        deletedAt: quiz.deletedAt,
    };
}


const createQuestionService = async (r: QuizzQuestionRequesI) => {

    // 1. search quizz
    const quiz = Quiz.findById(r.quiz);
    if (!quiz) {
        throw new ServiceException(`This Quizz does not exists.`, 404);
    }


    // 2. create question
    const q = await QuizQuestion.create({
        quiz: r.quiz,
        question: r.question,
        order: r.order,
        points: r.points,
    });

    // 3. create multiple options
    const options = await QuizQuestionOption.insertMany(
        r.options.map((option) => ({
            question: q.id,
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order
        }))
    );

    return {
        _id: q.id,
        question: q.question,
        points: q.points,
        order: q.order,
        options
    };

}

export default {
    createQuizInfoService,
    createQuestionService
}