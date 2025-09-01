import express from "express";
import { countRepliesByCommentId, createReply, deleteReply, getAllReplies, getRepliesPaginatedByCommentId, getReply, updateReply } from "../controllers/repliesController.js";

const router = express.Router();

/**
 * replies routes start
 */
router.get('/get-all-replies', getAllReplies);
router.get('/get-one-reply/:id', getReply);
router.post('/new-reply/:id', createReply);
router.put('/edit-reply/:id', updateReply);
router.post('/delete-reply/:id', deleteReply);

/**
 * replies paginated by comment
 */
router.get('/get-replies-paginated-by-comment/:commentId', getRepliesPaginatedByCommentId);
router.get('/count-replies-by-comment/:commentId', countRepliesByCommentId);
/**
 * replies routes end
 */

export default router;