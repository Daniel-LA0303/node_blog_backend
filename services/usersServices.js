import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../config/cloudinary.js";
import Categories from "../models/Categories.js";
import User from "../models/User.js";
import Post from "../models/Post.js"
import { ServiceException } from "../utils/exception/ServiceException.js";
import fs from "fs-extra"
import generateJWT from "../helpers/generateJWT.js";
import generateID from "../helpers/generateID.js";
import { emailRegister } from "../helpers/email.js";


const updateProfileService = async (userId, previousName, files, profilePicture, body) => {

    // userId = id -- previousName = req.body.previousName
    // files = req.files -- profilePicture = req.body.profilePicture

    // 1. checks if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. when user inserts a new image, we need to delete 
    if (previousName) {
        console.log("******DELETE IMAGE*****");

        if (previousName !== "") {
            await deleteImage(previousName);
        }
    }

    // 3. add new image
    if (files?.image) {
        console.log("******NEW IMAGE*****");
        const result = await uploadImage(files.image.tempFilePath);
        user.profilePicture = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(files.image.tempFilePath);
    }

    // 4. user doesn't decide to change image
    if (profilePicture) {
        console.log("******IMAGE NOT CHANGE*****");
        const profilePicture2 = JSON.parse(profilePicture)
        user.profilePicture = profilePicture2
    }

    console.log("********");
    console.log(body.social);
    
    
    // 5. assamble info and save
    user.info = {
        desc: body.desc,
        work: body.work,
        education: body.education,
        skills: Array.isArray(body.skills)
            ? body.skills
            : JSON.parse(body.skills || '[]'),
        social: body.social ? JSON.parse(body.social) : {}
    };
    await user.save();
}

// user unfollow a ta or category
const userUnfollowATag = async (categoryId, userId) => {

    // 1. check if user exists
    const user = await User.findById(userId);
    if (!user) throw new ServiceException("User not found", 404);

    // 2. check if category exists
    const category = await Categories.findById(categoryId);
    if (!category) throw new ServiceException("Category not found", 404);

    // 3. validations: check if relation exists
    const userFollowsCategory = category.follows.users.includes(userId);
    const categoryInUser = user.followsTags.tags.includes(categoryId);

    if (!userFollowsCategory || !categoryInUser) {
        throw new ServiceException("User does not follow this category", 400);
    }


    // 4. we quit user from categories
    await Categories.findByIdAndUpdate(
        categoryId,
        {
            $pull: { 'follows.users': userId },
            $inc: { 'follows.countFollows': -1 },
        },
        { new: true }
    );

    // 5. we quit cateroy form user
    await User.findByIdAndUpdate(
        userId,
        {
            $pull: { 'followsTags.tags': categoryId },
            $inc: { 'followsTags.countTags': -1 },
        },
        { new: true }
    );

}

// user follow a tag or category
const userFollowATag = async (categoryId, userId) => {

    // 1. check if user exists
    const user = await User.findById(userId);
    if (!user) throw new ServiceException("User not found", 404);

    // 2. check if category exists
    const category = await Categories.findById(categoryId);
    if (!category) throw new ServiceException("Category not found", 404);

    // 3. validations: check if relation already exists
    const alreadyInCategory = category.follows.users.includes(userId);
    if (alreadyInCategory) {
        throw new ServiceException("User already unfollows this category", 400);
    }

    const alreadyInUser = user.followsTags.tags.includes(categoryId);
    if (alreadyInUser) {
        throw new ServiceException("Category already unfollowed by user", 400);
    }

    // 4. first we add user in categories
    await Categories.findByIdAndUpdate(
        categoryId,
        {
            $addToSet: { 'follows.users': userId },
            $inc: { 'follows.countFollows': 1 },
        },
        { new: true }
    );

    // 5. add category in user
    await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: { 'followsTags.tags': categoryId },
            $inc: { 'followsTags.countTags': 1 },
        },
        { new: true }
    );

}

// Follow a user
const followUserService = async (userFollowedId, userProfileId) => {
    // 1. check if userProfile exists
    const userProfile = await User.findById(userProfileId);
    if (!userProfile) throw new ServiceException("User (follower) not found", 404);

    // 2. check if userFollowed exists
    const userFollowed = await User.findById(userFollowedId);
    if (!userFollowed) throw new ServiceException("User (to be followed) not found", 404);

    // 3. validations: check if relation already exists
    const alreadyFollower = userFollowed.followersUsers.followers.includes(userProfileId);
    if (alreadyFollower) {
        throw new ServiceException("User already follows this profile", 400);
    }

    const alreadyFollowing = userProfile.followedUsers.followed.includes(userFollowedId);
    if (alreadyFollowing) {
        throw new ServiceException("User already added this profile as followed", 400);
    }

    // 4. add follower in userFollowed
    await User.findByIdAndUpdate(
        userFollowedId,
        {
            $addToSet: { "followersUsers.followers": userProfileId },
            $inc: { "followersUsers.conutFollowers": 1 },
        },
        { new: true }
    );

    // 5. add followed in userProfile
    await User.findByIdAndUpdate(
        userProfileId,
        {
            $addToSet: { "followedUsers.followed": userFollowedId },
            $inc: { "followedUsers.conutFollowed": 1 },
        },
        { new: true }
    );
};

