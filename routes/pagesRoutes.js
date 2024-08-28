import express from "express";

import {
    getCategoriesNewPostPage,
    getCategoriesPage,
    getCategoryPostPage,
    getDashboardFollowUserPage,
    getDashboardLikePostUserPage,
    getDashboardPage,
    getDashboardPostsUserPage,
    getDashboardSavedPostUserPage,
    getDashboardTagsUserPage,
    getPageHome,
    getProfileInfoPage,
    getViewPostPage
} from "../controllers/pagesController.js";
import { getProfileEditUserPage } from "../controllers/pagesController.js";
import { getEditPostPage } from "../controllers/pagesController.js";

const router = express.Router();


/**
 * pages routes start
 */

/**
 * pages routes general start
 */
router.get('/page-home', getPageHome); 
router.get('/page-categories', getCategoriesPage);
router.get('/page-category-post/:id', getCategoryPostPage);
router.get('/page-profile-user/:id', getProfileInfoPage);
/**
 * pages routes general end
 */

/**
 * pages routes privade start
 */
router.get('/page-dashboard/:id', getDashboardPage);
router.get('/page-dashboard-post-user/:id', getDashboardPostsUserPage);
router.get('/page-dashboard-follow-user/:id', getDashboardFollowUserPage);
router.get('/page-dashboard-liked-post-user/:id', getDashboardLikePostUserPage);
router.get('/page-dashboard-saved-post-user/:id', getDashboardSavedPostUserPage);
router.get('/page-dashboard-tag-user/:id', getDashboardTagsUserPage);
router.get('/page-new-post', getCategoriesNewPostPage);
router.get('/page-edit-profile/:id', getProfileEditUserPage);
router.get('/page-edit-post/:id',getEditPostPage );
router.get('/page-view-post/:id',getViewPostPage );
/**
 *  pages routes privade end
 */
/**
 * pages routes end
 */

export default router;