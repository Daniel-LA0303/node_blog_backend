import Categories from '../models/Categories.js'
import categoriesServices from '../services/categoriesServices.js';

/**
 * Add new category
 * @param {*} req 
 * @param {*} res 
 */
const addCategory = async(req, res) => {
    const newCategory = new Categories(req.body);
    try {
        newCategory.name = req.body.name
        newCategory.value = req.body.name
        newCategory.label = req.body.name
        await newCategory.save();
        res.json({msg: 'Categories saved'});
    } catch (error) {
        res.status(500).json(error);
    }
}

/**
 * Update category
 * @param {*} req 
 * @param {*} res 
 */
const updateCategories = async (req, res, next) => {
try {
        const updates = req.body; // espera [{ id: "...", longDesc: "..." }, ...]

        if (!Array.isArray(updates)) {
            return res.status(400).json({ msg: 'Body must be an array of updates' });
        }

        const results = [];

        for (const item of updates) {
            const category = await Categories.findById(item.id);
            if (!category) {
                results.push({ id: item.id, status: 'not found' });
                continue;
            }

            if (item.longDesc !== undefined) category.longDesc = item.longDesc;

            await category.save();
            results.push({ id: item.id, status: 'updated', longDesc: category.longDesc });
        }

        res.json({ msg: 'Bulk update complete', results });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


/**
 * Get categories for new post
 * @returns 
 */
const getCategories = async() => {
    try {
        const cats = await Categories.find()
        return cats;
    } catch (error) {
        console.error("Error in getCategories:", error);
        throw new Error('Error to find categories');
    }
}

/**
 * Get all categfories that have more than 0 followers
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesNotZero = async () => {
    try {
        const cats = await Categories.find({ 'follows.countFollows': { $gt: 0 } })
            .select('name color follows.countFollows');
        return cats;
    } catch (error) {
        console.error("Error in getCategoriesNotZero:", error);
        throw new Error('Error to find categories');
    }
}

/**
 * Get all categories with basic ingo
 * @param {*} req 
 * @param {*} res 
 */
const getAllCategorisInfo = async(req, res) => {
    try {
        const cats = await Categories.find().populate('follows')
            .select('name color desc value label ');
        return cats;
    } catch (error) {
        console.error("Error in getAllCategorisInfo:", error);
        throw new Error('Error to find categories');
    }
}

/**
 * Get one category
 * @param {*} req 
 * @param {*} res 
 */
const getOneCategory = async(id) => {
    try {


        

        const category = await Categories.findOne({name : id})
        .populate('follows')
        .select('name color desc');
        return category;
    } catch (error) {
        
    }
}

export {
    /**
     * 
     */
    addCategory,
    getCategories,
    getOneCategory,
    updateCategories,
    getCategoriesNotZero,
    getAllCategorisInfo
    /**
     * 
     */
}