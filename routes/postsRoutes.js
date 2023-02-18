import express from "express";
import fileUpload from "express-fileupload";
import { 
    registerPost,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost,
    likePost,
    savePost,
    saveComment,
    deleteComment,
    editComment,
    getUserPost,
    uploadImagePostController,
} from "../controllers/postController.js";


const router = express.Router();

//add new user
router.post('/image-post',
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_post",
    }),
    uploadImagePostController,
    // registerPost
); 
router.post('/', registerPost)
router.get('/', getAllPosts); 
router.get('/:id', getOnePost); 
router.put('/:id', 
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_post",
    }), updatePost);
router.delete('/:id', deletePost);
router.get('/get-user-posts/:id', getUserPost);


router.post('/like-post/:id', likePost);
router.post('/save-post/:id', savePost);

router.post('/save-comment/:id', saveComment);
router.post('/delete-post-comment/:id', deleteComment);
router.post('/edit-post-comment/:id', editComment);

export default router