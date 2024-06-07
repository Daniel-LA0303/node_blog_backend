import { getCategories, getCategoriesNotZero } from "./categoriesController.js";
import { getAllPosts, getAllPostsCard } from "./postController.js"
import { getUserTags } from "./usersController.js";



const getPageHome = async (req, res) => {
    try {
        const [posts, categories] = await Promise.all([getAllPostsCard(), getCategoriesNotZero()]);
        const data = {
            posts: posts,
            categories: categories,
        }
        console.log(data);
        res.status(200).json({
            posts,
            categories,
        });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed', details: error });
    }
}

export {
    getPageHome
}