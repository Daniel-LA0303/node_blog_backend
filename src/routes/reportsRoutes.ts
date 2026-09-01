import express from "express";
import checkAuth from "../middleware/checkAuth";
import reportsController from "../controllers/reportsController";
import checkRoleAuth from "../middleware/checkRoleAuth";

const router = express.Router();

router.post('/create-report', 
    checkAuth,
    reportsController.createReportController
);

router.get('/users-report', 
    checkRoleAuth,
    reportsController.getUsersPaginatedWithReportsInfoController
);

router.get('/categories-report', 
    checkRoleAuth,
    reportsController.getCategoriesPaginatedInfoController
);

export default router;