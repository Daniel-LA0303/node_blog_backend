import mongoose from "mongoose";
import { deleteImage, uploadImage } from "../config/cloudinary.js";
import Categories from "../models/Categories.js";
import User from "../models/User.js";
import { ServiceException } from "../utils/exception/ServiceException.js";
import fs from "fs-extra"
import generateJWT from "../helpers/generateJWT.js";


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

    // 5. assamble info and save
    user.info = {
        desc: body.desc,
        work: body.work,
        education: body.education,
        skills: body.skills
    }
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
        token: generateJWT(user._id)
    }

}

export default {
    updateProfileService,
    userFollowATag,
    userUnfollowATag,
    getUserInfoToEdit,
    login
}