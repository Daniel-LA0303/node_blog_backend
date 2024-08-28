import Post from "../models/Post.js";
import { getAllCategorisInfo, getCategories, getCategoriesNotZero, getOneCategory } from "./categoriesController.js";
import { getAllCommentsByPost } from "./commentsController.js";
import { filterPostByCategory, getAllPosts, getAllPostsCard, getEditOnePost, getUserPost, getViewPost } from "./postController.js"
import { getOneUserEditProfile, getOneUserFollow, getOneUserProfile, getOneUserShortInfo, getUserLikePosts, getUserPosts, getUserSavePosts, getUserTags } from "./usersController.js";


class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

/**
 * Get Home Page
 * @param {*} req 
 * @param {*} res 
 */
const getPageHome = async (req, res) => {
    try {
        console.log("waiting Home");
        // throwError();
        const [posts, categories] = await Promise.all([getAllPostsCard(), getCategoriesNotZero()]);
        res.status(200).json({
            posts,
            categories,
        });
        console.log("success Home");
    } catch (error) {
        console.error("Error in getPageHome:", error);
        res.status(404).json({ error: 'Error', message: error.message });
    }
}


/**
 * Get Categories Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesPage = async (req, res) => {
    try {
        console.log("waiting Categories");
        // throwError();
        const categories = await getAllCategorisInfo();
        res.status(200).json({
            categories
        });
        console.log("success Categories");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Category Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoryPostPage = async (req, res) => {
    try {
        console.log("waiting CategoryPost");
        // throw new Error("Simulated error in getUserPosts");
        const [posts, category] = await Promise.all([filterPostByCategory(req.params.id), getOneCategory(req.params.id)]);
        res.status(200).json({
            posts,
            category
        });
        console.log("success CategoryPost");
    } catch (error) {
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Dashboard Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPage = async (req, res) => {
    try {
        console.log("waiting Dashboard");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }

        // throwError();
        const userInfo = await getOneUserShortInfo(req.params.id);
        res.status(200).json({
            userInfo
        });
        console.log("success Dashboard");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}


/**
 * Get Dashboard Posts User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPostsUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardPosts");
        // Simulando una excepción directamente
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const posts = await getUserPosts(req.params.id);
        res.status(200).json({posts});
        console.log("success DashboardPosts");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}
/**
 * Get Dashboard Follow User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardFollowUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardFollow");
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const userInfo = await getOneUserFollow(req.params.id);
        res.status(200).json({
            followers: userInfo.followers,
            followed: userInfo.followed
        });
        console.log("success DashboardFollow");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Dashboard Like Post User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardLikePostUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardLike");
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const userInfo = await getUserLikePosts(req.params.id);
        res.status(200).json({
            userInfo
        });
        console.log("success DashboardLike");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Dashboard Saved Post User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardSavedPostUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardSaved");
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const posts = await getUserSavePosts(req.params.id);
        res.status(200).json({
            posts
        });
        console.log("success DashboardSaved");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }

}

/**
 * Get Dashboard Tags User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardTagsUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardTags");
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const categories = await getUserTags(req.params.id);
        res.status(200).json({
            categories
        });
        console.log("success DashboardTags");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Profile Info Page
 * @param {*} req 
 * @param {*} res 
 */
const getProfileInfoPage = async (req, res) => {
    try {
        console.log("waiting ProfileInfo");
        // throwError();
        const [user, posts] = await Promise.all([getOneUserProfile(req.params.id), getUserPosts(req.params.id)]);
        res.status(200).json({
            posts,
            user
        });
        console.log("success ProfileInfo");
    } catch (error) {
        console.error("Error in getProfilePage:", error);
        res.status(404).json({ error: 'Error', message: error.message });

    }

}

/**
 * Get Categories New Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesNewPostPage = async (req, res) => {
    try {
        console.log("waiting CategoriesNewPost");
        // throwError();
        const categories = await getCategories();
        res.status(200).json({
            categories
        });
        console.log("success CategoriesNewPost");
    } catch (error) {
        console.error("Error in getCategoriesNewPostPage:", error);
        res.status(404).json({ error: 'Error', message: error.message });
    }
}

/**
 * Get Profile Edit User Page
 * @param {*} req 
 * @param {*} res 
 */
const getProfileEditUserPage = async (req, res) => {
    try {
        console.log("waiting ProfileEdit");
        // throw new Error("Simulated error in getUserPosts");
        if(req.params.id !== req.query.user){
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const user = await getOneUserEditProfile(req.params.id);   
        res.status(200).json({
            user
        });
        console.log("success ProfileEdit");
    } catch (error) {
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Edit Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getEditPostPage = async (req, res) => {
    try {
        console.log("waiting EditPost");
        // throw new Error("Simulated error in getUserPosts");
        const post1 = await Post.findById(req.params.id)
            .select('user');

        if (post1.user.toString() !== req.query.user) {
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const [post, categories] = await Promise.all([getEditOnePost(req.params.id), getAllCategorisInfo()]);
        res.status(200).json({
            post,
            categories
        });
        console.log("success EditPost");
    } catch (error) {
        res.status(500).json({ error: 'Error', msg: error.message});
    }

}

/**
 * Get View Post Page
 */
const getViewPostPage = async (req, res) => {
    try {
        console.log("waiting ViewPost");
        // throw new Error("Simulated error in getUserPosts");
        const [comments, post] = await Promise.all([
            getAllCommentsByPost(req.params.id),
            getViewPost(req.params.id)
        ]);
        res.status(200).json({
            comments,
            post,
        });
        console.log("success ViewPost");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}
export {
    /**
     * 
     */
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
    getProfileInfoPage,
    getProfileEditUserPage,
    getEditPostPage,
    getViewPostPage
}
