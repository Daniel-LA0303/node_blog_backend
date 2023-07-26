import Post from '../models/Post.js';
import User from '../models/User.js'
import { fileURLToPath } from "url";
import path from "path"
// import fs from "fs"
import fs from "fs-extra"
import { deleteImage, uploadImage, uploadImagePost } from '../config/cloudinary.js';

//registra un user
const registerPost = async (req, res) => {

    const user = await User.findById(req.body.user);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    // //evitar email o usuarios duplicados
    try {


        const post = new Post(req.body);
        await post.save();

        user.numberPost = user.numberPost + 1;
        user.posts.push(post._id);
        await user.save();

        res.json({ msg: "Post created correctly"})
    } catch (error) {
        console.log(error);
    }
}

const uploadImagePostController = async (req, res) => {
    // console.log(req.files);
    try {
        const result = await uploadImagePost(req.files.image.tempFilePath)
        res.json({
            public_id: result.public_id, //para eliminar el archivo cuando se requiera
            secure_url: result.secure_url //para consultar el archivo
        });
        await fs.unlink(req.files.image.tempFilePath)
    } catch (error) {
        console.log(error);
    }
    

}


const getAllPosts = async (req, res, next) =>{
    try {
        const post = await Post.find({}).populate('user')
        res.json(post);
    } catch (error) {
        console.log(error);
        next();
    }
}

const getOnePost = async (req, res, next) =>{

    try {
        const post = await Post.findById(req.params.id).populate({
            path: "commenstOnPost",
            populate:{
                path: "comments",
                populate:{
                    path: "userID"
                }
            }
        }).populate('user')

        res.json(post);    
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
    }
}

//update a post
const updatePost = async(req, res, next) => {
    const{id} = req.params;
    console.log(id);
    console.log(req.body);
    // console.log(req.files);

    try {
        // const post = await Post.findById(id)
        if(req.body.previousName){
            if((req.body.previousName !== "")){
                await deleteImage(req.body.previousName) 
            }
        }

        await Post.findByIdAndUpdate(
            {_id: req.params.id},{
                title: req.body.title,
                desc: req.body.desc,
                content: req.body.content,
                linkImage: req.body.linkImage,
                categoriesPost: req.body.categoriesPost,
                categoriesSelect: req.body.categoriesSelect,
            },
            {new: true}
        )
        res.json({msg: 'Post has been edited'});
    } catch (error) {
        console.log(error);
    }
}

const deletePost = async (req, res, next) =>{
    
    //search info about
    const post = await Post.findById(req.params.id)
    const user = await User.findById(post.user)

    if(post.linkImage !== ''){
        await deleteImage(post.linkImage.public_id) 
    }

    // delete info from db
    try {
        user.numberPost = user.numberPost - 1;
        await user.save();

        await Post.findByIdAndDelete({_id: req.params.id});
        res.json({msg: 'The post has been eliminated'})
    } catch (error) {
        console.log(error);
        next();
    }
}

const likePost = async (req, res, next) =>{
    
    //search info about
    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.body._id)

    const userFound = post.likePost.users.includes(user._id);
    const postFound = user.likePost.posts.includes(post._id);


    if(userFound && postFound){
        const arrayP = post.likePost.users;
        const indexP = arrayP.indexOf(user._id);
        arrayP.splice(indexP, 1);
        post.likePost.users = arrayP;

        const arrayU = user.likePost.posts;
        const indexU = arrayU.indexOf(post._id);
        arrayU.splice(indexU, 1);
        user.likePost.post = arrayU;

        await post.save();
        await user.save();
    }else{
        const newLikeOnPost = [...post.likePost.users, user._id]
        post.likePost.users = newLikeOnPost;

        const newLikeOnUser = [...user.likePost.posts, post._id]
        user.likePost.posts = newLikeOnUser;

        await post.save();
        await user.save();
    }
}

const savePost = async (req, res, next) =>{

    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.body._id)

    const postFound = user.postsSaved.posts.includes(post._id);
    const userFound = post.usersSavedPost.users.includes(user._id);
    if(postFound && userFound){

        const arrayP = user.postsSaved.posts;
        const indexPost = arrayP.indexOf(post._id)
        arrayP.splice(indexPost, 1)        
        user.postsSaved.posts = arrayP;
        
        const arrayU = post.usersSavedPost.users;
        const indexUser = arrayU.indexOf(user._id);
        arrayU.splice(indexUser, 1);
        post.usersSavedPost.users = arrayU;

        await post.save();
        await user.save();

    }else{

        const newPostOnUser = [...user.postsSaved.posts, post._id];
        user.postsSaved.posts = newPostOnUser;


        const newUserOnPost = [...post.usersSavedPost.users, user._id]
        post.usersSavedPost.users = newUserOnPost;
  

        await post.save();
        await user.save();
    }
}


const saveComment = async (req, res, next) =>{

    const post = await Post.findById(req.params.id)

    try {
        post.commenstOnPost.numberComments = post.commenstOnPost.numberComments +1;
        const newComments = [...post.commenstOnPost.comments, req.body]


        post.commenstOnPost.comments = newComments;
        await post.save();
    } catch (error) {
        console.log(error);
        next();
    }
}

const deleteComment = async (req, res, next) =>{
    const post = await Post.findById(req.params.id)



    try {
        post.commenstOnPost.numberComments = post.commenstOnPost.numberComments -1;
        const newComments = post.commenstOnPost.comments.filter(comment => comment._id != req.body.id)
        post.commenstOnPost.comments = newComments;
        await post.save();
    } catch (error) {
        
    }
    
} 

const editComment = async (req, res, next) =>{


    //solution 2
    Post.findOneAndUpdate(
        {"_id" : req.params.id, "commenstOnPost.comments._id" : req.body._id},
        {
            "$set" : {
                "commenstOnPost.comments.$": req.body
            }
        },
        function(error, doc){}
        
    )
} 

const getUserPost = async (req, res, next) =>{
    console.log(req.params.id);
    const post = await Post.find({user:req.params.id})
    res.json(post)
}



export {
    registerPost,
    uploadImagePostController,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost,
    likePost,
    savePost,
    saveComment,
    deleteComment,
    editComment,
    getUserPost
}