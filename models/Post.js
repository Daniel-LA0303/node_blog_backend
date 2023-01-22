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
        type: String,
        required: false
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
        reactions:{
            type: Number,
            default: 0
        },
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
        }]
    },
    usersSavedPost:{
        numberUsersSavedPost:{
            type: Number,
            default: 0
        },
        users:[{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    }
},
    {timestamps: true}
);

const Post = mongoose.model('Post', postSchema);

export default Post;