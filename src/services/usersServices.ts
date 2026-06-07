import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../config/cloudinary";
import Categories from "../models/Categories";
import User from "../models/User";
import Post from "../models/Post"
import { ServiceException } from "../utils/exception/ServiceException";
import fs from "fs-extra"
import generateJWT from "../helpers/generateJWT";
import generateID from "../helpers/generateID";
import { EntityType, NotificationType } from "../enums/notifications.enums";
import notificationsServices from "./notificationsServices";
import { NewNotificationI } from "../interfaces/notification.interfaces";



const updateProfileService = async (userId: any, previousName: any, files: any, profilePicture: any, body: any) => {

    // userId = id -- previousName = req.body.previousName
    // files = req.files -- profilePicture = req.body.profilePicture

    // 1. checks if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. when user inserts a new image, we need to delete 
    if (previousName) {
        if (previousName !== "") {
            await deleteImage(previousName);
        }
    }

    // 3. add new image
    if (files?.image) {
        const result = await uploadImage(files.image.tempFilePath);
        user.profilePicture = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(files.image.tempFilePath);
    }

    // 4. user doesn't decide to change image
    if (profilePicture) {
        const profilePicture2 = JSON.parse(profilePicture)
        user.profilePicture = profilePicture2
    }

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
    return {
        profilePicture: user.profilePicture,
        info: user.info,
        username: user.name,
        email: user.email,
        _id: user._id
    };
}

