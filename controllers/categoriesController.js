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

const getCategories = async(req, res) => {
    try {
        const cats = await Categories.find().populate('follows');
        res.status(200).json(cats);
    } catch (error) {
        res.status(500).json(error);
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
    updateCategories
}