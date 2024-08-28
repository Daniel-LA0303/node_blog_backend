 import mongoose from "mongoose";
import Reply from "./Replies.js";
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userID:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    comment:{
        type: String,
    },
    dateComment: {
        type: Date,
        default: Date.now
    },
    replies: [{
        type: Schema.ObjectId,
        ref: 'Reply'
    }],
    postID:{
        type: Schema.ObjectId,
        ref: 'Post'
    }
});

commentSchema.pre('remove', async function(next) {
    try {
        await Reply.deleteMany({ commentID: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
