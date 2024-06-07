import express from "express";

import {
    getPageHome
} from "../controllers/pagesController.js";

const router = express.Router();

router.get('/page-home', getPageHome); 

export default router