import mongoose from "mongoose";
import { CreateQuizInfoRequestI, QuizzQuestionRequesI, SubmitQuizAttemptRequest } from "../interfaces/quiz.interfaces";
import Leaderboard from "../models/Leaderboard";
import LeaderboardEntry from "../models/LeaderboardEntry";
import Quiz from "../models/Quiz";
import QuizQuestion from "../models/QuizQuestion";
import QuizQuestionOption from "../models/QuizQuestionOption";
import { ServiceException } from "../utils/exception/ServiceException";
import QuizAttempt from "../models/QuizAttempt";
import QuizAttemptAnswer from "../models/QuizAttemptAnswer";

const submitQuizAttemptService = async (
    request: SubmitQuizAttemptRequest
) => {

    const session = await mongoose.startSession()

    try {

        session.startTransaction()

        /*
         * Find the quiz
         */
        const quiz = await Quiz
            .findById(request.quizId)
            .session(session)
            .lean()

        if (!quiz) {
            throw new ServiceException(`This Quizz does not exists.`, 404);
        }


        /*
         * Find all questions belonging to the quiz
         */
        const questions = await QuizQuestion
            .find({
                quiz: request.quizId
            })
            .sort({ order: 1 })
            .session(session)
            .lean()

        if (questions.length === 0) {
            throw new ServiceException(`This Quizz does not have any question.`, 400);
        }


        /*
         * Find all options belonging to the quiz questions
         */
        const questionIds = questions.map(
            (question) => question._id
        )

        const options = await QuizQuestionOption
            .find({
                question: {
                    $in: questionIds
                }
            })
            .session(session)
            .lean()


        /*
         * Calculate the result
         */
        let correctAnswers = 0
        let earnedPoints = 0
        let totalPoints = 0


        const breakdown = questions.map((question) => {

            const questionOptions = options.filter(
                (option) =>
                    option.question.toString() ===
                    question._id.toString()
            )

            const correctOption = questionOptions.find(
                (option) => option.isCorrect
            )

            if (!correctOption) {
                throw new ServiceException(`This Question does not have option.`, 400);
            }


            totalPoints += question.points


            const answer = request.answers.find(
                (answer) =>
                    answer.questionId ===
                    question._id.toString()
            )


            const selectedOption = answer?.selectedOptionId
                ? questionOptions.find(
                    (option) =>
                        option._id.toString() ===
                        answer.selectedOptionId
                )
                : null


            /*
             * Check that the selected option belongs
             * to the current question
             */
            if (
                answer?.selectedOptionId &&
                !selectedOption
            ) {
                throw new ServiceException(`Invalid Option.`, 400);
            }


            const isCorrect =
                !!selectedOption &&
                selectedOption._id.toString() ===
                correctOption._id.toString()


            if (isCorrect) {
                correctAnswers += 1
                earnedPoints += question.points
            }


            return {
                questionId: question._id,
                question: question.question,

                selectedOptionId:
                    selectedOption?._id ?? null,

                selectedOptionText:
                    selectedOption?.text ?? null,

                correctOptionId:
                    correctOption._id,

                correctOptionText:
                    correctOption.text,

                isCorrect,

                points: question.points,

                earnedPoints:
                    isCorrect
                        ? question.points
                        : 0
            }
        })


        /*
         * Calculate percentage score
         */
        const score =
            totalPoints > 0
                ? Math.round(
                    (earnedPoints / totalPoints) * 100
                )
                : 0

        /*
         * Create the quiz attempt
         */
        const [attempt] = await QuizAttempt.create(
            [{
                quiz: request.quizId,
                user: request.userId,
                score,
                correctAnswers,
                totalQuestions: questions.length,
                duration: request.duration,
                completedAt: new Date()
            }],
            {
                session
            }
        )


        /*
         * Create the answers
         */
        const attemptAnswers = request.answers
            .map((answer) => {

                const question = questions.find(
                    (question) =>
                        question._id.toString() ===
                        answer.questionId
                )

                if (!question) {
                    return null
                }

                const questionOptions = options.filter(
                    (option) =>
                        option.question.toString() ===
                        question._id.toString()
                )

                const selectedOption = answer.selectedOptionId
                    ? questionOptions.find(
                        (option) =>
                            option._id.toString() ===
                            answer.selectedOptionId
                    )
                    : null


                if (!selectedOption) {
                    return null
                }


                const correctOption = questionOptions.find(
                    (option) => option.isCorrect
                )

                const isCorrect =
                    selectedOption._id.toString() ===
                    correctOption?._id.toString()

                return {
                    attempt: attempt._id,
                    question: question._id,
                    selectedOption: selectedOption._id,
                    isCorrect,
                    points: isCorrect
                        ? question.points
                        : 0
                }
            })
            .filter(Boolean)

        if (attemptAnswers.length > 0) {
            await QuizAttemptAnswer.insertMany(
                attemptAnswers,
                {
                    session
                }
            )
        }


        /*
         * Find the leaderboard associated with the quiz
         */
        const leaderboard = await Leaderboard
            .findOne({
                type: 'QUIZ',
                entityId: request.quizId,
                status: 'ACTIVE'
            })
            .session(session)


        if (!leaderboard) {
            throw new ServiceException(`This Quizz does not exists.`, 404);
        }


        /*
         * Find the user's leaderboard entry
         */
        let leaderboardEntry = await LeaderboardEntry
            .findOne({
                leaderboard: leaderboard._id,
                user: request.userId
            })
            .session(session);


        if (!leaderboardEntry) {

            /*
             * First attempt
             */
            leaderboardEntry = await LeaderboardEntry.create(
                [{
                    leaderboard: leaderboard._id,
                    user: request.userId,
                    score,
                    position: 0,
                    attempts: 1,
                    bestScore: score
                }],
                {
                    session
                }
            ).then((entries) => entries[0])

        } else {

            /*
             * Existing user
             */
            leaderboardEntry.attempts += 1

            if (score > leaderboardEntry.bestScore) {
                leaderboardEntry.bestScore = score
            }

            leaderboardEntry.score = leaderboardEntry.bestScore

            await leaderboardEntry.save({
                session
            })
        }

        if (!leaderboardEntry) {
            throw new Error('Failed to create leaderboard entry')
        }

        /*
         * Recalculate leaderboard position
         */
        const usersAbove = await LeaderboardEntry.countDocuments({
            leaderboard: leaderboard._id,
            score: {
                $gt: leaderboardEntry?.score
            }
        }).session(session);


        leaderboardEntry.position = usersAbove + 1

        await leaderboardEntry.save({
            session
        })

        // close transaction
        await session.commitTransaction()

        /*
         * Return the result
         */
        return {
            attemptId: attempt._id,
            quizId: request.quizId,
            score,
            correctAnswers,
            totalQuestions: questions.length,
            earnedPoints,
            totalPoints,
            duration: request.duration,
            breakdown
        }
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        await session.endSession()
    }
}


