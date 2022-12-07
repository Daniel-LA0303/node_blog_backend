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
        const cats = await Categories.find();
        res.status(200).json(cats);
    } catch (error) {
        res.status(500).json(error);
    }
}

export {
    addCategory,
    getCategories
}