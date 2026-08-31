import { ICreateCategory } from '../interfaces/categories.interfaces'
import Categories from '../models/Categories'
import categoriesServices from '../services/categoriesServices'
import { ApiResponse } from '../utils/ApiResponse'

/**
 * Add new category
 */
const addCategoryController = async (req: any, res: any, next: any) => {

    try {

        const dto: ICreateCategory = {
            name: req.body.name,
            color: req.body.color,
            desc: req.body.desc,
            value: req.body.name,
            label: req.body.name,
            longDesc: req.body.longDesc
        }

        const response = await categoriesServices.createCategoryService(dto);

        res.status(201).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                response,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}


const searchCategoryController = async (req: any, res: any, next: any) => {

    try {

        const query = req.query.search

        const repsonse = await categoriesServices.getCategoriesByNameService(query);

        res.status(201).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category updated successfully",
                repsonse,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const updateCategoryController = async (req: any, res: any, next: any) => {

    try {

        const id = req.params.id;

        const dto: ICreateCategory = {
            name: req.body.name,
            color: req.body.color,
            desc: req.body.desc,
            value: req.body.name,
            label: req.body.name,
            longDesc: req.body.longDesc
        }

        const repsonse = await categoriesServices.updateCategoryService(dto, id);

        res.status(201).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category updated successfully",
                repsonse,
                false
            )
        );
    } catch (error) {
        next(error);
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
const getCategories = async () => {
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
const getOneCategory = async (id: any) => {
    try {
        const category = await Categories.findOne({ name: id })
            .populate('follows')
            .select('name color desc');
        return category;
    } catch (error) {

    }
}

export {
    addCategoryController,
    updateCategoryController,
    getCategories,
    getOneCategory,
    updateCategories,
    searchCategoryController
}