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
    saveReplyComment,
    deleteReplyComment,
    editReplyComment,
    postsRecommend,
    dislikePost,
    unsavePost,
    getPostPaginated,
    getPostsByCategoryPaginated,
} from "../controllers/postController.js";
import checkAuth from "../middleware/checkAuth.js";


const router = express.Router();

// -- Upload image post start --//

// add image with cooudinary
router.post('/image-post',
    checkAuth,
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_post",
    }),
    uploadImagePostController,
); 
// -- Upload image post end --//

//-- CRUD post start --//

// new post --
router.post('/', 
    checkAuth,
    registerPost
);

// Home posts paginated -- 
router.get('/get-post-paginated', getPostPaginated);


router.get('/', getAllPosts); 
router.get('/:id', getOnePost); 

// update posts --
router.put('/:id', 
    checkAuth,
    updatePost);

router.delete('/:postId', 
    checkAuth,
    deletePost);
//-- CRUD post end --//

// -- Dashboard action start --//
router.get('/get-user-posts/:id', getUserPost);
// -- Dashboard action end --//


// -- Search start --//
router.get('/filter-post-by-category/:id', filterPostByCategory );
router.get('/search-by-param/:id', searchByParam);
router.get('/posts-recommend/:id', postsRecommend);
// -- Search end --//

//-- Actions post start --//

// like post --
router.post('/like-post/:id', 
    checkAuth,
    likePost);

// dislke post --
router.post('/dislike-post/:id', 
    checkAuth,
    dislikePost);

// svae post --
router.post('/save-post/:id', 
    checkAuth,
    savePost);

// unsave post --
router.post('/unsave-post/:id', 
    checkAuth,
    unsavePost)
//-- Actions post end --//


//-- Actions comment post start --//
router.post('/save-comment/:id', saveComment);
router.post('/delete-post-comment/:id', deleteComment);
router.post('/edit-post-comment/:id', editComment);
// -- Actions comment post end --//

// -- Actions reply comment post start --//
router.post('/save-reply-comment/:id', saveReplyComment);
router.post('/delete-reply-comment/:id', deleteReplyComment);
router.post('/edit-reply-comment/:id', editReplyComment);
// -- Actions reply comment post end --//

// get posts by category name paginated --
router.get('/get-posts-by-category-name/:id', getPostsByCategoryPaginated);

export default router