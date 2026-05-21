import express from "express";

import {
    getCategoriesNewPostPage,
    getCategoriesPage,
    getCategoriesSearchController,
    getCategoryPostPage,
    getDashboardFollowedByUserPage,
    getDashboardFollowersByUserPage,
    getDashboardFollowUserPage,
    getDashboardLikePostUserPage,
    getDashboardPage,
    getDashboardPostsUserPage,
    getDashboardSavedPostUserPage,
    getDashboardTagsUserPage,
    getGlobalSearchController,
    getPageHome,
    getPostsSearchController,
    getProfileInfoPage,
    getUsersSearchController,
    getViewPostPage,
} from "../controllers/pagesController.js";
import { getProfileEditUserPage } from "../controllers/pagesController.js";
import { getEditPostPage } from "../controllers/pagesController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();


/**
 * pages routes start
 */

/**
 * pages routes general start
 */

// Home page --
router.get('/page-home', getPageHome); 

// Page categories --
router.get('/page-categories', getCategoriesPage);

// Posts by category page --
router.get('/page-category-post/:id', getCategoryPostPage);

// Get info by user 
router.get('/page-profile-user/:id', getProfileInfoPage);
/**
 * pages routes general end
 */

/**
 * pages routes privade start
 */

// page dashboar by user -- 
router.get('/page-dashboard/:id', 
    checkAuth,
    getDashboardPage);


// get post by user --
router.get('/page-dashboard-post-user/:id', 
    checkAuth,
    getDashboardPostsUserPage);

router.get('/page-dashboard-follow-user/:id', getDashboardFollowUserPage);

// page get followers --
router.get('/page-dashboard-followers-user/:id', 
    checkAuth,
    getDashboardFollowersByUserPage);

// page get followed --
router.get('/page-dashboard-followed-user/:id', 
    checkAuth,
    getDashboardFollowedByUserPage);

// page get post liked --
router.get('/page-dashboard-liked-post-user/:id', 
    checkAuth,
    getDashboardLikePostUserPage);

// get post saved by user --
router.get('/page-dashboard-saved-post-user/:id', 
    checkAuth,
    getDashboardSavedPostUserPage);

// page tags user followed --
router.get('/page-dashboard-tag-user/:id', 
    checkAuth,
    getDashboardTagsUserPage);

router.get('/page-new-post', getCategoriesNewPostPage);

// page edit profile --
router.get('/page-edit-profile/:id', 
    checkAuth,
    getProfileEditUserPage);

// get info to edit post --
router.get('/page-edit-post/:id',
    checkAuth,
    getEditPostPage );

// get one post view --
router.get('/page-view-post/:id', getViewPostPage );

/**
 * search routes
 */
// search global first --
router.get("/global/:q", getGlobalSearchController);

// Search routes ---
router.get("/posts/:q", getPostsSearchController);
router.get("/categories/:q", getCategoriesSearchController);
router.get("/users/:q", getUsersSearchController);

/**
 *  pages routes privade end
 */
/**
 * pages routes end
 */

export default router;