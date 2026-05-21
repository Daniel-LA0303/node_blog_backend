import Comment from "../models/Comments";
import Post from "../models/Post";
import commentsService from "../services/commentsService";
import { ApiResponse } from "../utils/ApiResponse";


const getAllComments = async (req: any, res: any) => {
    try {
        const comments = await Comment.find()
            .select('comment dateComment postID')
            .populate({
                path: 'userID',
                select: 'name profilePicture'
            }).populate({
                path: 'replies',
                select: 'reply dateReply',
                populate: {
                    path: 'userID',
                    select: 'name profilePicture'
                }
            });
        res.json(comments);
    } catch (error) {
        res.status(500).json(error);
    }

}

/*DELETE*/
const getAllCommentsByPost = async (postId: any) => {
    try {
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
    } catch (error) {
        console.error("Error en getAllCommentsByPost:", error);
        throw error;
    }
}

const getAllCommentsByPostFunction = async (
    req: any,
    res: any
): Promise<void> => {
    try {

        const { id } = req.params;

        const comments = await Comment.find({ id })
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

        res.json(comments);

    } catch (error: any) {

        res.status(500).json({
            message: error.message
        });

    }
};


const addComment = async (req: any, res: any, next: any) => {

    try {

        const newComment = await commentsService.newCommentService(req.params.id, req.body);
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Comment created successfully",
            newComment,
            false
        ));
        
    } catch (error) {
        console.error(error);
        next(error);
    }
};


const getOneComment = async (req: any, res: any) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .select('comment dateComment ')
            .populate({
                path: 'userID',
                select: 'name profilePicture'
            }).populate({
                path: 'replies',
                select: 'reply dateReply',
                populate: {
                    path: 'userID',
                    select: 'name profilePicture'
                }
            })
        res.json(comment);
    } catch (error) {
        res.status(500).json(error);
    }
}

const editComment = async (req: any, res: any, next: any) => {
    try {

        const commentUpdated = await commentsService.updateCommentService(req.params.id, req.query.user, req.body);
        res.status(200).json(new ApiResponse(
            200,
            req.originalUrl,
            req.method,
            "Comment updated successfully",
            commentUpdated,
            false
        ));
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const deleteComment = async (req: any, res: any, next: any) => {
    try {

        await commentsService.deleteCommentService(req.params.id, req.query.user, req.query.post);
        res.status(200).json(new ApiResponse(
            200,
            req.originalUrl,
            req.method,
            "Comment deleted successfully",
            "Comment deleted",
            false
        ));
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}

const getCommentsPaginatedByBlogId = async (req: any, res: any, next: any) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const postId = req.params.id;

        const result = await commentsService.getCommentsByPostPaginatedService(postId, page, limit);
        res.status(200).json(new ApiResponse(
            200,
            req.originalUrl,
            req.method,
            "Get comments paginated successfully",
            result,
            false
        ));


    } catch (error) {
        console.log(error);
        next(error);
    }
}

export {
    getAllComments,
    getAllCommentsByPost,
    getAllCommentsByPostFunction,
    addComment,
    getOneComment,
    editComment,
    deleteComment,
    getCommentsPaginatedByBlogId
}