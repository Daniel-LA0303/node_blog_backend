import Replies from "../models/Replies";
import repliesServices from "../services/repliesServices";
import { ApiResponse } from "../utils/ApiResponse";

// create
const createReplyController = async (req: any, res: any, next: any) => {
  try {

    const result = await repliesServices.newReplyService(req.params.id, req.body);
    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Rpely created successfully",
        result,
        false
      )
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// update
const updateReplyController = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { user } = req.query;
    const { reply: newReplyText, commentID } = req.body;

    const updatedReply = await repliesServices.updateReplyService(
      id, 
      user, 
      { reply: newReplyText }
    );

    res.status(200).json(new ApiResponse(
      200,
      req.originalUrl,
      req.method,
      "Reply updated successfully",
      updatedReply,
      false
    ));

  } catch (error) {
    console.log(error);
    next(error);
  }
};

// delete
const deleteReplyController = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { user } = req.query;
    const { commentID } = req.body;

    const result = await repliesServices.deleteReplyService(id, user, commentID);

    res.status(200).json(new ApiResponse(
      200,
      req.originalUrl,
      req.method,
      "Reply deleted successfully",
      result,
      false
    ));

  } catch (error) {
    console.log(error);
    next(error);
  }
};

// get replies paginated
const getRepliesPaginatedByCommentIdController = async (req: any, res: any, next: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const commentId = req.params.commentId;

    const result = await repliesServices.getRepliesByCommentPaginatedService(commentId, page, limit);
    
    res.status(200).json(new ApiResponse(
      200,
      req.originalUrl,
      req.method,
      "Get replies paginated successfully",
      result,
      false
    ));

  } catch (error) {
    console.log(error);
    next(error);
  }
}

// count replies
const countRepliesByCommentIdController = async (req: any, res: any, next: any) => {
  try {
    const commentId = req.params.commentId;
    const result = await repliesServices.countRepliesByCommentService(commentId);
    
    res.status(200).json(new ApiResponse(
      200,
      req.originalUrl,
      req.method,
      "Count replies successfully",
      result,
      false
    ));
  } catch (error) {
    console.log(error);
    next(error);
  }
}




export {
  createReplyController,
  updateReplyController,
  deleteReplyController,
  getRepliesPaginatedByCommentIdController,
  countRepliesByCommentIdController
};