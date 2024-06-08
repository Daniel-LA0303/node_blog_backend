import Post from '../models/Post.js';
import User from '../models/User.js';
import Categories from '../models/Categories.js';
import { fileURLToPath } from "url";
import path from "path"
// import fs from "fs"
import fs from "fs-extra"
import { deleteImage, uploadImage, uploadImagePost } from '../config/cloudinary.js';
import { log } from 'console';

//Transactions
import mongoose from 'mongoose';

// -- Upload image post start --//
const uploadImagePostController = async (req, res) => {
    try {
        const result = await uploadImagePost(req.files.image.tempFilePath)
        res.json({
            public_id: result.public_id, //to delete the file
            secure_url: result.secure_url //to consume the file
        });
        await fs.unlink(req.files.image.tempFilePath)
    } catch (error) {
        console.log(error);
    }
}
// -- Upload image post end --//

//-- CRUD post start --//
//create a post
const registerPost = async (req, res) => {

    const user = await User.findById(req.body.user);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    try {
        const post = new Post(req.body);
        await post.save();

        user.numberPost = user.numberPost + 1;
        user.posts.push(post._id);
        await user.save();

        res.status(201).json({ msg: "Post created correctly"})
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error to create post" });
    }
}

//get all posts
const getAllPosts = async (req, res, next) =>{

    try {
        console.log("get all posts start");
        const post2 = await Post.find({})
        .populate({
          path: 'user',
          select: 'name _id profilePicture' // Especificar los campos del usuario que quieres incluir
        })
        .select('title linkImage categoriesPost _id user likePost commenstOnPost date') // Especificar los campos del post que quieres incluir
        res.status(200).json(post2);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to find posts' });
        next();
    }
}

/**
 * Get all posts in card format
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getAllPostsCard = async (req, res, next) =>{
  try {
      try {
        const post2 = await Post.find({})
        .populate({
          path: 'user',
          select: 'name _id profilePicture' 
        })
        .select('title linkImage categoriesPost _id user likePost commenstOnPost date') 
        return post2;
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to find posts' });
        next();
    }


  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error to find posts' });
      next();
  }
}

//get one post
const getOnePost = async (req, res, next) =>{
    try {
        const post = await Post.findById(req.params.id).populate({
            path: "commenstOnPost",
            populate:{
                path: "comments",
                populate:{
                    path: "userID"
                }
            },
        }).
        populate({
            path: "commenstOnPost.comments",
            populate: {
              path: "replies.userID",
            },
          }).populate('user')


        if(!post){
            return res.status(404).json({msg: 'This post does not exist'})
        }

        res.status(200).json(post);    
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to find post' });
    }
}

//update a post
const updatePost = async(req, res, next) => {
    try {
        if(req.body.previousName){
            if((req.body.previousName !== "")){
                await deleteImage(req.body.previousName) 
            }
        }
        const post = await Post.findByIdAndUpdate(
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

        if(!post){
            return res.status(404).json({msg: 'This post does not exist'})
        }

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to update post' });
    }
}

//delete a post
const deletePost = async (req, res, next) =>{
    //search info about
    const post = await Post.findById(req.params.id)
    const user = await User.findById(post.user)

    if(!post){
        return res.status(404).json({msg: 'This post does not exist'})
    }

    if(!user){
        return res.status(404).json({msg: 'This user does not exist'})
    }

    if(post.linkImage !== ''){
        await deleteImage(post.linkImage.public_id) 
    }

    // delete info from db
    try {
        user.numberPost = user.numberPost - 1;
        await user.save();
        await Post.findByIdAndDelete({_id: req.params.id});
        res.status(200).json({msg: 'Post deleted correctly'})
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to delete post' });
        next();
    }
}

//-- CRUD post end --//

// -- Dashboard action start --//
const getUserPost = async (req, res, next) =>{
    const post = await Post.find({user:req.params.id})

    if(!post){
        return res.status(404).json({msg: 'This user does not have posts'})
    }

    res.status(200).json(post);
}

//-- Dashboard action end --//

//-- Search start --//

/**
 * Filter post by category
 * @param {*} id 
 * @returns 
 */
