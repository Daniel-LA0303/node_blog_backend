import { getAllCategorisInfo, getCategories, getCategoriesNotZero, getOneCategory } from "./categoriesController.js";
import { filterPostByCategory, getAllPosts, getAllPostsCard } from "./postController.js"
import { getOneUserFollow, getOneUserShortInfo, getUserLikePosts, getUserSavePosts, getUserTags } from "./usersController.js";



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
        res.status(200).json({
            categories
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getCategoryPostPage = async (req, res) => {

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
        const userInfo = await getOneUserShortInfo(req.params.id);
        res.status(200).json({
            userInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}



const getDashboardPostsUserPage = async (req, res) => {
    
}


const getDashboardFollowUserPage = async (req, res) => {
    try {
        
        const userInfo = await getOneUserFollow(req.params.id);
        res.status(200).json({
            followers: userInfo.followers,
            followed: userInfo.followed
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getDashboardLikePostUserPage = async (req, res) => {


    try {
        const userInfo = await getUserLikePosts(req.params.id);
        res.status(200).json({
            userInfo
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getDashboardSavedPostUserPage = async (req, res) => {

    try {
        const posts = await getUserSavePosts(req.params.id);
        res.status(200).json({
            posts
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}


const getDashboardTagsUserPage = async (req, res) => {

    try {
        const categories = await getUserTags(req.params.id);
        res.status(200).json({
            categories
        });
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}



export {
    getPageHome,
    getCategoriesPage,
    getCategoryPostPage,
    /**
     * 
     */
    getDashboardPage,
    getDashboardPostsUserPage,
    getDashboardFollowUserPage,
    getDashboardLikePostUserPage,
    getDashboardSavedPostUserPage,
    getDashboardTagsUserPage
    /**
     * 
     */
}
