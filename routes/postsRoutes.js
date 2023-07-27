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
    filterPostByCategory,
    searchByParam,
} from "../controllers/postController.js";


const router = express.Router();

// -- Upload image post start --//
router.post('/image-post',
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_post",
    }),
    uploadImagePostController,
); 
// -- Upload image post end --//

//-- CRUD post start --//
router.post('/', registerPost)
router.get('/', getAllPosts); 
router.get('/:id', getOnePost); 
router.put('/:id', 
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_post",
    }), updatePost);
router.delete('/:id', deletePost);
//-- CRUD post end --//

// -- Dashboard action start --//
router.get('/get-user-posts/:id', getUserPost);
// -- Dashboard action end --//


// -- Search start --//
router.get('/filter-post-by-category/:id', filterPostByCategory );
router.get('/search-by-param/:id', searchByParam);
// -- Search end --//

//-- Actions post start --//
router.post('/like-post/:id', likePost);
router.post('/save-post/:id', savePost);
//-- Actions post end --//


//-- Actions comment post start --//
router.post('/save-comment/:id', saveComment);
router.post('/delete-post-comment/:id', deleteComment);
router.post('/edit-post-comment/:id', editComment);
// -- Actions comment post end --//

export default router