import Post from "../models/Post.js";
import User from "../models/User.js";
import categoriesServices from "../services/categoriesServices";
import postsServices from "../services/postsServices";
import usersServices from "../services/usersServices";
import { ApiResponse } from "../utils/ApiResponse";
import { getCategories } from "./categoriesController";
import { getOneUserFollow } from "./usersController.js";


/**
 * Get Home Page
 * @param {*} req 
 * @param {*} res 
 */
const getPageHome = async (req: any, res: any) => {
    try {
        const info = await usersServices.topUsersCategories();
        res.status(200).json(
            new ApiResponse(200, "/api/page" + req.path, req.method, "Success get home info page", info, false)
        );

    } catch (error) {
        console.log(error);
    }
}


/**
 * Get Categories Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesPage = async (req: any, res: any, next: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await categoriesServices.getCategoriesPaginatedService(page, limit);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/page" + req.path, req.method, "Success get categories paginated", result, false)
        );

    } catch (error: any) {
        console.log(error);
        next(error);
        res.status(500).json(new ApiResponse(500, "/api/page" + req.path, req.method, error.message, null, true));
    }
}

/**
 * Get Category Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoryPostPage = async (req: any, res: any, next: any) => {
    try {

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

    } catch (error: any) {
        console.log(error);
        next(error);
        res.status(500).json(new ApiResponse(500, "/api/page" + req.path, req.method, error.message, null, true));
    }
}

/**
 * Get Dashboard Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPage = async (req: any, res: any, next: any) => {
    try {

        const user = await usersServices.userDashboardInfoService(req.params.id);

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
    } catch (error) {
        next(error);
    }
}


/**
 * Get Dashboard Posts User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardPostsUserPage = async (req: any, res: any, next: any) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.getPostByUserPaginatedService(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts by user paginated", result, false)
        );

    } catch (error) {
        next(error);
    }
}
/**
 * Get Dashboard Follow User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardFollowUserPage = async (req: any, res: any) => {
    try {
        if (req.params.id !== req.query.user) {
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
        const userInfo = await getOneUserFollow(req.params.id);
        res.status(200).json({
            followers: userInfo?.followers,
            followed: userInfo?.followed
        });
    } catch (error: any) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardFollowersByUserPage = async (req: any, res: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowersPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );

    } catch (error: any) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

const getDashboardFollowedByUserPage = async (req: any, res: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowingPaginated(page, limit, userId);

        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );

    } catch (error: any) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Dashboard Like Post User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardLikePostUserPage = async (req: any, res: any, next: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardPostLikedPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );

    } catch (error) {
        next(error);
    }
}

/**
 * Get Dashboard Saved Post User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardSavedPostUserPage = async (req: any, res: any, next: any) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardPostSavedPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
    } catch (error) {
        next(error);
    }

}

/**
 * Get Dashboard Tags User Page
 * @param {*} req 
 * @param {*} res 
 */
const getDashboardTagsUserPage = async (req: any, res: any) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id;
        const result = await usersServices.userDashboardFollowedTagsPaginated(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts liked by user paginated", result, false)
        );
    } catch (error: any) {
        res.status(404).json({ error: 'Error', msg: error.message });
    }
}

/**
 * Get Profile Info Page
 * @param {*} req 
 * @param {*} res 
 */
const getProfileInfoPage = async (req: any, res: any) => {
    try {
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
    } catch (error: any) {
        console.error("Error in getProfilePage:", error);
        res.status(404).json({ error: 'Error', message: error.message });

    }

}

/**
 * Get Categories New Post Page
 * @param {*} req 
 * @param {*} res 
 */
const getCategoriesNewPostPage = async (req: any, res: any) => {
    try {
        // throwError();
        const categories = await getCategories();
        res.status(200).json({
            categories
        });
    } catch (error: any) {
        console.error("Error in getCategoriesNewPostPage:", error);
        res.status(404).json({ error: 'Error', message: error.message });
    }
}

/**
 * Get Profile Edit User Page
 * @param {*} req 
 * @param {*} res 
 */
const getProfileEditUserPage = async (req: any, res: any, next: any) => {
    try {
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
const getEditPostPage = async (req: any, res: any, next: any) => {
    try {
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

    } catch (error) {
        console.log(error);
        next(error);
    }

}

/**
 * Get View Post Page
 */
const getViewPostPage = async (req: any, res: any, next: any) => {
    try {

        const postInfo = await postsServices.getViewPostInfoService(req.params.id)
        const { post, comments, totalComments } = postInfo;

        const blogsUserSuggestion = await postsServices.getBlogsSuggestionsFromAUser(req.params.id);

        res.status(200).json(new ApiResponse(
            200,
            req.originalUrl,
            req.method,
            "Post info successfully",
            {
                post,
                comments,
                totalComments,
                blogsUserSuggestion
            },
            false
        ));
    } catch (error: any) {
        next(error);
    }
}


// save history search
const saveHistory = async (userId: string, q: string) => {

    await User.findByIdAndUpdate(userId, {
        $push: {
            historySearch: {
                $each: [q],
                $slice: -20
            }
        }
    });
}

/**
 * Search controllers
 */
// controllers/searchController.js
const getGlobalSearchController = async (req: any, res: any) => {
    try {
        const { q } = req.params; // texto de búsqueda
        const page = 1; // siempre primera página
        const limit = 5;

        // get user if search is in auth 
        const userId = req.user?._id; 

        if(userId){
            // we call service to save search 
            console.log("user is auth");
            await saveHistory(userId, q);
        }else{
            console.log("user is not auth");
            
        }


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

const getPostsSearchController = async (req: any, res: any) => {
    try {
        const { q } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const posts = await postsServices.getPostsByTitlePaginatedService(Number(page), Number(limit), q);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ msg: "Error searching posts" });
    }
};

const getCategoriesSearchController = async (req: any, res: any) => {
    try {
        const { q } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const categories = await categoriesServices.getCategoriesByNamePaginatedService(Number(page), Number(limit), q);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ msg: "Error searching categories" });
    }
};

const getUsersSearchController = async (req: any, res: any) => {
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
