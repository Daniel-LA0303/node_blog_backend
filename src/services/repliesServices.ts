import { ServiceException } from "../utils/exception/ServiceException.js";
import Comment from "../models/Comments.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Replies from "../models/Replies.js";
import mongoose from "mongoose";

const newReplyService = async (commentId: any, body: any) => {

    const post = await Post.findById(body.postID);
    if (!post) {
        throw new ServiceException("This post doesn't exists", 404);
    }

    const user = await User.findById(body.userID);
    if (!user) {
        throw new ServiceException("This user doesn't exists", 404);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ServiceException("This comment doesn't exists", 404);
    }

    const reply = new Replies({
        reply: body.reply,
        commentID: commentId,
        userID: body.userID,
        postID: body.postID,
        dateReply: new Date()
    });

    const newReply = await reply.save();

    comment.replies.push(newReply._id);
    await comment.save();

    const populatedReply = await Replies.findById(newReply._id)
        .select('reply dateReply')
        .populate({
            path: 'userID',
            select: 'name profilePicture'
        });

    return populatedReply;;
}

const getRepliesByCommentPaginatedService = async (commentId: any, page = 1, limit = 3) => {
    try {
        const skip = (page - 1) * limit;

        const replies = await Replies.aggregate([
            // filte by comment
            { $match: { commentID: new mongoose.Types.ObjectId(commentId) } },

            // sort replies
            { $sort: { dateReply: -1 } },

            // pagination
            { $skip: skip },
            { $limit: limit },

            // populate
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
        ]);

        // count replies
        const total = await Replies.countDocuments({ commentID: commentId });

        return {
            data: replies,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }

    } catch (error: any) {
        throw new Error("Error obteniendo replies: " + error.message);
    }
}

const countRepliesByCommentService = async (commentId: any) => {
    try {
        const total = await Replies.countDocuments({ commentID: commentId });
        return { total };
    } catch (error: any) {
        throw new Error("Error counting replies: " + error.message);
    }
}

const updateReplyService = async (replyId: any, userId: any, updateData: any) => {
    // 1. Buscar la reply
    const reply = await Replies.findById(replyId);
    if (!reply) {
        throw new ServiceException("Reply not found", 404);
    }

    // 2. Verificar que el usuario es el dueño
    if (reply.userID.toString() !== userId) {
        throw new ServiceException("Unauthorized", 401);
    }

    // 3. Actualizar la reply
    if (updateData.reply) {
        reply.reply = updateData.reply;
    }

    const updatedReply = await reply.save();

    // 4. Devolver la reply actualizada con populate
    return await Replies.findById(updatedReply._id)
        .select('reply dateReply userID commentID postID')
        .populate({
            path: 'userID',
            select: 'name profilePicture'
        });
};

const deleteReplyService = async (replyId: any, userId: any, commentId: any) => {
    // 1. Buscar la reply
    const reply = await Replies.findById(replyId);
    if (!reply) {
        throw new ServiceException("Reply not found", 404);
    }

    // 2. Verificar que el usuario es el dueño
    if (reply.userID.toString() !== userId) {
        throw new ServiceException("Unauthorized", 401);
    }

    // 3. Eliminar la reply de la base de datos
    await Replies.findByIdAndDelete(replyId);

    // 4. Eliminar la referencia del comment
    await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { replies: replyId } },
        { new: true }
    );

    // 5. Devolver solo el ID de la reply eliminada (o un objeto de confirmación)
    return { 
        deleted: true, 
        replyId: replyId,
        message: "Reply deleted successfully" 
    };
};

export default {
    newReplyService,
    getRepliesByCommentPaginatedService,
    countRepliesByCommentService,
    updateReplyService,
    deleteReplyService
}