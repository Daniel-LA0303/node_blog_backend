import express from "express";

import {
    getCategoriesPage,
    getCategoryPostPage,
    getDashboardPage,
    getPageHome
} from "../controllers/pagesController.js";

const router = express.Router();

router.get('/page-home', getPageHome); 
router.get('/page-categories', getCategoriesPage);
router.get('/page-category-post/:id', getCategoryPostPage);
router.get('/page-dashboard/:id', getDashboardPage);

export default router