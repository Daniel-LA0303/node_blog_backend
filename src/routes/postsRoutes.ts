import express from "express";
import fileUpload from "express-fileupload";
import { 
    registerPostController,
    getOnePostController,
    updatePostController,
    deletePostController,
    likePostController,
    savePostController,
    uploadImagePostController,
    filterPostByCategoryController,
    searchByParamController,
    dislikePostController,
    unsavePostController,
    getPostPaginated,
    getPostsByCategoryPaginatedController,
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
    registerPostController
);

// Home posts paginated -- 
router.get('/get-post-paginated', getPostPaginated);

router.get('/:id', getOnePostController); 

// update posts --
router.put('/:id', 
    checkAuth,
    updatePostController);

router.delete('/:postId', 
    checkAuth,
    deletePostController);
//-- CRUD post end --//

// -- Search start --//
router.get('/filter-post-by-category/:id', filterPostByCategoryController);
router.get('/search-by-param/:id', searchByParamController);
// -- Search end --//

//-- Actions post start --//

// like post --
router.post('/like-post/:id', 
    checkAuth,
    likePostController);

// dislke post --
router.post('/dislike-post/:id', 
    checkAuth,
    dislikePostController);

// svae post --
router.post('/save-post/:id', 
    checkAuth,
    savePostController);

// unsave post --
router.post('/unsave-post/:id', 
    checkAuth,
    unsavePostController)
//-- Actions post end --//

// get posts by category name paginated --
router.get('/get-posts-by-category-name/:id', getPostsByCategoryPaginatedController);

export default router