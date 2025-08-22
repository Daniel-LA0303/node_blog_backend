import Categories from "../models/Categories.js";

/**
 * get categories paginated
 * @param {*} page 
 * @param {*} limit 
 * @returns 
 */
const getCategoriesPaginatedService = async(page = 1, limit=10) => {
    try {
        const skip = (page -1) * limit;

        const categories = await Categories.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); 
        
        const total = await Categories.countDocuments();

        return {
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }

    } catch (error) {
        throw new Error("Error obteniendo categorías: " + err.message);
    }
}


export default {
    getCategoriesPaginatedService
}