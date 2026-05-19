import express from "express";
import { countRepliesByCommentId, createReply, deleteReply, getAllReplies, getRepliesPaginatedByCommentId, getReply, updateReply } from "../controllers/repliesController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * replies routes start
 */
router.get('/get-all-replies', getAllReplies);
router.get('/get-one-reply/:id', getReply);

// new reply --
router.post('/new-reply/:id', 
    checkAuth,
    createReply);

// edit reply --
router.put('/edit-reply/:id', 
    checkAuth,
    updateReply);

// delete reply --
router.post('/delete-reply/:id', 
    checkAuth,
    deleteReply);

/**
 * replies paginated by comment --
 */
router.get('/get-replies-paginated-by-comment/:commentId', getRepliesPaginatedByCommentId);

// count replies --
router.get('/count-replies-by-comment/:commentId', countRepliesByCommentId);
/**
 * replies routes end
 */

export default router;