const filterPostByCategory = async (id) =>{
    try {
        const filteredPosts = await Post.find({
            categoriesPost: { $elemMatch: { $eq: id} }
          }).populate({
            path: 'user',
            select: 'name _id profilePicture' // Especificar los campos del usuario que quieres incluir
          })
          .select('title linkImage categoriesPost _id user likePost commenstOnPost date')

        // if(!filteredPosts){
        //     return 'This category does not have posts'
        // }
        return filteredPosts;
      } catch (error) {
        // res.status(500).json({ error: 'Error to find posts' });
      }

}

const searchByParam = async (req, res, next) =>{
    try {
        const [posts, users, categories] = await Promise.all([
          Post.find({ title: { $regex: req.params.id, $options: 'i' } }).populate('user'),
          User.find({ $or: [{ name: { $regex: req.params.id, $options: 'i' } }, { email: { $regex: req.params.id, $options: 'i' } }] }), 
          Categories.find({ name: { $regex: req.params.id, $options: 'i' } }) 
        ]);
        
        const searchResults = {
          posts,
          users,
          categories 
        };
    
        res.status(200).json(searchResults);
        console.log(posts);
      } catch (error) {
        res.status(500).json({ error: 'Error to search' });
      }
}

const postsRecommend = async (req, res, next) =>{

    try {
        // get post
        const { id } = req.params;
        const post = await Post.findOne({ id });
    
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
    
        // Extrait les catégories du post
        const { categoriesPost } = post;
    
        // Bchercher les posts qui ont des catégories en commun avec le post actuel
        const recommendedPosts = await Post.find({
          _id: { $ne: post._id }, // exclure le post actuel
          categoriesPost: { $in: categoriesPost }, // chercher les posts qui ont des catégories en commun avec le post actuel
        }).limit(5); // limite à 5 posts
    
        return res.status(200).json(recommendedPosts);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
}

//-- Search end --//

//-- Actions post start --//

const likePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body.userP; // ID del usuario
    const userAutor = req.body.userAutor; // ID del usuario

    const userAutorDocument = await User.findById(userAutor);
    const existingNotificationAutor = userAutorDocument.notifications.find((notification) => (
      notification.type === 'like' && String(notification.idPost) === postId
    ));

    if (!existingNotificationAutor && userAutor !== userId) {
      const Obj = {
        user: req.body.data.userID,
        notification: 'like your Post',
        type: 'like',
        date: req.body.data.dateLike,
        idPost: req.params.id
      }
      await User.findByIdAndUpdate(
        userAutor,
        {
          $push: { notifications: Obj },
        },
        { new: true }
      );
    }

    console.log(userAutor, userId);
    await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { 'likePost.users': userId },
      },
      { new: true }
    );
    
    await User.findByIdAndUpdate(
      userId,
      {
        $push: { notifications: Obj },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Like on post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const dislikePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { 'likePost.users': userId },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { 'likePost.posts': postId },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Unlike on post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


// const savePost = async (req, res, next) =>{

//     const post = await Post.findById(req.params.id)
//     const user = await User.findById(req.body._id)

//     const postFound = user.postsSaved.posts.includes(post._id);
//     const userFound = post.usersSavedPost.users.includes(user._id);
//     if(postFound && userFound){

//         const arrayP = user.postsSaved.posts;
//         const indexPost = arrayP.indexOf(post._id)
//         arrayP.splice(indexPost, 1)        
//         user.postsSaved.posts = arrayP;
        
//         const arrayU = post.usersSavedPost.users;
//         const indexUser = arrayU.indexOf(user._id);
//         arrayU.splice(indexUser, 1);
//         post.usersSavedPost.users = arrayU;

//         await post.save();
//         await user.save();

//     }else{

//         const newPostOnUser = [...user.postsSaved.posts, post._id];
//         user.postsSaved.posts = newPostOnUser;

//         const newUserOnPost = [...post.usersSavedPost.users, user._id]
//         post.usersSavedPost.users = newUserOnPost;

//         await post.save();
//         await user.save();
//     }
// }

const savePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { 'postsSaved.posts': postId },
      },
      { new: true }
    );

    await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { 'usersSavedPost.users': userId },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Post saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unsavePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { 'postsSaved.posts': postId },
      },
      { new: true }
    );

    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { 'usersSavedPost.users': userId },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Post unsaved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


//-- Actions post end --//


