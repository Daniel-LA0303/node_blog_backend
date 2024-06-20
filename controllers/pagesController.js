import { getAllCategorisInfo, getCategories, getCategoriesNotZero, getOneCategory } from "./categoriesController.js";
import { filterPostByCategory, getAllPosts, getAllPostsCard, getUserPost } from "./postController.js"
import { getOneUserFollow, getOneUserProfile, getOneUserShortInfo, getUserLikePosts, getUserPosts, getUserSavePosts, getUserTags } from "./usersController.js";



const getPageHome = async (req, res) => {
    try {
        console.log("espera Home");
        const [posts, categories] = await Promise.all([getAllPostsCard(), getCategoriesNotZero()]);
        res.status(200).json({
            posts,
            categories,
        });
        // console.log();
        console.log("exito Home");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getCategoriesPage = async (req, res) => {
    try {
        console.log("espera Categories");
        const categories = await getAllCategorisInfo();
        res.status(200).json({
            categories
        });
        console.log("exito Categories");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getCategoryPostPage = async (req, res) => {

    try {
        console.log("espera CategoryPost");
        const [posts, category] = await Promise.all([filterPostByCategory(req.params.id), getOneCategory(req.params.id)]);
        res.status(200).json({
            posts,
            category
        });
        console.log("exito CategoryPost");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}

const getDashboardPage = async (req, res) => {
    try {
        console.log("espera Dashboard");
        const userInfo = await getOneUserShortInfo(req.params.id);
        res.status(200).json({
            userInfo
        });
        console.log("exito Dashboard");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}



const getDashboardPostsUserPage = async (req, res) => {
    try {
        console.log("espera DashboardPosts");
        const posts = await getUserPosts(req.params.id);
        res.status(200).json({posts});
        console.log("exito DashboardPosts");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}


const getDashboardFollowUserPage = async (req, res) => {
    try {
        console.log("espera DashboardFollow");
        const userInfo = await getOneUserFollow(req.params.id);
        res.status(200).json({
            followers: userInfo.followers,
            followed: userInfo.followed
        });
        console.log("exito DashboardFollow");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getDashboardLikePostUserPage = async (req, res) => {


    try {
        console.log("espera DashboardLike");
        const userInfo = await getUserLikePosts(req.params.id);
        res.status(200).json({
            userInfo
        });
        console.log("exito DashboardLike");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}

const getDashboardSavedPostUserPage = async (req, res) => {

    try {
        console.log("espera DashboardSaved");
        const posts = await getUserSavePosts(req.params.id);
        res.status(200).json({
            posts
        });
        console.log("exito DashboardSaved");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}


const getDashboardTagsUserPage = async (req, res) => {

    try {
        console.log("espera DashboardTags");
        const categories = await getUserTags(req.params.id);
        res.status(200).json({
            categories
        });
        console.log("exito DashboardTags");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}

const getProfileInfoPage = async (req, res) => {

    try {
        console.log("espera ProfileInfo");
        const [posts, user] = await Promise.all([getUserPosts(req.params.id), getOneUserProfile(req.params.id)]);
        res.status(200).json({
            posts,
            user
        });
        console.log("exito ProfileInfo");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }

}

const getCategoriesNewPostPage = async (req, res) => {
    try {
        console.log("espera CategoriesNewPost");
        const categories = await getCategories();
        res.status(200).json({
            categories
        });
        console.log("exito CategoriesNewPost");
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error });
    }
}



export {
    getPageHome,
    getCategoriesPage,
    getCategoryPostPage,
    getCategoriesNewPostPage,
    /**
     * 
     */
    getDashboardPage,
    getDashboardPostsUserPage,
    getDashboardFollowUserPage,
    getDashboardLikePostUserPage,
    getDashboardSavedPostUserPage,
    getDashboardTagsUserPage,
    /**
     * 
     */
    getProfileInfoPage
}
