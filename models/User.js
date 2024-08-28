import bcrypt from "bcrypt";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

//modelo de usuarios
const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String,
    },
    confirm: {
        type: Boolean,
        default: false
    },
    profilePicture:{
        secure_url: {
            type: String,
            default: ''
        },
        public_id: {
            type: String,
            default: ''
        },
        // required: false
    },
    numberPost:{
        type: Number,
        default:0
    },
    info: {
        type: Object,
        default: {}
    },
    likePost: {
        reactions:{
            type: Number,
            default: 0
        },
        posts:[{
            type: Schema.ObjectId,
            ref: 'Post'
        }]
    },
    postsSaved:{
        saved:{
            type: Number,
            default: 0
        },
        posts:[{
            type: Schema.ObjectId,
            ref: 'Post'
        }]
    },
    followsTags:{
        countTags:{
            type: Number,
            default: 0
        },
        tags:[{
            type: Schema.ObjectId,
            ref: 'Categories'
        }]
    },
    followersUsers:{
        conutFollowers:{
            type: Number,
            default: 0
        },
        followers:[{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },
    followedUsers:{
        conutFollowed:{
            type: Number,
            default: 0
        },
        followed:[{
            type: Schema.ObjectId,
            ref: 'User'
        }]
    },
    posts:[{
        type: Schema.ObjectId,
        ref: 'Post'
    }],
    notifications:[{
        user:{
            type: Schema.ObjectId,
            ref: 'User'
        },
        notification: {
            type: String,
        },
        type:{
            type: String,
        },
        date:{
            type: Date,
        }

    }],
}, {
    timestamps: true
});

// hasheo of passwords
usersSchema.pre("save", async function(next){
    if(!this.isModified('password')){ 
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
 
//confirm password
usersSchema.methods.checkPassword = async function(passwordForm){
    return await bcrypt.compare(passwordForm, this.password)
}

const User = mongoose.model('User', usersSchema);

export default User;