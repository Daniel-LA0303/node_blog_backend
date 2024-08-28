import mongoose from "mongoose";
const Schema = mongoose.Schema;

const replySchema = new Schema({
    userID:{
        type: Schema.ObjectId,
        ref: 'User'
    },
    postID:{
        type: Schema.ObjectId,
        ref: 'Post'
    },
    commentID:{
        type: Schema.ObjectId,
        ref: 'Comment'
    },
    reply:{
        type: String,
    },
    dateReply: {
        type: Date,
        default: Date.now
    },

});

const Reply = mongoose.model('Reply', replySchema);

export default Reply;