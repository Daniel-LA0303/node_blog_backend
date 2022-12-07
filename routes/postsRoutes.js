import express from "express";
import { 
    registerPost,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost
} from "../controllers/postController.js";


const router = express.Router();

//add new user
router.post('/', registerPost); 
router.get('/', getAllPosts); 
router.get('/:id', getOnePost); 
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router