import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import auditLogController from "../controllers/auditLogController";

const router = express.Router();

router.get('/get-audit-logs', 
    checkRoleAuth,
    auditLogController.getAuditLogInfoController); 


export default router