const getQuizService = async (quizId: string) => {

    // Find the quiz
    const quiz = await Quiz.findById(quizId).lean()

    if (!quiz) {
        throw new ServiceException(`This Quiz does not exists.`, 404);
    }

    // Find all questions belonging to the quiz
    const questions = await QuizQuestion
        .find({ quiz: quizId })
        .sort({ order: 1 })
        .lean()

    const questionIds = questions.map((question) => question._id)

    // Find all options belonging to the quiz questions
    const options = await QuizQuestionOption
        .find({
            question: { $in: questionIds }
        })
        .sort({ order: 1 })
        .lean()

    // Group options by question
    const optionsByQuestion = options.reduce(
        (acc, option) => {

            const questionId = option.question.toString()

            if (!acc[questionId]) {
                acc[questionId] = []
            }

            acc[questionId].push(option)

            return acc
        },
        {} as Record<string, typeof options>
    )

    // Build the questions response
    const quizQuestions = questions.map((question) => {

        const questionOptions =
            optionsByQuestion[question._id.toString()] ?? []

        return {
            _id: question._id,
            question: question.question,
            points: question.points,
            order: question.order,

            options: questionOptions.map((option) => ({
                _id: option._id,
                text: option.text
            }))
        }
    })

    // Build the answer key
    const answerKey = questions.reduce(
        (acc, question) => {

            const questionOptions =
                optionsByQuestion[question._id.toString()] ?? []

            const correctOption = questionOptions.find(
                (option) => option.isCorrect
            )

            if (correctOption) {
                acc[question._id.toString()] = {
                    correctOptionId: correctOption._id,
                    points: question.points
                }
            }

            return acc
        },
        {} as Record<
            string,
            {
                correctOptionId: typeof options[number]['_id']
                points: number
            }
        >
    )

    return {
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            questions: quizQuestions
        },
        answerKey
    }
}



