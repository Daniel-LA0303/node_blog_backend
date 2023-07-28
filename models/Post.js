import mongoose from "mongoose";
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
    }
},
    {timestamps: true}
);

const Post = mongoose.model('Post', postSchema);

export default Post;