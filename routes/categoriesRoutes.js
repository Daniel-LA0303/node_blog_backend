import express from "express";

import { 
    addCategory,
    getCategories,
    getOneCategory,
    updateCategories 
} from "../controllers/categoriesController.js";

const router = express.Router();

router.post('/', addCategory); 
router.get('/', getCategories); 
router.get('/:id', getOneCategory); 
router.post('/category/:id', updateCategories); 
export default router