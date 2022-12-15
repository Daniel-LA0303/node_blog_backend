import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CategoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true,
        unique: true
    }, 
    value:{
        type: String,
        required : true,
        unique: true
    },
    label : {
        type: String,
        required : true,
        unique: true
    },
    color:{
        type: String
    },
    desc: {
        type: String
    },
    follows:{
        countFollows:{
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

const Categories = mongoose.model("Categories", CategoriesSchema);

export default Categories;