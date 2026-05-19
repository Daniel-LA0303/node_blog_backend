import Categories from "../models/Categories.js";
import User from "../models/User.js";

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

    } catch (error) {
        throw new Error("Error obteniendo categorías: " + err.message);
    }
}

const getOneCategoryFullInfo = async (categoryName, userId) => {

    // 1. search ctaegory
    const category = await Categories.findOne({ name: categoryName })
    if (!category) return null;

    // 2. get users with info
    const usersPopulated = await User.aggregate([
        { $match: { _id: { $in: category.follows.users } } },
        { $sample: { size: Math.min(category.follows.users.length, 5) } },
        { $project: { name: 1, profilePicture: 1 } }
    ]);

    // 4. get categories relation with out category
    const relatedCategories = await Categories.aggregate([
        { $match: { _id: { $ne: category._id } } },
        { $sample: { size: 5 } },
        { $project: { name: 1, color: 1, desc: 1, follows: 1 } }
    ]);

    // 5. get a small user info
    const userInfo = await User.findById(userId)
        .select("posts")
        .populate({
            path: "posts",
            select: "categories",
        })
        .lean();

    const countsPosts = userInfo.posts.filter(post =>
        post.categories.map(c => c.toString()).includes(category._id.toString())
    ).length;


    // 5. return info
    return {
        category: {
            _id: category._id,
            name: category.name,
            color: category.color,
            desc: category.desc,
            longDesc: category.longDesc,
            follows: category.follows,
            countFollows: category.follows.countFollows,
        },
        users: usersPopulated,
        relatedCategories,
        countsPosts
    };
};

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