// Unfollow a user
const unfollowUserService = async (userFollowedId, userProfileId) => {
    // 1. check if userProfile exists
    const userProfile = await User.findById(userProfileId);
    if (!userProfile) throw new ServiceException("User (follower) not found", 404);

    // 2. check if userFollowed exists
    const userFollowed = await User.findById(userFollowedId);
    if (!userFollowed) throw new ServiceException("User (to be unfollowed) not found", 404);

    // 3. validations: check if relation does NOT exist
    const isFollower = userFollowed.followersUsers.followers.includes(userProfileId);
    if (!isFollower) {
        throw new ServiceException("User does not follow this profile", 400);
    }

    const isFollowing = userProfile.followedUsers.followed.includes(userFollowedId);
    if (!isFollowing) {
        throw new ServiceException("User does not have this profile as followed", 400);
    }

    // 4. remove follower from userFollowed
    await User.findByIdAndUpdate(
        userFollowedId,
        {
            $pull: { "followersUsers.followers": userProfileId },
            $inc: { "followersUsers.conutFollowers": -1 },
        },
        { new: true }
    );

    // 5. remove followed from userProfile
    await User.findByIdAndUpdate(
        userProfileId,
        {
            $pull: { "followedUsers.followed": userFollowedId },
            $inc: { "followedUsers.conutFollowed": -1 },
        },
        { new: true }
    );
};




const getUserInfoToEdit = async (userId, userAuthId) => {

    // 1. search user
    const user = await User.findById(userId).select('info profilePicture');

    if (!user) throw new ServiceException("User not found", 404);

    // 3. check if userId and user auth id are the same
    if (userId.toString() !== userAuthId.toString()) {
        throw new ServiceException("You don't have permissions to edit this user", 403);
    }

    return user;

}

const login = async (email, password) => {

    // 1. check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. check if user is confirmed
    if (!user.confirm) {
        throw new ServiceException("This account has not been confirmed", 400);
    }

    // 3. check password
    if (!await user.checkPassword(password)) {

        throw new ServiceException("Your password is incorrect", 400);

    }

    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profilePicture.secure_url,
        likePost: user.likePost,
        postsSaved: user.postsSaved,
        followsTags: user.followsTags,
        followersUsers: user.followersUsers,
        followedUsers: user.followedUsers,
        token: generateJWT(user._id)
    }

}

const registerNewUser = async (email, body) => {

    // 1. check if email exists
    const existUser = await User.findOne({ email: email });
    if (existUser) {
        throw new ServiceException("This email already exists", 400);
    }

    // 2. assamble use rinfo
    const user = new User(body);

    // 3. generate token to confirm
    user.token = generateID();

    // 4. save new user
    await user.save();

    // 5. send email
    emailRegister({
        email: user.email,
        name: user.name,
        token: user.token
    });

}

const userConfirmed = async (token) => {

    // 1. search user by token
    const userConfirm = await User.findOne({ token: token });

    // 2. if there isn't user, then there is a error
    if (!userConfirm) {
        throw new ServiceException("Invalid token", 403);
    }

    userConfirm.confirm = true;
    userConfirm.token = '';
    await userConfirm.save();
}

const getPostByUserPaginatedService = async (page = 1, limit = 5, userId) => {

    // 1. calculate skip
    const skip = (page - 1) * limit;

    // 2. get posts with info    
    const posts = await Post.find({ user: mongoose.Types.ObjectId(userId) })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'user',
            select: 'name _id profilePicture'
        })
        .populate({
            path: 'categories',
            select: '_id name value label color'
        })
        .select('title createdAt numberComments usersSavedPost linkImage date commenstOnPost likePost')
        .sort({ createdAt: -1 });

    
    // 3. calculate total
    const total = await Post.countDocuments({ userId });

    // 4. return info
    return {
        data: posts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

}


const getOneUserProfileInfoService = async (userId) => {

    const user = await User.findById(userId).populate({
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
    }).select('profilePicture email createdAt info name _id followersUsers numberPost');

    if (!user) {
        throw new ServiceException("User not found", 404);
    }
    return user;

}

export default {
    updateProfileService,
    userFollowATag,
    userUnfollowATag,
    getUserInfoToEdit,
    login,
    registerNewUser,
    userConfirmed,
    followUserService,
    unfollowUserService,
    getPostByUserPaginatedService,
    getOneUserProfileInfoService
}