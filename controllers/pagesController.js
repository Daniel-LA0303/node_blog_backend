import Post from "../models/Post.js";
import categoriesServices from "../services/categoriesServices.js";
import commentsService from "../services/commentsService.js";
import postsServices from "../services/postsServices.js";
import usersServices from "../services/usersServices.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAllCategorisInfo, getCategories, getCategoriesNotZero, getOneCategory } from "./categoriesController.js";
import { getAllCommentsByPost } from "./commentsController.js";
import { filterPostByCategory, getAllPosts, getAllPostsCard, getEditOnePost, getUserPost } from "./postController.js"
import { getOneUserEditProfile, getOneUserFollow } from "./usersController.js";


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
        const info = await usersServices.topUsersCategories();
        res.status(200).json(
            new ApiResponse(200, "/api/page" + req.path, req.method, "Success get categories paginated", info, false)
        );

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

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await categoriesServices.getCategoriesPaginatedService(page, limit);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/page" + req.path, req.method, "Success get categories paginated", result, false)
        );

        console.log("success Categories");
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "/api/page" + req.path, req.method, error.message, null, true));
    }
}

/**
 * Get Category Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoryPostPage = async (req, res, next) => {
    try {

        // console.log("waiting CategoryPost");
        const fullCategoryInfo = await categoriesServices.getOneCategoryFullInfo(req.params.id, req.query.userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User info dashboard.",
                {
                    fullCategoryInfo
                },
                false
            )
        );

        // console.log("success CategoryPost");
    } catch (error) {
        console.log(error);
        next(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Dashboard Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPage = async (req, res, next) => {
    try {

        console.log("waiting Dashboard");
        const user = await usersServices.userDashboardInfoService(req.params.id);

        console.log(user);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User info dashboard.",
                user,
                false
            )
        );
        console.log("success Dashboard");
    } catch (error) {
        next(error);
    }
}


/**
 * Get Dashboard Posts User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPostsUserPage = async (req, res, next) => {
    try {
        console.log("waiting DashboardPosts");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.getPostByUserPaginatedService(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts by user paginated", result, false)
        );
        console.log("success DashboardPosts");
    } catch (error) {
        next(error);
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
        if (req.params.id !== req.query.user) {
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
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardFollowersByUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardFollow");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowersPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
        console.log("success DashboardFollow");
    } catch (error) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

const getDashboardFollowedByUserPage = async (req, res) => {
    try {
        console.log("waiting DashboardFollow");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowingPaginated(page, limit, userId);


        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
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
const getDashboardLikePostUserPage = async (req, res, next) => {
    try {
        console.log("waiting DashboardLike");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardPostLikedPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
        console.log("success DashboardLike");
    } catch (error) {
        next(error);
    }
}

/**
 * Get Dashboard Saved Post User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardSavedPostUserPage = async (req, res, next) => {
    try {
        console.log("waiting DashboardSaved");
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardPostSavedPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
        console.log("success DashboardSaved");
    } catch (error) {
        next(error);
    }

}

/**
 * Get Dashboard Tags User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardTagsUserPage = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowedTagsPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
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
        const user = await usersServices.getOneUserProfileInfoService(req.params.id);
        res.status(200).json(
            new ApiResponse(
                201,
                "/api" + req.path,
                req.method,
                "User created correctly, check your email to confirm.",
                user,
                false
            )
        );
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
const getProfileEditUserPage = async (req, res, next) => {
    try {
        console.log("waiting ProfileEdit");
        const userAuth = req.user;

        const user = await usersServices.getUserInfoToEdit(req.params.id, userAuth._id);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User info to edit",
                user,
                false
            )
        );
        console.log("success ProfileEdit");
    } catch (error) {
        next(error);
    }
}

/**
 * Get Edit Post Page
 * @param {*} req 
 * @param {*} res 
 */
// CHECK THIS
const getEditPostPage = async (req, res, next) => {
    try {
        console.log("waiting EditPost");


        const response = await postsServices.getOnePostToUpdate(req.params.id);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User info to edit",
                response,
                false
            )
        );
        console.log("success EditPost");
    } catch (error) {
        console.log(error);
        next(error);
    }

}

/**
 * Get View Post Page
 */
const getViewPostPage = async (req, res, next) => {
    try {
        console.log("waiting ViewPost");

        const postInfo = await postsServices.getViewPostInfoService(req.params.id)
        const { post, comments } = postInfo;

        res.status(200).json(new ApiResponse(
            200,
            req.originalUrl,
            req.method,
            "Post info successfully",
            {
                post,
                comments
            },
            false
        ));
        console.log("success ViewPost");
    } catch (error) {
        next(error);
    }
}

/**
 * Search controllers
 */
// controllers/searchController.js
const getGlobalSearchController = async (req, res) => {
    try {
        const { q } = req.params; // texto de búsqueda
        const page = 1; // siempre primera página
        const limit = 5;

        const [posts, categories, users] = await Promise.all([
            postsServices.getPostsByTitlePaginatedService(page, limit, q),
            categoriesServices.getCategoriesByNamePaginatedService(page, limit, q),
            usersServices.getUsersByNameOrEmailPaginatedService(page, limit, q),
        ]);

        res.json({
            posts: {
                data: posts.data,
                meta: posts.meta
            },
            categories: {
                data: categories.data,
                meta: categories.meta
            },
            users: {
                data: users.data,
                meta: users.meta
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error in global search" });
    }
};

const getPostsSearchController = async (req, res) => {
    try {
        const { q } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const posts = await postsServices.getPostsByTitlePaginatedService(Number(page), Number(limit), q);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ msg: "Error searching posts" });
    }
};

const getCategoriesSearchController = async (req, res) => {
    try {
        const { q } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const categories = await categoriesServices.getCategoriesByNamePaginatedService(Number(page), Number(limit), q);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ msg: "Error searching categories" });
    }
};

const getUsersSearchController = async (req, res) => {
    try {
        const { q } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const users = await usersServices.getUsersByNameOrEmailPaginatedService(Number(page), Number(limit), q);
        res.json(users);
    } catch (error) {
        res.status(500).json({ msg: "Error searching users" });
    }
};



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
    getDashboardFollowersByUserPage,
    getDashboardLikePostUserPage,
    getDashboardSavedPostUserPage,
    getDashboardTagsUserPage,
    getDashboardFollowedByUserPage,
    /**
     * 
     */
    getProfileInfoPage,
    getProfileEditUserPage,
    getEditPostPage,
    getViewPostPage,

    /**
     * search controllers
     */
    getGlobalSearchController,
    getPostsSearchController,
    getCategoriesSearchController,
    getUsersSearchController,

}
