import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import quizController from "../controllers/quizController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

router.post('/create-quiz',
    checkAuth,
    quizController.createQuizInfoController);

router.post('/create-question',
    checkAuth,
    quizController.createQuestionController);

router.get('/get-quiz/:id',
    //checkAuth,
    quizController.getQuizController);

router.post('/create-attemp',
    checkAuth,
    quizController.submitQuizAttemptController);

router.get('/get-quiz-update/:id',
    checkAuth,
    quizController.getQuizToUpdateController);

router.delete('/delete-question/:id',
    checkAuth,
    quizController.removeQuestionController);

router.put('/update-question/:id',
    checkAuth,
    quizController.updateQuestionController);

router.put('/update-quiz/:id',
    checkAuth,
    quizController.updateQuizInfoController);


router.get('/get-leaderboard-quiz/:id',
    //checkRoleAuth,
    quizController.getLeaderBoardByQuizController);


export default router