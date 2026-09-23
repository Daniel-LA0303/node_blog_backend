import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import quizController from "../controllers/quizController";

const router = express.Router();

router.post('/create-quiz', 
    checkRoleAuth,
    quizController.createQuizInfoController); 

router.post('/create-question', 
    checkRoleAuth,
    quizController.createQuestionController); 


export default router