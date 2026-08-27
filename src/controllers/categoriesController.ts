import Categories from '../models/Categories'

/**
 * Add new category
 */
const addCategory = async(req: any, res: any) => {
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
 */
const updateCategories = async (req: any, res: any, next: any) => {
try {
        const updates = req.body; 

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
 * Get categories for new post THIS IS A SERVICE
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
 * Get one category THIS IS A SERVICE
 */
const getOneCategory = async(id: any) => {
    try {
        const category = await Categories.findOne({name : id})
        .populate('follows')
        .select('name color desc');
        return category;
    } catch (error) {
        
    }
}

export {
    addCategory,
    getCategories,
    getOneCategory,
    updateCategories,
}