import express from "express"
import checkAuth from "../middleware/checkAuth";

import {
    getNotificationsByUserController
} from "../controllers/notificationsController";


const router = express.Router();

router.get('/get-notifications-by-user-paginated/:id',checkAuth, getNotificationsByUserController);


export default router;