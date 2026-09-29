import SaveResource from "../models/SaveResource";
import quizServices from "../services/quizServices";
import { ApiResponse } from "../utils/ApiResponse";


const createQuizInfoController = async (req: any, res: any, next: any) => {
    try {

        const body = req.body;
        const r = await quizServices.createQuizInfoService(body);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Quiz info created successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const createQuestionController = async (req: any, res: any, next: any) => {
    try {

        const body = req.body;
        const r = await quizServices.createQuestionService(body);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Question created successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const getQuizController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id;
        const r = await quizServices.getQuizService(id);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Get quiz successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const submitQuizAttemptController = async (req: any, res: any, next: any) => {
    try {

        const body = req.body
        const r = await quizServices.submitQuizAttemptService(body);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Create attempt successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const getQuizToUpdateController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id
        const r = await quizServices.getQuizToUpdateService(id);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Get quiz successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const removeQuestionController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id
        await quizServices.removeQuestionService(id);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Delete question successfully.", null, false)
        );
    } catch (error) {
        next(error);
    }
}

const updateQuestionController = async (req: any, res: any, next: any) => {
    try {

        const body = req.body
        const r = await quizServices.updateQuestionService(body);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Update question successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}
const updateQuizInfoController = async (req: any, res: any, next: any) => {
    try {

        const body = req.body
        const r = await quizServices.updateQuizInfoService(body);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Update quiz successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const getLeaderBoardByQuizController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id;
        const r = await quizServices.getLeaderBoardByQuizService(id);

        res.status(200).json(
            new ApiResponse(201, "/api" + req.path, req.method, "Get Leader info successfully.", r, false)
        );
    } catch (error) {
        next(error);
    }
}

export const getQuizesPaginatedByUserIdController = async (req: any, res: any, next: any) => {
    try {
        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const data = await quizServices.getQuizesPaginatedByUserIdService(id, page, limit);

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const getQuizesAttemptPaginatedByUserIdController = async (req: any, res: any, next: any) => {
    try {
        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const data = await quizServices.getQuizesAttemptPaginatedByUserIdService(id, page, limit);

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// change save
const toggleSaveResourceController = async (req: any, res: any, next: any) => {
    try {
        // Asumiendo que obtienes el userId del token/middleware de autenticación
        const userId = req.user._id.toString();
        const { resourceId, resourceType } = req.body; // resourceType: 'BLOG' | 'QUIZ'

        const result = await quizServices.toggleSaveResourceService(
            userId,
            resourceId,
            resourceType
        );

        res.status(200).json(result);
    } catch (error: any) {
        next(error);
    }
};

const getQuizesPaginatedController = async (req: any, res: any, next: any) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const r = await quizServices.getQuizesPaginatedService(page, limit);

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));
    } catch (error) {
        next(error);
    }
};

const searchQuizesController = async (req: any, res: any, next: any) => {
    try {
        const query = String(req.query.query || '');
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const r = await quizServices.searchQuizesService(query, page, limit);

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));
    } catch (error) {
        next(error);
    }
};



export default {
    createQuizInfoController,
    createQuestionController,
    getQuizController,
    submitQuizAttemptController,
    getQuizToUpdateController,
    removeQuestionController,
    updateQuestionController,
    updateQuizInfoController,
    getLeaderBoardByQuizController,
    getQuizesPaginatedByUserIdController,
    getQuizesAttemptPaginatedByUserIdController,
    toggleSaveResourceController,
    getQuizesPaginatedController,
    searchQuizesController
}
