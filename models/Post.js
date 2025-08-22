import mongoose from "mongoose";
import User from "./User.js";
import Reply from "./Replies.js";
import Comment from "./Comments.js";
const Schema = mongoose.Schema;

const postSchema = Schema({

    // user
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    // title
    title:{
        type: String,
        required: true,
        unique: true
    },

    // description
    desc:{
        type: String,
        required: true
    },

    // content
    content: {
        type: String,
        required: true
    },

    // image in cloudinary
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

    // categories select
    categories: [{   
        type: Schema.ObjectId,
        ref: 'Categories',
        required: false
    }],

    // like post
    likePost: {
        users : [{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },

    // comments on post
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

    // users that saved this post
    usersSavedPost:{
        users:[{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },

    // date
    date:{
        type: Number,
        required: false
    },

    // comments
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