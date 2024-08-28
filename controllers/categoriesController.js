import Categories from '../models/Categories.js'

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
const updateCategories = async(req, res) => {  
    console.log(req.params.id); 
    const category = await Categories.findById(req.params.id);
    try {
        category.color = req.body.color;
        category.desc = req.body.desc;
        await category.save();
        res.json({msg: 'cateogry update'})
    } catch (error) {
        console.log(error);
        next();
    }
}

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