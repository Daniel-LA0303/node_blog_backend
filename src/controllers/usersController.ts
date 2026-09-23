import User from '../models/User.js'
import generateID from '../helpers/generateID'
import { emailNewPassword } from '../helpers/email'
import usersServices from '../services/usersServices';
import { ApiResponse } from '../utils/ApiResponse';
import { IInfoUser } from '../interfaces/tokens.interfaces.js';
import bcrypt from "bcryptjs";


// --- Auth Users start --//
const registerUserController = async (req: any, res: any, next: any) => {

    try {
        const { email } = req.body;

        await usersServices.registerNewUserService(email, req.body);

        res.status(201).json(
            new ApiResponse(
                201,
                "/api" + req.path,
                req.method,
                "User created correctly, check your email to confirm.",
                "User created",
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

const refreshTokenController = async (req: any, res: any, next: any) => {
    try {
        // req.user y req.tokenDoc ya vienen validados por el middleware checkRefreshToken
        const user = req.user;
        const oldTokenDoc = req.tokenDoc;

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'];
        const origin = req.headers['origin'] || req.headers['referer'];
        const host = req.headers['host'];

        const info: IInfoUser = {
            ip,
            userAgent,
            origin,
            host
        }

        const response = await usersServices.refreshTokenService(oldTokenDoc, user, info);

        return res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Tokens refreshed successfully",
                response,
                false
            )
        );
    } catch (error) {
        next(error);
    }
};

export default refreshTokenController;

// login
const loginController = async (req: any, res: any, next: any) => {
    try {

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'];
        //const origin = req.headers['origin'] || req.headers['referer'];
        const host = req.headers['host'];

        const info: IInfoUser = {
            ip,
            userAgent,
            //origin,
            host
        }

        const { email, password } = req.body;

        const userInfo = await usersServices.loginService(email, password, info);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User login successfully",
                userInfo,
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

// confim user 
const confirmController = async (req: any, res: any, next: any) => {

    try {

        const { token } = req.params;

        // call service to confirm
        await usersServices.userConfirmedService(token);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User confirmed successfully",
                "User confirmed",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

// change pass SHOULD BE A SERVICE
const forgetPasswordController = async (req: any, res: any) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error('This user does not exist');
            return res.status(400).json({ msg: error.message });
        }
        user.token = generateID();
        await user.save();
        emailNewPassword({
            email: user.email,
            name: user.name,
            token: user.token
        });

        res.json({ msg: "We have sent an email with instructions" });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

// check token 
const checkTokenController = async (req: any, res: any) => {
    try {
        const { token } = req.params;

        const tokenValid = await User.findOne({ token });

        if (tokenValid) {
            res.json({ msg: "Valid token and user exists" })
        } else {
            const error = new Error('Token no valido');
            return res.status(400).json({ msg: error.message });
        }
    } catch (error) {
        console.log(error);
    }
}

// when check a token we send it to this
const newPasswordController = async (req: any, res: any) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ token });

        if (user) {
            user.password = user.password = await bcrypt.hash(password, 10); //se asigna el nuevo password
            user.token = '' //se reinicia el token
            try {
                await user.save();                
                res.json({ msg: "Password Modified Correctly" })
            } catch (error) {
                console.log(error);
            }
        } else {
            const error = new Error('Invalid token');
            return res.status(400).json({ msg: error.message });
        }
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}
// -- Auth Users end --//

// -- Users CRUD actions start --//
const updateUserController = async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;

        // 1. call service
        const response = await usersServices.updateProfileService(
            id,
            req.body.previousName,
            req.files,
            req.body.profilePicture,
            req.body
        );
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User updated successfully",
                response,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const getOneUserController = async (req: any, res: any, next: any) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "postsSaved",
            populate: {
                path: "posts",
                populate: {
                    path: "user"
                }
            }
        }).populate({
            path: "followsTags",
            populate: {
                path: "tags",

            }
        }).populate({
            path: "likePost",
            populate: {
                path: "posts",

            }
        })
        res.json(user);
    } catch (error) {
        console.log(error);
        res.json({ msg: 'This post does not exist' });
        next();
    }
}

// -- Users CRUD actions end --//

// -- Actions beetween Users start --/

const followTagController = async (req: any, res: any, next: any) => {
    try {
        const { categoryId } = req.query; // category id
        const userId = req.params.id; // user id

        await usersServices.userFollowATagService(categoryId, userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Follow tag updated successfully",
                "Follow success",
                false
            )
        );

    } catch (error) {
        next(error);
    }
};

const unFollowTagController = async (req: any, res: any, next: any) => {
    try {
        const { categoryId } = req.query; // category id
        const userId = req.params.id; // user id

        await usersServices.userUnfollowATagService(categoryId, userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Unfollow tag updated successfully",
                "Unfollow success",
                false
            )
        );

    } catch (error) {
        next(error);
    }
};

// follow user
const followUserController = async (req: any, res: any, next: any) => {
    try {
        const { userFollow } = req.query;  // ID of the user to follow
        const userProfileId = req.params.id;    // ID of the current logged user

        await usersServices.followUserService(userFollow, userProfileId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User followed successfully",
                "Follow success",
                false
            )
        );
    } catch (error) {
        next(error);
    }
};

