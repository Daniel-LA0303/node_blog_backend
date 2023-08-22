import express from "express";
import fileUpload from "express-fileupload";
import checkAuth from "../middleware/checkAuth.js"
import { 
    //-- auth user start --//
    registerUser, 
    authUser, 
    confirm,
    forgetPassword,
    checkToken,
    newPassword,
    profile,
    //-- auth user end --//
    //-- crud user start --//
    newInfoUser,
    getOneUser,
    getAllUsers,
    //-- crud user end --//

    //-- Dashboard start --//
    getOneUserFollow,
    getUserTags,
    getUserPosts,
    getUserLikePosts,
    getUserSavePosts,
    //-- Dashboard end --//
    //-- User actions start --//
    followTag,
    unFollowTag,
    followUser,
    unfollowUser
    //-- User actions end --//
} from "../controllers/usersController.js";

const router = express.Router();


//add new user
router.post('/', registerUser); 
// // auth user
router.post('/login', authUser);
// //confirm user
router.get('/confirm/:token', confirm);
//forget password
router.post('/new-password', forgetPassword);

router.route('/new-password/:token')
    .get(checkToken) //comprueba el token que se manda cuando se ejecuta olvidePassword
    .post(newPassword) //redirije a una pestaña para nuevo password

router.post('/new-info/:id',     
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads_pro",
    }),newInfoUser);

router.get('/get-profile/:id', getOneUser);

//-- Dashboard start --//
router.get('/get-user-tags/:id', getUserTags);

router.get('/get-user-posts/:id', getUserPosts)

router.get('/get-user-like-posts/:id', getUserLikePosts);

router.get('/get-user-save-post/:id', getUserSavePosts);

router.get('/get-profile-follows/:id', getOneUserFollow);
//-- Dashboard end --//

//-- User actions start --//
router.post('/follow-tag/:id', followTag);
router.post('/unfollow-tag/:id', unFollowTag);

router.post('/user-follow/:id', followUser);
router.post('/user-unfollow/:id', unfollowUser);
// router.post('/user-follow/:id', followAndFollowed);
//-- User actions end --//

router.get('/all-users', getAllUsers);

router.get('/profile', 
        checkAuth, 
        profile);

export default router