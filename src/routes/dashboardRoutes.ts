import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import { getAllCountDocumentsController, getCategoriesInfoController, getCountPostsByStatusController, getCountReportsByStatusController, getEngagementStatsByDateRangeController, getListProjectQuizLast7DaysController, getMessagesLast7DaysController, getModerationActionsByDateRangeSController, getNotificationsLast7DaysController, getRecentLogsInfoController, getTopModeratorsController, getUsersByStatusDateRangeController } from "../controllers/dashboardController";

const router = express.Router();

router.get('/get-counts', 
    checkRoleAuth,
    getAllCountDocumentsController);
    
router.get('/get-count-post-status', 
    checkRoleAuth,
    getCountPostsByStatusController); 

router.get('/get-top-mods', 
    checkRoleAuth,
    getTopModeratorsController); 

router.get('/get-recent-logs', 
    checkRoleAuth,
    getRecentLogsInfoController); 

router.get('/get-cats-info', 
    checkRoleAuth,
    getCategoriesInfoController); 

router.get('/get-basic-engagement', 
    checkRoleAuth,
    getEngagementStatsByDateRangeController); 

router.get('/get-reports-info', 
    checkRoleAuth,
    getCountReportsByStatusController); 

router.get('/get-messages-info', 
    checkRoleAuth,
    getMessagesLast7DaysController); 

router.get('/get-notifications-info', 
    checkRoleAuth,
    getNotificationsLast7DaysController); 

router.get('/get-users-info', 
    checkRoleAuth,
    getUsersByStatusDateRangeController); 

router.get('/get-moderation-info', 
    checkRoleAuth,
    getModerationActionsByDateRangeSController); 

router.get('/get-creation-activity', 
    checkRoleAuth,
    getListProjectQuizLast7DaysController); 

export default router