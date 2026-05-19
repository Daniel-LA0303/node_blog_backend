import Comment from "../models/Comments.js";
import Replies from "../models/Replies.js";
import repliesServices from "../services/repliesServices.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllReplies = async (req, res) => {
  try {
    const replies = await Replies.find();
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReply = async (req, res) => {
  try {
    const reply = await Replies.findById(req.params.id);
    res.json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReply = async (req, res, next) => {
  try {

    const result = await repliesServices.newReplyService(req.params.id, req.body);

    // throw new Error("Simulated error in getUserPosts");
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


const updateReply = async (req, res, next) => {
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

const deleteReply = async (req, res, next) => {
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

const getRepliesPaginatedByCommentId = async (req, res, next) => {
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

const countRepliesByCommentId = async (req, res, next) => {
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
  getAllReplies,
  getReply,
  createReply,
  updateReply,
  deleteReply,
  getRepliesPaginatedByCommentId,
  countRepliesByCommentId
};