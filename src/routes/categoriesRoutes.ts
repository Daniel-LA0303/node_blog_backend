import express from "express";

import { 
    addCategory,
    getOneCategory,
    updateCategories 
} from "../controllers/categoriesController.js";

const router = express.Router();

/**
 * categories routes start
 */
router.post('/', addCategory); 


router.get('/:id', getOneCategory); 

// update category
router.put('/category/:id', updateCategories); 
/**
 * categories routes end
 */
export default router