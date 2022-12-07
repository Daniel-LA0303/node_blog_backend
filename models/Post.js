const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
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

module.exports = mongoose.model('Post', postSchema);