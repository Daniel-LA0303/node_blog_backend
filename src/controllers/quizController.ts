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

export default {
    createQuizInfoController,
    createQuestionController,
    getQuizController,
    submitQuizAttemptController,
    getQuizToUpdateController,
    removeQuestionController,
    updateQuestionController,
    updateQuizInfoController
}
