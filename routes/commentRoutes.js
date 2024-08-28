import express from "express";
import { addComment, getOneComment, deleteComment, editComment, getAllComments, getAllCommentsByPost  } from "../controllers/commentsController.js";

const router = express.Router();
/**
 * comments routes start
 */
router.get('/get-all-comments', getAllComments);
router.get('/get-all-comments-by-post/:id', getAllCommentsByPost);
router.get('/get-one-comment/:id', getOneComment);
router.post('/new-comment/:id', addComment);
router.put('/edit-comment/:id', editComment);
router.delete('/delete-comment/:id', deleteComment);
/**
 * comments routes end
 */
export default router;