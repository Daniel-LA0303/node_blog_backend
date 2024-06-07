import { getAllCategorisInfo, getCategories, getCategoriesNotZero, getOneCategory } from "./categoriesController.js";
import { filterPostByCategory, getAllPosts, getAllPostsCard } from "./postController.js"
import { getOneUserShortInfo, getUserTags } from "./usersController.js";



const getPageHome = async (req, res) => {
    try {
        const [posts, categories] = await Promise.all([getAllPostsCard(), getCategoriesNotZero()]);
        res.status(200).json({
            posts,
            categories,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategorisInfo();
        console.log(categories);
        res.status(200).json({
            categories
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getCategoryPostPage = async (req, res) => {
    console.log(req.params.id);
    try {
        const [posts, category] = await Promise.all([filterPostByCategory(req.params.id), getOneCategory(req.params.id)]);
        res.status(200).json({
            posts,
            category
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}

const getDashboardPage = async (req, res) => {
    try {
        console.log(req.params.id);
        const userInfo = await getOneUserShortInfo(req.params.id);
        // console.log(userInfo);
        res.status(200).json({
            userInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

export {
    getPageHome,
    getCategoriesPage,
    getCategoryPostPage,
    getDashboardPage
}