import express from "express";

import { 
    addCategory,
    getCategories,
    updateCategories 
} from "../controllers/categoriesController.js";

const router = express.Router();

router.post('/', addCategory); 
router.get('/', getCategories); 
router.post('/category/:id', updateCategories); 
export default router