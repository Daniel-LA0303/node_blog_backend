import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../config/cloudinary";
import Categories from "../models/Categories";
import User from "../models/User";
import Post from "../models/Post"
import { ServiceException } from "../utils/exception/ServiceException";
import fs from "fs-extra"
import { generateAccessToken, generateRefreshToken } from "../helpers/generateJWT";
import generateID from "../helpers/generateID";
import { EntityType, NotificationType } from "../enums/notifications.enums";
import notificationsServices from "./notificationsServices";
import { NewNotificationI } from "../interfaces/notification.interfaces";
import Subscriptions from "../models/Subscriptions";
import PlanSuscription from "../models/Plan";
import { trackActivityService } from "./globalServices";
import { emailAddModerator, emailRegister, emailUserStatusChange, IEmailUserStatusData } from "../helpers/email";
import { IInfoUser } from "../interfaces/tokens.interfaces";
import Tokens from "../models/Tokens";
import { hashToken } from "../utils/hashToken";
import bcrypt from "bcryptjs";
import auditLogServices from "./auditLogServices";


// update profile service with new info
const updateProfileService = async (
    userId: any,
    previousName: any,
    files: any,
    profilePicture: any,
    body: any
) => {

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

// user unfollow a tag or category
const userUnfollowATagService = async (categoryId: any, userId: any) => {

    // 1. check if user exists
    const user = await User.findById(userId);
    if (!user) throw new ServiceException("User not found", 404);

    await trackActivityService(user._id.toString());

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
const userFollowATagService = async (categoryId: any, userId: any) => {

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

    await trackActivityService(userProfileId);

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

    await notificationsServices.sendNotificationService(notificationData);
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

// get all info user to update
const getUserInfoToEditService = async (userId: any, userAuthId: any) => {

    // 1. search user
    const user = await User.findById(userId).select('info profilePicture');

    // 2. send exception if user does not exists
    if (!user) throw new ServiceException("User not found", 404);

    // 3. check if userId and user auth id are the same
    if (userId.toString() !== userAuthId.toString()) {
        throw new ServiceException("You don't have permissions to edit this user", 403);
    }

    return user;
}

const loginService = async (
    email: string,
    password: string,
    info: IInfoUser
) => {
    // 1. check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // get plan suscription
    const suscription = await Subscriptions.findOne({ user: user._id });

    // get plan
    const plan = await PlanSuscription.findById(suscription?.planSubscription);

    // 2. check if user is confirmed
    if (!user.confirm) {
        throw new ServiceException("This account has not been confirmed", 400);
    }

    // 3. check password
    if(!await user.checkPassword(password)) {
        throw new ServiceException("Your password is incorrect", 400);
    }

    if(user.status === 'BANNED'){
        throw new ServiceException("You has been banned, you can not use the platform", 400);
    }

    // 4. generate report, acces and refresh token
    const refreshToken = generateRefreshToken(user._id, user.roles);
    const accessToken = generateAccessToken(user._id, user.roles);

    const tokenInfo = new Tokens({
        token: hashToken(refreshToken),
        ipAddress: info.ip,
        userAgent: info.userAgent,
        origin: info.origin,
        host: info.host,
        userId: user._id
    });

    // save token
    await tokenInfo.save();

    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profilePicture.secure_url,
        accessToken,
        refreshToken,
        roles: user.roles,
        expiresAt: suscription?.expiresAt,
        isFree: suscription?.isFree,
        plan: plan
    }

}

const refreshTokenService = async (
    oldTokenDoc: any,
    user: any,
    info: IInfoUser
) => {

    // 1. flow refresh token 
    oldTokenDoc.isRevoked = true;
    oldTokenDoc.status = 'REVOKED';
    await oldTokenDoc.save();

    // 2. create and save new token
    const accessToken = generateAccessToken(user._id, user.roles);
    const newRefreshToken = generateRefreshToken(user._id, user.roles);

    await Tokens.create({
        token: hashToken(newRefreshToken),
        userId: user._id,
        ipAddress: info.ip,
        userAgent: info.userAgent,
        origin: info.origin,
        host: info.host,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 días
    });

    return {
        accessToken,
        refreshToken: newRefreshToken
    }
}


// register new user
const registerNewUserService = async (email: any, body: any) => {

    // 1. check if email exists
    const existUser = await User.findOne({ email: email });
    if (existUser) {
        throw new ServiceException("This email already exists", 400);
    }

    // 2. assamble use rinfo
    const user = new User(body);
    user.password = await bcrypt.hash(body.password, 10);

    // 3. generate token to confirm
    user.token = generateID();

    // 4. save new user
    await user.save();

    // 5. send email
    await emailRegister({
        email: user.email,
        name: user.name,
        token: user.token
    });
}

// to confirm user 
const userConfirmedService = async (token: any) => {

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

// get all posts bys user
const getPostByUserPaginatedService = async (page = 1, limit = 5, userId: any) => {

    // 1. calculate skip
    const skip = (page - 1) * limit;

    const query = {
        user: new mongoose.Types.ObjectId(userId),
        status: { $in: ['PUBLISHED'] }
    };

    // 2. get posts with info    
    const posts = await Post.find(query)
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
        .select('title createdAt numberComments usersSavedPost linkImage date comments likePost status')
        .sort({ createdAt: -1 });


    // 3. calculate total
    const total = await Post.countDocuments(query);

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

const getPostByUserDashboardPaginatedService = async (page = 1, limit = 5, userId: any) => {

    // 1. calculate skip
    const skip = (page - 1) * limit;

    const query = {
        user: new mongoose.Types.ObjectId(userId),
        status: { $in: ['PUBLISHED', 'HIDDEN'] }
    };

    // 2. get posts with info    
    const posts = await Post.find(query)
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
        .select('title createdAt numberComments usersSavedPost linkImage date comments likePost status')
        .sort({ createdAt: -1 });


    // 3. calculate total
    const total = await Post.countDocuments(query);

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

// get all info user to show in profile page
const getOneUserProfileInfoService = async (userId: any) => {

    const user = await User.findOne({ _id: userId, status: 'ACTIVE' }).populate({
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
    }).select('profilePicture email createdAt info name _id followersUsers numberPost posts status roles');

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

// get post save by user
const userDashboardPostSavedPaginatedService = async (page = 1, limit = 5, userId: any) => {

    // 1. get skip
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select("postsSaved.posts");
    const savedPostIds = user?.postsSaved?.posts || [];

    const query = {
        _id: { $in: savedPostIds },
        status: "PUBLISHED"
    };

    // 2. get total
    const total = await Post.countDocuments(query);

    // 3. get post
    const posts = await Post.find(query)
        .skip(skip)
        .limit(limit)
        .select("title createdAt numberComments usersSavedPost linkImage date comments likePost status")
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "name _id profilePicture" })
        .populate({ path: "categories", select: "_id name value label color" });

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 4. sort post
    const postsInverted = [...posts].reverse();

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

// get post liked by user
const userDashboardPostLikedPaginatedService = async (page = 1, limit = 5, userId: any) => {

    // 1. Calculate skip offset
    const skip = (page - 1) * limit;

    // 2. Retrieve user's liked post IDs
    const user = await User.findById(userId).select("likePost.posts");

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    const likedPostIds = user.likePost?.posts || [];

    // 3. Define query criteria (filters for liked IDs and active status)
    const query = {
        _id: { $in: likedPostIds },
        status: "PUBLISHED"
    };

    // 4. Calculate accurate total count for matching published posts
    const total = await Post.countDocuments(query);

    // 5. Query published liked posts with pagination and native MongoDB sorting
    const posts = await Post.find(query)
        .skip(skip)
        .limit(limit)
        .select("title createdAt numberComments usersSavedPost linkImage date comments likePost status")
        .sort({ createdAt: -1 }) // Handles reversed order directly at database level
        .populate({ path: "user", select: "name _id profilePicture" })
        .populate({ path: "categories", select: "_id name value label color" });

    return {
        data: posts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// get tags followed by user
const userDashboardFollowedTagsPaginatedService = async (
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

// get followers by user
const userDashboardFollowersPaginatedService = async (page = 1, limit = 10, userId: any) => {
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

// get following by user
const userDashboardFollowingPaginatedService = async (page = 1, limit = 10, userId: any) => {
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

// get categories and users top to show it in home
const topUsersCategoriesService = async () => {

    // 1. get users top
    const users = await User.find({ status: 'ACTIVE' })
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

// search users to show it in serach page
const getUsersByNameOrEmailPaginatedService = async (page = 1, limit = 5, search = "") => {

    // 1. calcular skip
    const skip = (page - 1) * limit;

    // 2. query base 
    const query = {
        status: 'ACTIVE',
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    };

    // 3. oget users paginated
    const users = await User.find(query)
        .skip(skip)
        .limit(limit)
        // .select("_id name email profilePicture createdAt")
        .sort({ createdAt: -1 });

    // 4. total
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

/** */
// get blogs recommended to show it with a user is seeing a post
const getBlogsRecommendedService = async (userId?: string) => {


    const blogsRecomended = await User.findById(userId)
        .select('recomended')
        .populate({
            path: "recomended.recommendedBlogs",
            match: { status: "PUBLISHED" },
            select: "linkImage _id title desc categories date comments createdAt",
            populate: {
                path: "categories",
                select: "_id name color desc createdAt"
            }
        });

    if (!blogsRecomended) {
        throw new ServiceException("User not found", 404);
    }

    return blogsRecomended;
}

// get tags recommended to show tags
const getTagsRecommendedService = async (userId?: string) => {

    const tagsRecomended = await User.findById(userId)
        .select('recomended')
        .populate({
            path: "recomended.recommendedTags",
            select: "_id name color desc createdAt",
        });

    if (!tagsRecomended) {
        throw new ServiceException("User not found", 404);
    }

    return tagsRecomended;
}

// get users recommended
const getUsersRecommendedService = async (userId?: string) => {

    const usersRecomended = await User.findById(userId)
        .select('recomended')
        .populate({
            path: "recomended.recommendedUsers",
            match: { status: 'ACTIVE' },
            select: "_id name color email createdAt profilePicture followersUsers",
        });

    if (!usersRecomended) {
        throw new ServiceException("User not found", 404);
    }

    return usersRecomended;
}

const createModerService = async (userId: string, userR: any, req: any) => {

    // 1. search user and valid user
    const user = await User.findById(userId);

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. valid that user does not have role
    const roles = user.roles.map(r => r.name);
    const isRole = roles.some(r => r === 'ROLE_MOD');

    if (isRole) {
        throw new ServiceException("This user have role mod yet", 400);
    }

    // insert new role and save
    const newRole = { name: 'ROLE_MOD' }
    user.roles.push(newRole);

    await user.save();

    // 3. send notification email 
    await emailAddModerator({
        email: user.email,
        name: user.name,
    });

    // 4. close all sessions
    await Tokens.updateMany(
        { userId: user._id, status: 'ACTIVE', }, // filter
        { $set: { status: 'REVOKED', isRevoked: true } }
    );

    await auditLogServices.createAuditLogService({
        actor: userR,
        action: 'ADD_MOD',
        category: 'MODERATION',
        target: {
            entityType: 'User',
            entityId: user._id,
            name: user.email
        },
        req
    });
}

const removeModerService = async (userId: string, userR: any, req: any) => {

    // 1. search user and valid user
    const user = await User.findById(userId);

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. valid that user does not have role
    const isRole = user.roles.some(r => r.name === 'ROLE_MOD');

    if (!isRole) {
        throw new ServiceException("This user does not have this role to remove it.", 400);
    }

    // insert new role and save
    user.roles.pull({ name: 'ROLE_MOD' });

    await user.save();

    await auditLogServices.createAuditLogService({
        actor: userR,
        action: 'REMOVE_MOD',
        category: 'MODERATION',
        target: {
            entityType: 'User',
            entityId: user._id,
            name: user.email
        },
        req
    });
}


const searchUsersToAdminPanelService = async (search: string) => {

    // 1. query base 
    const query = {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    };

    // 2. get users paginated
    const users = await User.find(query)
        // .select("_id name email profilePicture createdAt")
        .sort({ createdAt: -1 })
        .select("name email profilePicture roles info");


    // 5. return info
    return users;
}

const verifyUserService = async (userId: string, userR: any, req: any) => {

    // 1. find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. verify user
    user.confirm = true;
    user.status = 'ACTIVE';
    await user.save();

    // 3. send email
    const dataEmail: IEmailUserStatusData = {
        email: user.email,
        name: user.name,
        status: 'VERIFIED',
    }

    await emailUserStatusChange(dataEmail);

    await auditLogServices.createAuditLogService({
        actor: userR,
        action: 'USER_CONFIRM',
        category: 'MODERATION',
        target: {
            entityType: 'User',
            entityId: user._id,
            name: user.email
        },
        req
    });
}

const banUserService = async (userId: string, userR: any, req: any) => {

    // 1. find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. send email
    const dataEmail: IEmailUserStatusData = {
        email: user.email,
        name: user.name,
        status: 'BANNED',
    }
    //await emailUserStatusChange(dataEmail);

    // 3. revoke all token for this user
    await Tokens.updateMany(
        {userId: user._id},
        { $set: {isRevoked: true, status: 'REVOKED'}}
    );

    // 4. close session via web socket and all tokens
    await notificationsServices.sendNotificationUserBannedService(user._id.toString());

    // 5. add log
    await auditLogServices.createAuditLogService({
        actor: userR,
        action: 'USER_BANNED',
        category: 'MODERATION',
        target: {
            entityType: 'User',
            entityId: user._id,
            name: user.email
        },
        req
    });

}

const unbanUserService = async (userId: string, userR: any, req: any) => {

    // 1. find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. change status
    user.status = 'ACTIVE';
    await user.save();

    // 3. send email
    const dataEmail: IEmailUserStatusData = {
        email: user.email,
        name: user.name,
        status: 'ACTIVE',
    }

    //await emailUserStatusChange(dataEmail);

    await auditLogServices.createAuditLogService({
        actor: userR,
        action: 'USER_UNBANNED',
        category: 'MODERATION',
        target: {
            entityType: 'User',
            entityId: user._id,
            name: user.email
        },
        req
    });


}

export default {
    updateProfileService,
    userFollowATagService,
    userUnfollowATagService,
    getUserInfoToEditService,
    loginService,
    registerNewUserService,
    userConfirmedService,
    followUserService,
    unfollowUserService,
    getPostByUserPaginatedService,
    getOneUserProfileInfoService,
    userDashboardInfoService,
    userDashboardPostLikedPaginatedService,
    userDashboardPostSavedPaginatedService,
    userDashboardFollowedTagsPaginatedService,
    userDashboardFollowersPaginatedService,
    userDashboardFollowingPaginatedService,
    topUsersCategoriesService,
    getUsersByNameOrEmailPaginatedService,
    getBlogsRecommendedService,
    getTagsRecommendedService,
    getUsersRecommendedService,
    refreshTokenService,
    createModerService,
    removeModerService,
    searchUsersToAdminPanelService,
    verifyUserService,
    banUserService,
    unbanUserService,
    getPostByUserDashboardPaginatedService
}