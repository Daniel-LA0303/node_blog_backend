import User from '../models/User.js'
import generateID from '../helpers/generateID.js'
import generateJWT from '../helpers/generateJWT.js'
import { emailRegister, emailNewPassword } from '../helpers/email.js'
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs-extra"
import Categories from '../models/Categories.js';
import usersServices from '../services/usersServices.js';
import { ApiResponse } from '../utils/ApiResponse.js';


// --- Auth Users start --//
const registerUser = async (req, res, next) => {

    try {
        // throw new Error("Simulated error in getUserPosts");
        const { email } = req.body;

        await usersServices.registerNewUser(email, req.body);

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

const authUser = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        const userInfo = await usersServices.login(email, password);

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

const confirm = async (req, res, next) => {

    try {

        const { token } = req.params;

        // call service to confirm
        await usersServices.userConfirmed(token);
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

const forgetPassword = async (req, res) => {
    try {
        // throw new Error("Simulated error in getUserPosts");
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
        })
        res.json({ msg: "We have sent an email with instructions" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

const checkToken = async (req, res) => {
    try {
        const { token } = req.params;

        const tokenValid = await User.findOne({ token });

        if (tokenValid) {
            res.json({ msg: "Token valido y el usuario existe" })
        } else {
            const error = new Error('Token no valido');
            return res.status(400).json({ msg: error.message });
        }
    } catch (error) {
        console.log(error);
    }
}

const newPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ token });

        if (user) {
            user.password = password //se asigna el nuevo password
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

const profile = async (req, res) => {
    const { user } = req;
    res.json(user);
}

// -- Auth Users end --//

// -- Users CRUD actions start --//
const newInfoUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log(req.body);
        
        // 1. call service
        await usersServices.updateProfileService(
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
                "User updated",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const getOneUser = async (req, res, next) => {
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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
}

// -- Users CRUD actions end --//

// -- Actions beetween Users start --/

const followTag = async (req, res, next) => {
    try {
        const { categoryId } = req.query; // ID de la categoría
        const userId = req.params.id; // ID del usuario

        await usersServices.userFollowATag(categoryId, userId);

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

const unFollowTag = async (req, res, next) => {
    try {
        const { categoryId } = req.query; // ID de la categoría
        const userId = req.params.id; // ID del usuario

        await usersServices.userUnfollowATag(categoryId, userId);

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
const followUser = async (req, res, next) => {
  try {
    const {userFollow} = req.query;  // ID of the user to follow
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
const unfollowUser = async (req, res, next) => {
  try {
    const {userUnfollow} = req.query;  // ID of the user to unfollow
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

/**
 * Get user info for dashboard
 */
const getOneUserShortInfo = async (id) => {
    try {
        const userData = await User.findById(id)
            .select('posts followersUsers likePost postsSaved followsTags followedUsers')
            .populate('posts')
            .populate('followersUsers.followers')
            .populate('likePost.posts')
            .populate('postsSaved.posts')
            .populate('followsTags.tags')
            .populate('followedUsers.followed');

        const responseData = {
            postsCount: userData.posts.length,
            followersCount: userData.followersUsers.followers.length,
            likePostsCount: userData.likePost.posts.length,
            savedPostsCount: userData.postsSaved.posts.length,
            tagsCount: userData.followsTags.tags.length,
            followedUsersCount: userData.followedUsers.followed.length,
        };
        return responseData;

    } catch (error) {

    }
}

/**
 * Get user posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserPosts = async (id) => {
    try {
        const user = await User.findById(id)
            .populate({
                path: "posts",
                select: "title linkImage categories _id user likePost commentsOnPost date comments",
                populate: [
                    {
                        path: "user",
                        select: "name _id profilePicture"
                    },
                    {
                        path: "categories",
                        select: "_id name value label color"
                    }
                ]
            });
        return user.posts;
    } catch (error) {
        console.error("Error in getUserPosts:", error);
        throw new Error('Error to find users posts');
    }
}

/**
 * Get user followers and followed for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserFollow = async (id) => {
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
            followers: user.followersUsers.followers,
            followed: user.followedUsers.followed
        };
        return response;
    } catch (error) {

    }
}

/**
 * Get user like posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserLikePosts = async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "likePost",
            populate: {
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select: 'title linkImage categoriesPost _id user likePost commenstOnPost date comments'
            }
        })
        return user.likePost.posts;
    } catch (error) {

    }
}

/**
 * Get user save posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserSavePosts = async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "postsSaved",
            populate: {
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select: 'title linkImage categoriesPost _id user likePost postsSaved commenstOnPost date comments'
            },
        })
        return user.postsSaved.posts;
    } catch (error) {

    }
}

/**
 * Get user tags for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserTags = async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "followsTags",
            populate: {
                path: "tags",
            }
        })
        return user.followsTags.tags;
    } catch (error) {

    }
}

/**
 * Get user info for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserProfile = async (id) => {
    try {
        const user = await User.findById(id).populate({
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

        if (!user) { //-> no entra a esta excepcion, se va directamente a el catch
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error("Error in getOneUserProfile:", error);
        throw new Error('Error to find user');
    }
}

/**
 * Get user info for dashboard
 * @param {*} id 
 * @returns 
 */

// DELETE
const getOneUserEditProfile = async (id) => {
    try {
        const user = await User.findById(id)
            .select('info profilePicture');
        return user;
    }
    catch (error) {

    }
}


//-- Dashboard end --//

export {
    //-- auth user start --//
    registerUser,
    authUser,
    confirm,
    forgetPassword,
    checkToken,
    newPassword,
    profile,
    //-- auth user end --//
    //-- crud user start --//
    newInfoUser,
    getOneUser,
    getAllUsers,
    //-- crud user end --//
    //dashboard
    getOneUserFollow,
    getUserTags,
    getUserPosts,
    getUserLikePosts,
    getUserSavePosts,
    //dashboard
    //-- actions user start --//
    followUser,
    unfollowUser,
    followTag,
    unFollowTag,
    getOneUserShortInfo,
    getOneUserProfile,
    getOneUserEditProfile
    //-- actions user end --//
}