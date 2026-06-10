import mongoose from "mongoose";
import { IPost } from "../interfaces/post.interfaces";
import Categories from "../models/Categories";
import User from "../models/User";
import { trackActivity } from "./globalServices";

/**
 * get categories paginated
 * @param {*} page 
 * @param {*} limit 
 * @returns 
 */
const getCategoriesPaginatedService = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

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

    } catch (error: any) {
        throw new Error("Error obteniendo categorías: " + error.message);
    }
}

const getOneCategoryFullInfo = async (categoryName: any, userId: any) => {

    // 1. search category
    const category = await Categories.findOne({ name: categoryName })
    if (!category) return null

    // 2. get users with info
    const usersPopulated = await User.aggregate([
        { $match: { _id: { $in: category.follows.users } } },
        { $sample: { size: Math.min(category.follows.users.length, 5) } },
        { $project: { name: 1, profilePicture: 1 } }
    ])

    // 3. get related categories without current
    const relatedCategories = await Categories.aggregate([
        { $match: { _id: { $ne: category._id } } },
        { $sample: { size: 5 } },
        { $project: { name: 1, color: 1, desc: 1, follows: 1 } }
    ]);

    await trackActivity(userId);

    // 4. count user posts in this category (only if logged in)
    let countsPosts = 0
    const isValidUserId = userId && userId !== 'null' && mongoose.Types.ObjectId.isValid(userId)

    if (isValidUserId) {
        const userInfo = await User.findById(userId)
            .select("posts")
            .populate({ path: "posts", select: "categories" })
            .lean()

        const posts = userInfo?.posts as unknown as IPost[]
        countsPosts = posts?.filter((post) =>
            post.categories
                .map((c) => c.toString())
                .includes(category._id.toString())
        ).length ?? 0
    }

    // 5. return info
    return {
        category: {
            _id:          category._id,
            name:         category.name,
            color:        category.color,
            desc:         category.desc,
            longDesc:     category.longDesc,
            follows:      category.follows,
            countFollows: category.follows.countFollows,
        },
        users:             usersPopulated,
        relatedCategories,
        countsPosts,
    }
}

const getCategoriesByNamePaginatedService = async (page = 1, limit = 5, name = "") => {
    // 1. calcular skip
    const skip = (page - 1) * limit;

    // 2. query base (regex por nombre de categoría)
    const query = { name: { $regex: name, $options: "i" } };

    // 3. obtener categorías paginadas
    const categories = await Categories.find(query)
        .skip(skip)
        .limit(limit)
        // .select("_id name value label color createdAt")
        .sort({ createdAt: -1 });

    // 4. calcular total
    const total = await Categories.countDocuments(query);

    // 5. return info
    return {
        data: categories,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export default {
    getCategoriesPaginatedService,
    getOneCategoryFullInfo,
    getCategoriesByNamePaginatedService
}