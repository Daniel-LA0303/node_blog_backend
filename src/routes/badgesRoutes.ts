import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import badgesController from "../controllers/badgesController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

router.post(
    '/create-badge',
    checkRoleAuth,
    badgesController.createBadgeController
);

router.get(
    '/get-badges',
    checkRoleAuth,
    badgesController.getBadgesPaginatedController
);

router.put(
    '/update-badge/:id',
    checkRoleAuth,
    badgesController.updateBadgeController
);

router.delete(
    '/delete-badge/:id',
    checkRoleAuth,
    badgesController.deleteBadgeController
);

router.get('/badges-by-user/:userId', 
    checkAuth, 
    badgesController.getBadgesByUserController);

export default router;