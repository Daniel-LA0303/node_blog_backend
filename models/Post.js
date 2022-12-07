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
    }
},
    {timestamps: true}
);

const Post = mongoose.model('Post', postSchema);

export default Post;