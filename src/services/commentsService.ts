import mongoose from "mongoose";
import Comment from "../models/Comments";
import Post from "../models/Post";
import User from "../models/User";
import { ServiceException } from "../utils/exception/ServiceException";
import { NewNotificationI } from "../interfaces/notification.interfaces";
import { EntityType, NotificationType } from "../enums/notifications.enums";
import notificationsServices from "./notificationsServices";

const getAllCommentsByOnePost = async (postId: any) => {

    const post = await Post.findById(postId);

    if (!post) {
        throw new ServiceException("This post doesn't exists", 404);
    }

    const comments = await Comment.find({ postID: postId }) // Cambiado de id a postID
        .select('comment dateComment postID')
        .populate({
            path: 'userID',
            select: 'name profilePicture'
        })
        .populate({
            path: 'replies',
            select: 'reply dateReply',
            populate: {
                path: 'userID',
                select: 'name profilePicture'
            }
        });

    return comments;
}

const newCommentService = async (postId: any, commentBody: any) => {

    const { userID, comment } = commentBody;

    // 1. first search post
    const post = await Post.findById(postId);
    if (!post) {
        throw new ServiceException("This post doesn't exists", 404);
    }

    // 2. search user
    const user = await User.findById(commentBody.userID);
    if (!user) {
        throw new ServiceException("This user doesn't exists", 404);
    }

    // 3. we create new comment
    const newComment = new Comment({
        userID: userID,
        comment: comment,
        postID: postId,
    });
    const commentCreated = await newComment.save();

    // 4. add id to post document
    post.comments.push(newComment._id);
    await post.save();

    // 5. Return the newly created comment with populated fields
    const populatedComment = await Comment.findById(commentCreated._id)
        .select('comment dateComment postID')
        .populate({
            path: 'userID',
            select: 'name profilePicture'
        })
        .populate({
            path: 'replies',
            select: 'reply dateReply',
            populate: {
                path: 'userID',
                select: 'name profilePicture'
            }
        });

    // check don't send to a notification to same user himself
    if (post.user.toString() !== userID.toString()) {
        const notificationData: NewNotificationI = {
            recipientId: post.user,
            senderId: userID,
            entityId: postId,
            message: user.name + " comment your post: " + (
                post.title.length > 10 ? post.title.slice(0, 10) + "..." : post.title),
            entityType: EntityType.COMMENT,
            type: NotificationType.COMMENT_POST,
            isCheck: false
        };

        await notificationsServices.sendNotification(notificationData);

    }


    return populatedComment;

}

const updateCommentService = async (commentId: any, userId: any, commentNewData: any) => {

    // 1. check if post exists
    const post = await Post.findById(commentNewData.postId);
    if (!post) {
        throw new ServiceException("This post doesn't exists", 404);
    }

    // 2. check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ServiceException("This comment doesn't exists", 404);
    }

    // 3. check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("This user doesn't exists", 404);
    }

    // 4. check if user its the same to update comment
    if (comment.userID.toString() !== userId) {
        throw new ServiceException("You don't have permissions to update this comment", 401);
    }

    // 5. update comment
    comment.comment = commentNewData.comment;
    await comment.save();

    // 6. we need this info
    const populatedComment = await Comment.findById(comment._id)
        .select('comment dateComment postID')
        .populate({
            path: 'userID',
            select: 'name profilePicture'
        })
        .populate({
            path: 'replies',
            select: 'reply dateReply',
            populate: {
                path: 'userID',
                select: 'name profilePicture'
            }
        });

    return populatedComment;
}

const deleteCommentService = async (commentId: any, userId: any, postId: any) => {

    // 1. check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new ServiceException("This post doesn't exists", 404);
    }

    // 2. check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ServiceException("This comment doesn't exists", 404);
    }

    // 3. check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("This user doesn't exists", 404);
    }

    // 4. check if user its the same to update comment
    if (comment.userID.toString() !== userId) {
        throw new ServiceException("You don't have permissions to delete this comment", 401);
    }

    // 5. quit comment from post
    post.comments = post.comments.filter(
        (id) => id.toString() !== comment._id.toString()
    );

    await post.save();

    // 6. remove comment
    await comment.remove();

}

const getCommentsByPostPaginatedService = async (postId: any, page = 1, limit = 5) => {

    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        // Filtro por post
        { $match: { postID: new mongoose.Types.ObjectId(postId) } },

        // Ordenar comentarios (más recientes primero)
        { $sort: { dateComment: -1 } },

        // Paginación
        { $skip: skip },
        { $limit: limit },

        // Populate userID
        {
            $lookup: {
                from: 'users',
                localField: 'userID',
                foreignField: '_id',
                as: 'userID',
                pipeline: [
                    { $project: { name: 1, profilePicture: 1 } }
                ]
            }
        },
        { $unwind: '$userID' },

        // Populate replies (solo la más reciente)
        {
            $lookup: {
                from: 'replies',
                localField: 'replies',
                foreignField: '_id',
                as: 'replies',
                pipeline: [
                    { $sort: { dateReply: -1 } },
                    // { $limit: 1 }, // Solo la reply más reciente
                    // Populate userID de la reply
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userID',
                            foreignField: '_id',
                            as: 'userID',
                            pipeline: [
                                { $project: { name: 1, profilePicture: 1 } }
                            ]
                        }
                    },
                    { $unwind: '$userID' }
                ]
            }
        }
    ]);

    const total = await Comment.countDocuments({ postID: postId });

    return {
        data: comments,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

}



export default {
    getAllCommentsByOnePost,
    newCommentService,
    updateCommentService,
    deleteCommentService,
    getCommentsByPostPaginatedService
}