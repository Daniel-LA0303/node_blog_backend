import express from "express";
import { 
    registerPost,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost,
    likePost,
    savePost,
    saveComment
} from "../controllers/postController.js";


const router = express.Router();

//add new user
router.post('/', registerPost); 
router.get('/', getAllPosts); 
router.get('/:id', getOnePost); 
router.put('/:id', updatePost);
router.delete('/:id', deletePost);


router.post('/like-post/:id', likePost);
router.post('/save-post/:id', savePost);
router.post('/save-comment/:id', saveComment);

export default router