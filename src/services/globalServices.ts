import mongoose from "mongoose";
import Categories from "../models/Categories";
import Post from "../models/Post";
import User from "../models/User";

const RECO_THRESHOLD = 5; // each 5 actions

/** 
 * TODO: this fucntion is very artesanal, so is think to platform with limit users
 * max 1000000
 * if there are more than 1000000 users, we need to change architecture
 * 
 * THIS FUNCTION GENERATE USERS - BLOGS - CATEGORIES 
 * this can be set in a user information each 5 reactions
*/
export const generateRecommendationsService = async (userId: string) => {
    try {
        const user = await User.findById(userId).select(
            "likePost.posts postsSaved.posts followsTags.tags followedUsers.followed posts historySearch"
        );

        if (!user) return;

        // verify id to set exists
        const [existingLikedPosts, existingSavedPosts, existingFollowedTags, existingFollowedUsers] = await Promise.all([
            Post.find({ _id: { $in: user.likePost.posts } }).select("_id categories"),
            Post.find({ _id: { $in: user.postsSaved.posts } }).select("_id categories"),
            Categories.find({ _id: { $in: user.followsTags.tags } }).select("_id"),
            User.find({ _id: { $in: user.followedUsers.followed } }).select("_id followedUsers.followed"),
        ]);

        const existingLikedPostIds = existingLikedPosts.map(p => p._id.toString());
        const existingSavedPostIds = existingSavedPosts.map(p => p._id.toString());
        const existingFollowedTagIds = existingFollowedTags.map(t => t._id.toString());
        const existingFollowedUserIds = existingFollowedUsers.map(u => u._id.toString());

        // clean ids with objects deleted
        await User.findByIdAndUpdate(userId, {
            "likePost.posts": existingLikedPostIds,
            "postsSaved.posts": existingSavedPostIds,
            "followsTags.tags": existingFollowedTagIds,
            "followedUsers.followed": existingFollowedUserIds,
        });

        // recommended blogs
        const interactedPosts = [...existingLikedPosts, ...existingSavedPosts];

        const interactedCategories = interactedPosts
            .flatMap(p => p.categories)
            .map(c => c.toString());

        const allRelevantTags = [...new Set([...interactedCategories, ...existingFollowedTagIds])];

        const excludedPostIds = [
            ...existingLikedPostIds,
            ...existingSavedPostIds,
            ...user.posts.map(id => id.toString()),
        ];

        const recommendedBlogs = await Post.find({
            categories: { $in: allRelevantTags },
            _id: { $nin: excludedPostIds },
        })
            .sort({ createdAt: -1 })
            .limit(15)
            .select("_id");

        // RECOMMENDED USERS 
        const friendsOfFriends = existingFollowedUsers
            .flatMap(u => u.followedUsers.followed.map((id: any) => id.toString()))
            .filter(id => id !== userId && !existingFollowedUserIds.includes(id));

        const userFrequency: Record<string, number> = {};
        friendsOfFriends.forEach(id => {
            userFrequency[id] = (userFrequency[id] || 0) + 1;
        });

        // valid users exists yet
        const candidateUserIds = Object.keys(userFrequency);
        const validCandidateUsers = await User.find({
            _id: { $in: candidateUserIds }
        }).select("_id");

        const validCandidateIds = new Set(validCandidateUsers.map(u => u._id.toString()));

        const sortedUserIds = Object.entries(userFrequency)
            .filter(([id]) => validCandidateIds.has(id)) // only valid users
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([id]) => new mongoose.Types.ObjectId(id));

        // ── RECOMMENDED TAGS 
        const allCategoryIds = [...new Set(interactedCategories)]
            .filter(id => !existingFollowedTagIds.includes(id));

        const recommendedTags = await Categories.find({
            _id: { $in: allCategoryIds }
        })
            .sort({ "follows.countFollows": -1 })
            .limit(15)
            .select("_id");

        // SAVE 
        await User.findByIdAndUpdate(userId, {
            "recomended.recommendedBlogs": recommendedBlogs.map(p => p._id),
            "recomended.recommendedUsers": sortedUserIds,
            "recomended.recommendedTags": recommendedTags.map(c => c._id),
            "recomended.updatedAt": new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
    }
};

// update info with user wach 7 days
export const trackActivityService = async (userId: string) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { "activityTracker.pendingActions": 1 } },
        { new: true }
    ).select("activityTracker");

    if (!user) return;

    const { pendingActions, lastRecommendationAt } = user.activityTracker;

    // force each 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isStale = !lastRecommendationAt || lastRecommendationAt < sevenDaysAgo;

    if (pendingActions >= RECO_THRESHOLD || isStale) {
        // reset data
        await User.findByIdAndUpdate(userId, {
            "activityTracker.pendingActions": 0,
            "activityTracker.lastRecommendationAt": new Date()
        });

        generateRecommendationsService(userId).catch(console.error);
    }
};
