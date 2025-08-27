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

export default {
    getAllCommentsByOnePost,
    newCommentService,
    updateCommentService,
    deleteCommentService
}