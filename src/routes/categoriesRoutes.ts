import express from "express";

import { 
    addCategoryController,
    updateCategoryController,
    getOneCategory,
    updateCategories, 
    searchCategoryController
} from "../controllers/categoriesController";
import checkRoleAuth from "../middleware/checkRoleAuth";

const router = express.Router();

/**
 * categories routes start
 */
router.post('/', 
    checkRoleAuth,
    addCategoryController); 

router.put('/update-category/:id', 
    checkRoleAuth,
    updateCategoryController);   

router.put('/update/:id', 
    checkRoleAuth,
    updateCategories);

router.get('/search-category', 
    checkRoleAuth,
    searchCategoryController);

router.get('/:id', getOneCategory); 

// update category
router.put('/category/:id', updateCategories); 
/**
 * categories routes end
 */
export default router