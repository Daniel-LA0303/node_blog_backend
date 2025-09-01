import express from "express";
import { addComment, getOneComment, deleteComment, editComment, getAllComments, getAllCommentsByPost, getCommentsPaginatedByBlogId  } from "../controllers/commentsController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();
/**
 * comments routes start
 */
router.get('/get-all-comments', getAllComments);
router.get('/get-all-comments-by-post/:id', getAllCommentsByPost);
router.get('/get-one-comment/:id', getOneComment);
router.post('/new-comment/:id', 
    checkAuth,
    addComment);
router.put('/edit-comment/:id', 
    checkAuth,
    editComment);
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