// Unfollow User
const unfollowUserController = async (req: any, res: any, next: any) => {
    try {
        const { userUnfollow } = req.query;  // ID of the user to unfollow
        const userProfileId = req.params.id;    // ID of the current logged user

        await usersServices.unfollowUserService(userUnfollow, userProfileId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User unfollowed successfully",
                "Unfollow success",
                false
            )
        );
    } catch (error) {
        next(error);
    }
};

// -- Actions beetween Users end --/

const getPostsByUserPaginatedController = async (req: any, res: any, next: any) => {

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
        console.log(error);
        next(error);
    }

}

/**
 * Get user followers and followed for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserFollowController = async (id: any) => {
    try {
        const user = await User.findById(id).populate({
            path: "followersUsers",
            populate: {
                path: "followers",
                select: 'name email profilePicture followersUsers followedUsers'
            },
            select: 'followers followed'
        })
            .populate({
                path: "followedUsers",
                populate: {
                    path: "followed",
                    select: 'name email profilePicture followedUsers followersUsers'
                },
                select: 'followers followed'
            })
        const response = {
            followers: user?.followersUsers.followers,
            followed: user?.followedUsers.followed
        };
        return response;
    } catch (error) {

    }
}

const searchUsersController = async (req: any, res: any) => {
    try {
        const { q, currentUserId } = req.query; // query

        if (!currentUserId) return res.status(400).json({ error: "currentUserId required" });

        const regex = new RegExp(q, "i"); // search

        // search with email and name like params
        const users = await User.find({
            _id: { $ne: currentUserId },
            status: 'ACTIVE',
            $or: [{ name: regex }, { email: regex }],
        }).select("name email profilePicture");

        res.status(200).json(users);
    } catch (error) {
        console.log("Error in searchUsers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
//-- Dashboard end --//

const getBlogsRecommendedController = async (req: any, res: any, next: any) => {
    try {
        const users = await usersServices.getBlogsRecommendedService(req.user._id);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Get blogs recommedned successfully",
                users,
                false
            )
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getTagsRecommendedController = async (req: any, res: any, next: any) => {
    try {
        const users = await usersServices.getTagsRecommendedService(req.user._id);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Get tags recommedned successfully",
                users,
                false
            )
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getUsersRecommendedController = async (req: any, res: any, next: any) => {
    try {
        const users = await usersServices.getUsersRecommendedService(req.user._id);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Get tags recommedned successfully",
                users,
                false
            )
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const testRoleController = async (req: any, res: any, next: any) => {

    try {
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "test role",
                "test role",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}


const createModerController = async (req: any, res: any, next: any) => {

    try {

        const userId = req.body.userId;
        const userR = req.user;
        await usersServices.createModerService(userId, userR, req);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "New mod created successfully.",
                "New mod created successfully.",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const removeModerController = async (req: any, res: any, next: any) => {

    try {

        const userId = req.body.userId;
        const userR = req.user;
        await usersServices.removeModerService(userId, userR, req);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Remove mod successfully.",
                "Remove mod successfully.",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const searchUsersToAdminPanelController = async (req: any, res: any, next: any) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const q = req.query.search;
        const r = await usersServices.searchUsersToAdminPanelService(q, limit, page);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Search users.",
                r,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const verifyUserController = async (req: any, res: any, next: any) => {

    try {

        const userId = req.body.userId;
        const userR = req.user;
        await usersServices.verifyUserService(userId, userR, req);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Verify user successfully.",
                "Verify user successfully.",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const banUserController = async (req: any, res: any, next: any) => {

    try {

        const userId = req.body.userId;
        const user = req.user;
        await usersServices.banUserService(userId, user, req);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Ban user successfully.",
                "Ban user successfully.",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const unbanUserController = async (req: any, res: any, next: any) => {

    try {

        const userId = req.body.userId
        const userR = req.user;
        await usersServices.unbanUserService(userId, userR, req);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Unban user successfully.",
                "Unban user successfully.",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const searchUsers2Controller = async (req: any, res: any, next: any) => {

    try {
        const { query } = req.query;

        // ajusta esto al campo real que tu middleware de auth mete en req
        // (por ejemplo req.user.userId o req.userId)
        const currentUserId = req.user?.userId;

        const users = await usersServices.searchUsersService(query as string, currentUserId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Users found",
                users,
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

export {
    //-- auth user start --//
    registerUserController,
    loginController,
    confirmController,
    forgetPasswordController,
    checkTokenController,
    newPasswordController,
    //-- auth user end --//
    //-- crud user start --//
    updateUserController,
    getOneUserController,
    //-- crud user end --//
    //dashboard
    getOneUserFollowController,
    //dashboard
    //-- actions user start --//
    followUserController,
    unfollowUserController,
    followTagController,
    unFollowTagController,
    // getOneUserShortInfo,
    //-- actions user end --//
    getPostsByUserPaginatedController,
    searchUsersController,
    getBlogsRecommendedController,
    getTagsRecommendedController,
    getUsersRecommendedController,
    refreshTokenController,
    testRoleController,
    createModerController,
    removeModerController,
    searchUsersToAdminPanelController,
    verifyUserController,
    banUserController,
    unbanUserController,
    searchUsers2Controller
}