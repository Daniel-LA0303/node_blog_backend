import express from "express"
import checkAuth from "../middleware/checkAuth";

import {
    changeStatusController,
    getNotificationsByUserController
} from "../controllers/notificationsController";


const router = express.Router();

router.get('/get-notifications-by-user-paginated/:id',checkAuth, getNotificationsByUserController);
router.post('/change-status/:id',checkAuth, changeStatusController);


export default router;