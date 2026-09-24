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

router.get('/get-quiz/:id', 
    checkRoleAuth,
    quizController.getQuizController); 

router.post('/create-attemp', 
    checkRoleAuth,
    quizController.submitQuizAttemptController); 

router.get('/get-quiz-update/:id', 
    checkRoleAuth,
    quizController.getQuizToUpdateController); 

router.delete('/delete-question/:id', 
    checkRoleAuth,
    quizController.removeQuestionController); 

router.put('/update-question/:id', 
    checkRoleAuth,
    quizController.updateQuestionController); 

router.put('/update-quiz/:id', 
    checkRoleAuth,
    quizController.updateQuizInfoController); 


export default router