// user unfollow a ta or category
const userUnfollowATag = async (categoryId: any, userId: any) => {

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
const userFollowATag = async (categoryId: any, userId: any) => {

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
const followUserService = async (userFollowedId: any, userProfileId: any) => {

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

    const notificationData: NewNotificationI = {
        recipientId: userFollowedId,
        senderId: userProfileId,
        entityId: userProfileId,
        message: userProfile.name + " followed you!",
        entityType: EntityType.USER,
        type: NotificationType.FOLLOW_USER,
        isCheck: true
    };

    await notificationsServices.sendNotification(notificationData);
};

// Unfollow a user
const unfollowUserService = async (userFollowedId: any, userProfileId: any) => {
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




const getUserInfoToEdit = async (userId: any, userAuthId: any) => {

    // 1. search user
    const user = await User.findById(userId).select('info profilePicture');

    if (!user) throw new ServiceException("User not found", 404);

    // 3. check if userId and user auth id are the same
    if (userId.toString() !== userAuthId.toString()) {
        throw new ServiceException("You don't have permissions to edit this user", 403);
    }

    return user;

}

const login = async (email: any, password: any) => {

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
        token: generateJWT(user._id)
    }

}

const registerNewUser = async (email: any, body: any) => {

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
    /*emailRegister({
        email: user.email,
        name: user.name,
        token: user.token
    });*/

}

const userConfirmed = async (token: any) => {

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

const getPostByUserPaginatedService = async (page = 1, limit = 5, userId: any) => {

    // 1. calculate skip
    const skip = (page - 1) * limit;

    // 2. get posts with info    
    const posts = await Post.find({ user: new mongoose.Types.ObjectId(userId) })
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
        .select('title createdAt numberComments usersSavedPost linkImage date comments likePost')
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

const getOneUserProfileInfoService = async (userId: any) => {

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
    }).select('profilePicture email createdAt info name _id followersUsers numberPost posts');

    if (!user) {
        throw new ServiceException("User not found", 404);
    }
    return user;

}

// user dashboard info
const userDashboardInfoService = async (userId: any) => {

    const userData = await User.findById(userId)
        .select('posts followersUsers likePost postsSaved followsTags followedUsers')
        .populate('posts')
        .populate('followersUsers.followers')
        .populate('likePost.posts')
        .populate('postsSaved.posts')
        .populate('followsTags.tags')
        .populate('followedUsers.followed');

    if (!userData) {
        throw new ServiceException("User not found", 404);
    }

    const responseData = {
        postsCount: userData.posts.length,
        followersCount: userData.followersUsers.followers.length,
        likePostsCount: userData.likePost.posts.length,
        savedPostsCount: userData.postsSaved.posts.length,
        tagsCount: userData.followsTags.tags.length,
        followedUsersCount: userData.followedUsers.followed.length,
    };
    return responseData;
}

const userDashboardPostSavedPaginated = async (page = 1, limit = 5, userId: any) => {

    // 1. get skip
    const skip = (page - 1) * limit;

    // 2. get total
    const userTotal = await User.findById(userId).select("postsSaved.posts");
    const total = userTotal?.postsSaved?.posts?.length || 0;

    // 3. get post
    const user = await User.findById(userId)
        .select("postsSaved.posts")
        .populate({
            path: "postsSaved.posts",
            options: {
                skip,
                limit,
                // sort: { createdAt: -1 }
            },
            populate: [
                { path: "user", select: "name _id profilePicture" },
                { path: "categories", select: "_id name value label color" }
            ],
            select: "title createdAt numberComments usersSavedPost linkImage date comments likePost"
        });

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 4. sort post
    const postsInverted = user.postsSaved.posts.reverse();

    return {
        data: postsInverted,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};



const userDashboardPostLikedPaginated = async (page = 1, limit = 5, userId: any) => {

    // 1. get skip
    const skip = (page - 1) * limit;

    // 2. get total
    const userTotal = await User.findById(userId).select("likePost.posts");
    const total = userTotal?.likePost?.posts?.length || 0;

    // 3. get psots
    const user = await User.findById(userId)
        .select("likePost.posts")
        .populate({
            path: "likePost.posts",
            options: {
                skip,
                limit,
                // sort: { createdAt: -1 }
            },
            populate: [
                { path: "user", select: "name _id profilePicture" },
                { path: "categories", select: "_id name value label color" }
            ],
            select: "title createdAt numberComments usersSavedPost linkImage date comments likePost"
        });

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 4. sort user
    const postsInverted = user.likePost.posts.reverse();

    return {
        data: postsInverted,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const userDashboardFollowedTagsPaginated = async (
    page = 1,
    limit = 10,
    userId: any
) => {
    // 1. calcular skip
    const skip = (page - 1) * limit;

    // 2. get total
    const userTotal = await User.findById(userId).select("followsTags.tags");
    if (!userTotal) {
        throw new ServiceException("User not found", 404);
    }

    const total = userTotal.followsTags?.tags?.length || 0;

    // 3. get tags paginated
    const user = await User.findById(userId)
        .select("followsTags.tags")
        .populate({
            path: "followsTags.tags",
            options: {
                skip,
                limit,
                sort: { createdAt: -1 },
            },
            select: "name color desc follows _id",
        });

    // 4. sort tags
    const tagsInverted = user?.followsTags.tags.reverse();

    return {
        data: tagsInverted,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// get users
const userDashboardFollowersPaginated = async (page = 1, limit = 10, userId: any) => {
    const skip = (page - 1) * limit;

    // 1. get total
    const userTotal = await User.findById(userId).select("followersUsers.followers");
    if (!userTotal) {
        throw new ServiceException("User not found", 404);
    }
    const total = userTotal.followersUsers?.followers?.length || 0;

    // 2. get users
    const user = await User.findById(userId)
        .select("followersUsers.followers")
        .populate({
            path: "followersUsers.followers",
            options: { skip, limit },
            select: "name email profilePicture followersUsers followedUsers posts",
        });

    // 3. sort users
    const followersInverted = user?.followersUsers.followers.reverse();

    return {
        data: followersInverted,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// get users
const userDashboardFollowingPaginated = async (page = 1, limit = 10, userId: any) => {
    const skip = (page - 1) * limit;

    // 1. get total
    const userTotal = await User.findById(userId).select("followedUsers.followed");
    if (!userTotal) {
        throw new ServiceException("User not found", 404);
    }
    const total = userTotal.followedUsers?.followed?.length || 0;

    // 2. get users
    const user = await User.findById(userId)
        .select("followedUsers.followed")
        .populate({
            path: "followedUsers.followed",
            options: { skip, limit },
            select: "name email profilePicture followersUsers followedUsers posts",
        });

    // 3. new order
    const followedInverted = user?.followedUsers.followed.reverse();

    return {
        data: followedInverted,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const topUsersCategories = async () => {

    // 1. get users top
    const users = await User.find()
        .sort({ numberPost: -1 })
        .limit(5)
        .select("name profilePicture numberPost email");

    // 2. get categories top        
    const categories = await Categories.find()
        .sort({ "follows.countFollows": -1 })
        .limit(5)
        .select("name _id color follows");

    return {
        users,
        categories
    };
}

const getUsersByNameOrEmailPaginatedService = async (page = 1, limit = 5, search = "") => {
    // 1. calcular skip
    const skip = (page - 1) * limit;

    // 2. query base (regex en name o email)
    const query = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    };

    // 3. obtener usuarios paginados
    const users = await User.find(query)
        .skip(skip)
        .limit(limit)
        // .select("_id name email profilePicture createdAt")
        .sort({ createdAt: -1 });

    // 4. calcular total
    const total = await User.countDocuments(query);

    // 5. return info
    return {
        data: users,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};



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
    getOneUserProfileInfoService,
    userDashboardInfoService,
    userDashboardPostLikedPaginated,
    userDashboardPostSavedPaginated,
    userDashboardFollowedTagsPaginated,
    userDashboardFollowersPaginated,
    userDashboardFollowingPaginated,
    topUsersCategories,
    getUsersByNameOrEmailPaginatedService
}