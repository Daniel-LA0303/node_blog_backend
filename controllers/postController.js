import Post from '../models/Post.js';
import User from '../models/User.js'
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs"

//registra un user
const registerPost = async (req, res) => {

    // console.log(req.body.user);
    const user = await User.findById(req.body.user)
    // if(user){
    //     console.log(user);
    // }
    // //evitar email o usuarios duplicados
    try {
        user.numberPost = user.numberPost + 1;
        await user.save();

        const post = new Post(req.body);
        await post.save();

        res.json({ msg: "Post creado correctamente."})
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

    console.log(req.params);
    console.log(req.body);
    
    let post = req.body;
    try {
        if(req.body.previousName){
            if((req.body.previousName !== "")){
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                fs.unlinkSync(__dirname+`/../uploads-post/${req.body.previousName}`);
                console.log('archivo eliminado');
            }
        }
        let post = await Post.findByIdAndUpdate(
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
    //first delete the image
    console.log(post.user);
    console.log(user);

    if(post.linkImage !== ''){
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            fs.unlinkSync(__dirname+`/../uploads-post/${post.linkImage}`);
            console.log('archivo eliminado');
        } catch (error) {
            console.log(error);
        }
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
    const user = await User.findById(post.user)

    // console.log(req.body._id);
    // console.log(post.likePost.users);

    //search user
    const userFound = post.likePost.users.includes(req.body._id)

    try {

        if(userFound){
            const newLikes = post.likePost.users.filter(user => user !== req.body._id);
            post.likePost.users = newLikes
            post.likePost.reactions = post.likePost.reactions -1;
            await post.save();
        }else{
            const newPost = [...post.likePost.users, req.body._id]
            post.likePost.users = newPost
            post.likePost.reactions = post.likePost.reactions +1;
            await post.save();
        }
        // await Post.findByIdAndDelete({_id: req.params.id});
    } catch (error) {
        console.log(error);
        next();
    }
}

const savePost = async (req, res, next) =>{
    
    console.log(req.params.id); //post id
    console.log(req.body._id); //user id

    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.body._id)

    const postFound = user.postsSaved.posts.includes(post._id);
    const userFound = post.usersSavedPost.users.includes(user._id);
    if(postFound && userFound){

        const arrayP = user.postsSaved.posts;
        const indexPost = arrayP.indexOf(post._id)
        arrayP.splice(indexPost, 1)        
        user.postsSaved.posts = arrayP;
        // user.postsSaved.saved = user.postsSaved.saved -1
        
        const arrayU = post.usersSavedPost.users;
        const indexUser = arrayU.indexOf(user._id);
        arrayU.splice(indexUser, 1);
        post.usersSavedPost.users = arrayU;
        // post.usersSavedPost.numberUsersSavedPost = post.usersSavedPost.numberUsersSavedPost -1

        await post.save();
        await user.save();
        console.log('encontradi');
    }else{
        console.log('no encontrado');
        const newPostOnUser = [...user.postsSaved.posts, post._id];
        console.log('array user on post', newPostOnUser);
        user.postsSaved.posts = newPostOnUser;
        // user.postsSaved.saved = user.postsSaved.saved +1

        const newUserOnPost = [...post.usersSavedPost.users, user._id]
        console.log('array post on user', newUserOnPost);
        post.usersSavedPost.users = newUserOnPost;
        // post.usersSavedPost.numberUsersSavedPost = post.usersSavedPost.numberUsersSavedPost + 1

        await post.save();
        await user.save();
    }
}

const saveComment = async (req, res, next) =>{
    console.log(req.params.id);
    // console.log(req.body);
    const {user, comment} = req.body
    const post = await Post.findById(req.params.id)
    // console.log(post)
    console.log(user, comment);
    try {
        post.commenstOnPost.numberComments = post.commenstOnPost.numberComments +1;
        const newComments = [...post.commenstOnPost.comments, req.body]

        // post.commenstOnPost.comments.user = user;
        post.commenstOnPost.comments = newComments;
        await post.save();
        // await Post.findByIdAndDelete({_id: req.params.id});
    } catch (error) {
        console.log(error);
        next();
    }
}


export {
    registerPost,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost,
    likePost,
    savePost,
    saveComment
}