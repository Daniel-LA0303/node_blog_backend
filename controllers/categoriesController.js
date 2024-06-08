import Categories from '../models/Categories.js'

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
 * Get categories for new post
 * @returns 
 */
const getCategories = async() => {
    try {
        const cats = await Categories.find().populate('follows');
        return cats;
    } catch (error) {
        
    }
}

/**
 * Get all categfories that have more than 0 followers
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesNotZero = async(req, res) => {

    try {
        const cats = await Categories.find({ 'follows.countFollows': { $gt: 0 } })
            .select('name color follows.countFollows');
        return cats;
    } catch (error) {
        res.status(500).json(error);
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
            .select('name color desc');
        return cats;
    } catch (error) {
        res.status(500).json(error);
    }
}


/**
 * 
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
        // res.status(500).json(error);
    }
}


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

export {
    addCategory,
    getCategories,
    getCategoriesNotZero,
    getAllCategorisInfo,
    getOneCategory,
    updateCategories
}