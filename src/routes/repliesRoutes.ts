import express from "express";
import { 
    countRepliesByCommentIdController, 
    createReplyController, 
    deleteReplyController, 
    getRepliesPaginatedByCommentIdController, 
    updateReplyController
} from "../controllers/repliesController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * replies routes start
 */
// new reply --
router.post('/new-reply/:id', 
    checkAuth,
    createReplyController);

// edit reply --
router.put('/edit-reply/:id', 
    checkAuth,
    updateReplyController);

// delete reply --
router.post('/delete-reply/:id', 
    checkAuth,
    deleteReplyController);

/**
 * replies paginated by comment --
 */
router.get('/get-replies-paginated-by-comment/:commentId', getRepliesPaginatedByCommentIdController);

// count replies --
router.get('/count-replies-by-comment/:commentId', countRepliesByCommentIdController);
/**
 * replies routes end
 */

export default router;