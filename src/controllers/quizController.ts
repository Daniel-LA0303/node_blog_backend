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



export default {
    createQuizInfoController,
    createQuestionController
}
