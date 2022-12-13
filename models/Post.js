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
        users : []
    },
    saved:{
        type: Number,
        default: 0
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
            }
        }]
    }
},
    {timestamps: true}
);

const Post = mongoose.model('Post', postSchema);

export default Post;