import express from "express";
import { addComment, deleteComment, editComment, getCommentsPaginatedByBlogId  } from "../controllers/commentsController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

/**
 * comments routes start
 */

// new comment --
router.post('/new-comment/:id', 
    checkAuth,
    addComment);

// edit comment --
router.put('/edit-comment/:id', 
    checkAuth,
    editComment);

// delete comment --
router.delete('/delete-comment/:id', 
    checkAuth,
    deleteComment);

/**
 * get comments paginated by post or blog
 */
router.get('/get-comments-paginated-by-blog/:id', getCommentsPaginatedByBlogId);
/**
 * comments routes end
 */
export default router;