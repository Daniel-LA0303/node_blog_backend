import mongoose from "mongoose";
import User from "./User.js";
import Reply from "./Replies.js";
import Comment from "./Comments.js";
const Schema = mongoose.Schema;

const postSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    title:{
        type: String,
        required: true,
        unique: true
    },
    desc:{
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    linkImage: {
        secure_url: {
            type: String,
            default: ''
        },
        public_id: {
            type: String,
            default: ''
        },
    },
    categoriesPost:{
        type: Array,
        required:false
    },
    categoriesSelect: {
        type: Array,
        required:false
    },
    likePost: {
        users : [{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },
    commenstOnPost:{
        numberComments:{
            type: Number,
            default: 0
        },
        comments:[{
            userID:{
                type: Schema.ObjectId,
                ref: 'User'
            },
            comment:{
                type: String,
                // default: ''
            },
            dateComment: {
                type: String
            },
            replies: [{
                userID: {
                  type: Schema.ObjectId,
                  ref: 'User'
                },
                reply: {
                  type: String,
                  // default: ''
                },
                dateReply: {
                  type: String
                },
              }]
        }]
    },
    usersSavedPost:{
        users:[{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },
    date:{
        type: Number,
        required: false
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
},
    {timestamps: true}
);

postSchema.pre('remove', async function(next) {
    try {
        // Delete related comments and replies
        await Comment.deleteMany({ postID: this._id });
        await Reply.deleteMany({ postID: this._id });

        // Find users who liked this post and remove the post from their likePost
        await User.updateMany(
            { "likePost.posts": this._id },
            { $pull: { "likePost.posts": this._id } }
        );

        // Find users who saved this post and remove the post from their postsSaved
        await User.updateMany(
            { "postsSaved.posts": this._id },
            { $pull: { "postsSaved.posts": this._id } }
        );

        next();
    } catch (err) {
        next(err);
    }
});

const Post = mongoose.model('Post', postSchema);

export default Post;