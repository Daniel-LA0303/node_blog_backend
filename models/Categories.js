import mongoose from "mongoose";

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
    }
},
    {timestamps: true}
);

const Categories = mongoose.model("Categories", CategoriesSchema);

export default Categories;