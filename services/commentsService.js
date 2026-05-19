import mongoose from "mongoose";
import Comment from "../models/Comments.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { ServiceException } from "../utils/exception/ServiceException.js";

const getAllCommentsByOnePost = async (postId) => {

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

const newCommentService = async (postId, commentBody) => {

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
    post.comments.push(newComment);
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

    return populatedComment;

}

const updateCommentService = async (commentId, userId, commentNewData) => {

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

const deleteCommentService = async (commentId, userId, postId) => {

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
    post.comments.pull(comment);
    await post.save();

    // 6. remove comment
    await comment.remove();

}

// const getCommentsByPostPaginatedService = async (postId, page = 1, limit = 10) => {
//   try {
//     const skip = (page - 1) * limit;

//     // 1. Obtener comentarios paginados
//     const comments = await Comment.find({ postID: postId })
//       .select('comment dateComment postID')
//       .populate({
//         path: 'userID',
//         select: 'name profilePicture'
//       })
//       .populate({
//         path: 'replies',
//         select: 'reply dateReply',
//         options: { 
//           sort: { dateReply: -1 }, // Ordenar replies por fecha (más reciente primero)
//           limit: 1 // Solo traer 1 reply (la más reciente)
//         },
//         populate: {
//           path: 'userID',
//           select: 'name profilePicture'
//         }
//       })
//       .sort({ dateComment: -1 })
//       .skip(skip)
//       .limit(limit);

//     // 2. Contar total de comentarios para este post
//     const total = await Comment.countDocuments({ postID: postId });

//     return {
//       data: comments,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     }

//   } catch (error) {
//     throw new Error("Error obteniendo comentarios: " + error.message);
//   }
// }

const getCommentsByPostPaginatedService = async (postId, page = 1, limit = 5) => {

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