import Comment from "../models/Comments.js";
import Replies from "../models/Replies.js";

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

const createReply = async (req, res) => {
  try {
      
      // throw new Error("Simulated error in getUserPosts");
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
          return res.status(404).json({ error: 'Error', msg: "Comment not found" });
      }

      const reply = new Replies({
          reply: req.body.reply,
          commentID: req.params.id,
          userID: req.body.userID,
          postID: req.body.postID,
          dateReply: new Date()
      });

      const newReply = await reply.save();

      comment.replies.push(newReply._id);
      await comment.save();

      const comment2 = await Comment.findById(req.params.id)
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
        res.json(comment2);
  } catch (error) {
      res.status(400).json({  error: 'Error', msg: error.message });
  }
};


const updateReply = async (req, res) => {
  try {
    // throw new Error("Simulated error in getUserPosts");
    const reply = await Replies.findById(req.params.id);

    if(!reply) {
      return res.status(404).json({ error: 'Error', msg: "Reply not found" });
    }

    if (reply.userID.toString() !== req.query.user) {
        return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
    }

    if (req.body.reply) {
      reply.reply = req.body.reply;
    }
    const updatedReply = await reply.save();
    const comment2 = await Comment.findById(req.body.commentID)
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
        res.json(comment2);
  } catch (error) {
    res.status(500).json({ error: 'Error', msg: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {

    // throw new Error("Simulated error in getUserPosts");
    const reply = await Replies.findById(req.params.id);

    if(!reply) {
      return res.status(404).json({ error: 'Error', msg: "Reply not found" });
    }

    if (reply.userID.toString() !== req.query.user) {
        return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
    }

    await Replies.findByIdAndDelete(req.params.id);
    const comment2 = await Comment.findById(req.body.commentID)
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
        res.json(comment2);
  } catch (error) {
    res.status(500).json({  error: 'Error', msg: error.message});
  }
};

export {
  getAllReplies,
  getReply,
  createReply,
  updateReply,
  deleteReply,
};