//-- Actions comment post start --//
const saveComment = async (req, res, next) =>{

    const post = await Post.findById(req.params.id)
    const userPost = await User.findById(req.body.userPost)

    if(!post){
        return res.status(404).json({msg: 'This post does not exist'})
    }

    if(!userPost){
        return res.status(404).json({msg: 'This user does not exist'})
    }
    
    
    try {
        post.commenstOnPost.numberComments = post.commenstOnPost.numberComments +1;
        const newComments = [...post.commenstOnPost.comments, req.body.data]
        post.commenstOnPost.comments = newComments;

        let Obj = {};
        console.log(req.body.data.userID, req.body.userPost);
        if(req.body.data.userID !== req.body.userPost){
          Obj = {
            user: req.body.data.userID,
            notification: 'comment your Post',
            type: 'comment',
            date: req.body.data.dateComment,
            idPost: req.params.id
          }
          userPost.notifications.push(Obj);
          await userPost.save();
        }

        await post.save();


        return res.status(200).json(Obj);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error to save comment' });
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

//-- Actions comment post end --//

//-- Actions reply comment post start --//
const saveReplyComment = async (req, res, next) =>{
    const postId = req.params.id; 
    const { userID, commentId, reply, dateReply, commentAutor } = req.body; 
  
    try {
      //search by post id
      const post = await Post.findById(postId).populate('commenstOnPost.comments');;
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // serch the comment by id 
      const comment = post.commenstOnPost.comments.find((c) => c._id.toString() === commentId);
  
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      const newReply = {
        userID: userID,
        reply: reply,
        dateReply: dateReply,
      };

      comment.replies.push(newReply);
      
      if (userID !== commentAutor) {

        const Obj = {
          user: userID,
          notification: 'reply your Comment',
          type: 'reply',
          date: dateReply,
          idPost: postId,
        };
  
        await User.findByIdAndUpdate(
          commentAutor,
          {
            $push: { notifications: Obj },
          },
          { new: true }
        );
      }

      //save the post
      await post.save();

      await post.populate({
        path: "commenstOnPost.comments",
        populate: {
          path: "replies.userID",
        },
      })

      return res.status(200).json(post.commenstOnPost.comments);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: 'Server error' });
    }
}

const deleteReplyComment = async (req, res, next) =>{
    const { idReply, idComment } = req.body;

  try {
    // first find the post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not find" });
    }

    // find the comment
    const comment = post.commenstOnPost.comments.find(
      (comment) => comment._id.toString() === idComment
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not find" });
    }

    // we utilize pull to remove the reply
    comment.replies.pull({ _id: idReply });

    // save the post
    await post.save();

    await post.populate({
        path: "commenstOnPost.comments",
        populate: {
          path: "replies.userID",
        },
      })
      return res.status(200).json(post.commenstOnPost.comments); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in server" });
  }

}

const editReplyComment = async (req, res, next) =>{
    const { idReply, idComment, newContentReply } = req.body;

    try {
        
       await Post.findOneAndUpdate(
            { 
              "_id": req.params.id, 
              "commenstOnPost.comments._id": idComment, 
              "commenstOnPost.comments.replies._id": idReply 
            },
            {
              "$set": {
                "commenstOnPost.comments.$[comment].replies.$[reply].reply": newContentReply
              }
            },
            {
              arrayFilters: [
                { "comment._id": idComment },
                { "reply._id": idReply }
              ],
              new: true 
            },)

            const post = await Post.findById(req.params.id).populate({
                path: "commenstOnPost.comments",
                populate: {
                  path: "replies.userID",
                },
            });
            return res.status(200).json(post.commenstOnPost.comments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error in server" });
    }


}

//-- Actions reply comment post end --//

export {
    //-- Upload image post start --//
    uploadImagePostController,
    //-- Upload image post end --//

    //-- CRUD post start --//
    registerPost,
    getAllPosts,
    getAllPostsCard,
    getOnePost,
    updatePost,
    deletePost,
    //-- CRUD post end --//

    //-- Dashboard action start --//
    getUserPost,
    //-- Dashboard action end --//

    // -- Search start --//
    filterPostByCategory,
    searchByParam,
    postsRecommend,
    // -- Search end --//

    //-- Actions post start --//
    likePost,
    dislikePost,
    savePost,
    unsavePost,
    //-- Actions post end --//
    
    //-- Actions comment post start --//
    saveComment,
    deleteComment,
    editComment,
    // -- Actions comment post end --//

    //-- Actions reply comment post start --//
    saveReplyComment,
    deleteReplyComment,
    editReplyComment,
    //-- Actions reply comment post end --//
}