// create quiz info
const createQuizInfoService = async (request: CreateQuizInfoRequestI) => {

    // 1. create quiz
    const quiz = await Quiz.create({
        title: request.title,
        description: request.description,
        owner: request.owner,
        questionCount: request.questionCount,
        timeLimit: request.timeLimit,
        categories: request.categories
    });

    // 2. create Leaderboard to this quizz
    await Leaderboard.create({
        type: 'QUIZ',
        entityId: quiz.id,
        name: quiz.title,
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
    const quiz = await Quiz.findById(r.quiz);
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

const getQuizToUpdateService = async (quizId: string) => {

    // 1. search quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new ServiceException(`This Quiz does not exists.`, 404);
    }

    const questions = await QuizQuestion.find({
        quiz: quiz._id
    }).select('_id quiz question points order')
        .lean();

    const getQuestionsIds = questions.map(p => p._id.toString());
    const options = await QuizQuestionOption.find({
        question: { $in: getQuestionsIds }
    })
    //.select('_id text isCorrect order');

    const questionsWithOptions = questions.map((q, i) => (
        {
            ...q,
            options: options.filter((o) => {
                if (o.question.toString() === q._id.toString()) {
                    return {
                        _id: o._id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        order: o.order
                    }
                } else {
                    return null
                }
            })
        }
    ));

    return {
        quiz: {
            id: quiz._id,
            owner: quiz.owner,
            title: quiz.title,
            description: quiz.description,
            category: quiz.categories,
            status: quiz.status,
            questionCount: quiz.questionCount,
            isComplete: quiz.isComplete,
            timeLimit: quiz.timeLimit,
            tags: quiz.tags,
            publishedAt: quiz.publishedAt,
            deletedAt: quiz.deletedAt,
        },
        questions: questionsWithOptions
    }
}

const updateQuizInfoService = async (r: CreateQuizInfoRequestI) => {

    // 1. create quiz
    const quiz = await Quiz.findById(r.quizId);
    if (!quiz) {
        throw new ServiceException(`This Quizz does not exists.`, 404);
    }

    quiz.title = r.title;
    quiz.description = r.description;
    quiz.timeLimit = r.timeLimit;
    quiz.status = r.status;
    quiz.questionCount = r.questionCount;
    await quiz.save();
    // 2. create Leaderboard to this quizz


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


const removeQuestionService = async (questionId: string) => {

    const question = await QuizQuestion.findById(questionId);

    if (!question) {
        throw new ServiceException(`This Question does not exists.`, 404);
    }

    question.remove();

}

const updateQuestionService = async (r: QuizzQuestionRequesI) => {

    // 1. search quizz
    const quiz = await Quiz.findById(r.quiz);
    if (!quiz) {
        throw new ServiceException(`This Quizz does not exists.`, 404);
    }


    // 2. search question and save it
    const q = await QuizQuestion.findById(r.questionId);
    if (!q) {
        throw new ServiceException(`This question does not exists.`, 404);
    }
    q.question = r.question;
    q.points = r.points;
    q.order = r.order;
    await q.save();


    // 3. create multiple options
    const options = await Promise.all(
        r.options.map((option) =>
            QuizQuestionOption.findByIdAndUpdate(
                option._id,
                {
                    text: option.text,
                    isCorrect: option.isCorrect,
                    order: option.order
                },
                { new: true }
            )
        )
    );

    return {
        _id: q.id,
        quiz: quiz._id,
        question: q.question,
        points: q.points,
        order: q.order,
        options
    };
}



export default {
    createQuizInfoService,
    createQuestionService,
    getQuizService,
    submitQuizAttemptService,
    getQuizToUpdateService,
    removeQuestionService,
    updateQuestionService,
    updateQuizInfoService
}