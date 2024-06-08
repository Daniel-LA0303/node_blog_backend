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
    getProfileInfoPage
} from "../controllers/pagesController.js";

const router = express.Router();

router.get('/page-home', getPageHome); 
router.get('/page-categories', getCategoriesPage);
router.get('/page-category-post/:id', getCategoryPostPage);
router.get('/page-new-post', getCategoriesNewPostPage);
/**
 * 
 */
router.get('/page-dashboard/:id', getDashboardPage);
router.get('/page-dashboard-post-user/:id', getDashboardPostsUserPage);
router.get('/page-dashboard-follow-user/:id', getDashboardFollowUserPage);
router.get('/page-dashboard-liked-post-user/:id', getDashboardLikePostUserPage);
router.get('/page-dashboard-saved-post-user/:id', getDashboardSavedPostUserPage);
// router.get('/page-dashboard-followed-user/:id', getDashboardFollowedUserPage);
router.get('/page-dashboard-tag-use/:id', getDashboardTagsUserPage);
/**
 * 
 */
router.get('/page-profile-user/:id', getProfileInfoPage);

export default router