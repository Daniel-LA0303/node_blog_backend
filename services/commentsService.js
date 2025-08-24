import Comment from "../models/Comments.js";
import Post from "../models/Post.js";

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

export default {
    getAllCommentsByOnePost
}