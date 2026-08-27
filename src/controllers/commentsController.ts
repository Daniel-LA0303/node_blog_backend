import commentsService from "../services/commentsService";
import { ApiResponse } from "../utils/ApiResponse";


// new comment
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

// edit a comment
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

// delete a comment
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

// get comment paginated
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
    addComment,
    editComment,
    deleteComment,
    getCommentsPaginatedByBlogId
}