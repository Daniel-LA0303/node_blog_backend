import express from "express";
import fileUpload from "express-fileupload";
import checkAuth from "../middleware/checkAuth.js"
import { 
    //-- auth user start --//
    registerUserController, 
    loginController, 
    confirmController,
    forgetPasswordController,
    checkTokenController,
    newPasswordController,
    //-- auth user end --//
    //-- crud user start --//
    updateUserController,
    getOneUserController,
    //-- crud user end --//

    //-- Dashboard start --//
    getOneUserFollowController,
    //-- Dashboard end --//
    //-- User actions start --//
    followTagController,
    unFollowTagController,
    followUserController,
    unfollowUserController,
    getPostsByUserPaginatedController,
    searchUsersController,
    getBlogsRecommendedController,
    getTagsRecommendedController,
    getUsersRecommendedController,
    refreshTokenController,
    testRoleController,
    createModerController,
    removeModerController,
    searchUsersToAdminPanelController,
    //-- User actions end --//
} from "../controllers/usersController";
import checkRefreshToken from "../middleware/checkRefreshToken.js";
import { loginRateLimiter } from "../rate-limiter/ratesLimits.js";
import checkRoleAuth from "../middleware/checkRoleAuth.js";

const router = express.Router();


//add new user --
router.post('/', 
    // rete limit
    registerUserController); 

// auth user login --
router.post('/login', 
    // here rate limit
    loginRateLimiter,
    loginController);


// //confirm user
router.get('/confirm/:token', confirmController);
//forget password
router.post('/new-password', forgetPasswordController);

router.route('/new-password/:token')
    .get(checkTokenController) // check token then send to change pass
    .post(newPasswordController) // new pass

router.post('/new-info/:id', 
    checkAuth,    
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_pro",
    }),updateUserController);

router.get('/get-profile/:id', getOneUserController);

//-- Dashboard start --//

router.get('/get-profile-follows/:id', getOneUserFollowController);
//-- Dashboard end --//

//-- User actions start --//

// user follow a tag --
router.post('/follow-tag/:id', 
    checkAuth,
    followTagController);

// user unfollow a tag --
router.post('/unfollow-tag/:id', 
    checkAuth,
    unFollowTagController);

// user follor others users -- 
router.post('/user-follow/:id', 
    checkAuth,
    followUserController);

router.post('/refresh-tokens',
    checkRefreshToken, 
    refreshTokenController);

// user unfollow other user --
router.post('/user-unfollow/:id', 
    checkAuth,
    unfollowUserController);
//-- User actions end --//

// posts by user paginated --
router.get("/posts-by-user/:id", getPostsByUserPaginatedController);

router.get("/search", searchUsersController);

router.get("/get-blogs-recommended", checkAuth, getBlogsRecommendedController);
router.get("/get-users-recommended", checkAuth, getUsersRecommendedController);
router.get("/get-tags-recommended", checkAuth, getTagsRecommendedController);

router.post('/test-role', 
    checkRoleAuth,
    testRoleController);

router.post('/create-mod', 
    checkRoleAuth,
    createModerController);
router.post('/remove-mod', 
    checkRoleAuth,
    removeModerController);

router.get("/search-mod", 
    //checkRoleAuth,
    searchUsersToAdminPanelController);


export default router