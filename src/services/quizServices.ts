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
import User from "../models/User";
import SaveResource from "../models/SaveResource";

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

    const user = await User.findById(quiz.owner.toString())
        .select('name _id profilePicture');
    if (!user) {
        throw new ServiceException(`This User does not exists.`, 404);
    }




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

    const usersAttempts = await getLeaderBoardByQuizService(quizId);

    return {
        owner: user,
        quiz: {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            timeLimit: quiz.timeLimit,
            questions: quizQuestions
        },
        answerKey,
        usersAttempts
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

const getLeaderBoardByQuizService = async (quizId: string) => {

    // 1. get quiz
    const q = await Quiz.findById(quizId);
    if (!q) {
        throw new ServiceException(`This quiz does not exists.`, 404);
    }

    // 2. get Leader board
    const l = await Leaderboard.findOne({
        type: 'QUIZ',
        entityId: q._id
    });
    if (!l) {
        throw new ServiceException(`This leaderboard does not exists.`, 404);
    }

    const lq = await LeaderboardEntry.find({
        leaderboard: l._id
    })
        .sort({ score: -1 })
        .select('_id user score attempts')
        .populate({
            path: 'user',
            select: 'name _id profilePicture'
        })
        .limit(20);

    return lq
}

const getQuizesPaginatedByUserIdService = async (
    userId: string,
    page: number,
    limit: number
) => {

    // 1. search user
    const u = await User.findById(userId);
    if (!u) {
        throw new ServiceException(`This user does not exists.`, 404);
    }

    const skip = (page - 1) * limit;
    const total = await Quiz.countDocuments({
        owner: u._id
    });

    const quizes = await Quiz.find({
        owner: u._id
    })
    .select('-isComplete -createdAt -updatedAt -deletedAt -__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    return {
        quizes,
        meta: {
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const getQuizesAttemptPaginatedByUserIdService = async (
    userId: string,
    page: number,
    limit: number
) => {

    // 1. search user
    const u = await User.findById(userId);
    if (!u) {
        throw new ServiceException(`This user does not exists.`, 404);
    }

    const skip = (page - 1) * limit;
    const total = await QuizAttempt.countDocuments({
        user: u._id
    });

    const quizesAttempts = await QuizAttempt.find({
        user: u._id
    })
    .populate({
        path: 'quiz',
        select: '-__v -updatedAt -createdAt -deletedAt -tags -categories'
    })
    .select('-user -__v -updatedAt -createdAt ')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    return {
        quizesAttempts,
        meta: {
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}

// get paginated with print save button
/*const getQuizesAttemptPaginatedByUserIdService = async (
  userId: string,
  page: number,
  limit: number,
  currentAuthUserId?: string // ID del usuario logueado en la app
) => {
  const u = await User.findById(userId);
  if (!u) {
    throw new ServiceException(`This user does not exist.`, 404);
  }

  const skip = (page - 1) * limit;
  const total = await QuizAttempt.countDocuments({ user: u._id });

  const quizesAttempts = await QuizAttempt.find({ user: u._id })
    .populate({
      path: 'quiz',
      select: '-__v -updatedAt -createdAt -deletedAt -tags -categories',
    })
    .select('-user -__v -updatedAt -createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // .lean() devuelve objetos JavaScript planos para poder editarlos

  // Si hay un usuario autenticado consultando, calculamos qué quizes tiene guardados
  if (currentAuthUserId && quizesAttempts.length > 0) {
    const quizIds = quizesAttempts.map((item: any) => item.quiz._id);

    // Buscamos cuáles de esos quizes están guardados por currentAuthUserId
    const savedResources = await SaveResource.find({
      user: currentAuthUserId,
      resourceType: 'QUIZ',
      resource: { $in: quizIds },
    }).select('resource');

    const savedSet = new Set(savedResources.map((s) => s.resource.toString()));

    // Inyectamos el flag isSaved a cada objeto
    quizesAttempts.forEach((item: any) => {
      if (item.quiz) {
        item.quiz.isSaved = savedSet.has(item.quiz._id.toString());
      }
    });
  }

  return {
    quizesAttempts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};*/

// change save blog or quiz
export const toggleSaveResourceService = async (
  userId: string,
  resourceId: string,
  resourceType: 'Post' | 'Quiz'
) => {
  // 1. search resource
  const existingSave = await SaveResource.findOne({
    user: userId,
    resource: resourceId,
    resourceType: resourceType,
  });

  // 2. if resource exists tehn
  if (existingSave) {
    await SaveResource.findByIdAndDelete(existingSave._id);
    return {
      isSaved: false,
      message: `${resourceType} remove it from saver resource.`,
    };
  }

  // 3. if does not exists save it new
  await SaveResource.create({
    user: userId,
    resource: resourceId,
    resourceType: resourceType,
  });

  return {
    isSaved: true,
    message: `${resourceType} save it successfully.`,
  };
};


// global: todos los quizzes publicados, sin filtrar por dueño
const getQuizesPaginatedService = async (
    page: number,
    limit: number
) => {

    const skip = (page - 1) * limit;

    const filters = { status: 'PUBLISHED' };

    const total = await Quiz.countDocuments(filters);

    const quizes = await Quiz.find(filters)
        .select('-isComplete -createdAt -updatedAt -deletedAt -__v')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        quizes,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// búsqueda por título, descripción o tags — mismo filtro base (PUBLISHED)
const searchQuizesService = async (
    query: string,
    page: number,
    limit: number
) => {

    const skip = (page - 1) * limit;

    const filters: any = { status: 'PUBLISHED' };

    if (query && query.trim()) {
        const regex = new RegExp(query.trim(), 'i');
        filters.$or = [
            { title: regex },
            { description: regex },
            { tags: regex }
        ];
    }

    const total = await Quiz.countDocuments(filters);

    const quizes = await Quiz.find(filters)
        .select('-isComplete -createdAt -updatedAt -deletedAt -__v')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        quizes,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export default {
    createQuizInfoService,
    createQuestionService,
    getQuizService,
    submitQuizAttemptService,
    getQuizToUpdateService,
    removeQuestionService,
    updateQuestionService,
    updateQuizInfoService,
    getLeaderBoardByQuizService,
    getQuizesPaginatedByUserIdService,
    getQuizesAttemptPaginatedByUserIdService,
    toggleSaveResourceService,
    getQuizesPaginatedService,
    searchQuizesService
}