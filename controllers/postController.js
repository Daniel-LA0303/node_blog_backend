import Post from '../models/Post.js';
import User from '../models/User.js';
import Categories from '../models/Categories.js';
import { fileURLToPath } from "url";
import path from "path"
// import fs from "fs"
import fs from "fs-extra"
import { deleteImage, uploadImage, uploadImagePost } from '../config/cloudinary.js';


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

        res.json({ msg: "Post created correctly"})
    } catch (error) {
        console.log(error);
    }
}

//get all posts
const getAllPosts = async (req, res, next) =>{
    try {
        const post = await Post.find({}).populate('user')
        res.json(post);
    } catch (error) {
        console.log(error);
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

        res.json(post);    
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
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

//delete a post
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

//-- CRUD post end --//

// -- Dashboard action start --//
const getUserPost = async (req, res, next) =>{
    console.log(req.params.id);
    const post = await Post.find({user:req.params.id})
    res.json(post)
}

//-- Dashboard action end --//

//-- Search start --//
const filterPostByCategory = async (req, res, next) =>{
    try {
        const filteredPosts = await Post.find({
            categoriesPost: { $elemMatch: { $eq: req.params.id} }
          });
        res.json(filteredPosts);
      } catch (error) {
        res.status(500).json({ error: 'Error to find posts' });
      }

}

const searchByParam = async (req, res, next) =>{
    try {
        const [posts, users, categories] = await Promise.all([
          Post.find({ title: { $regex: req.params.id, $options: 'i' } }),
          User.find({ $or: [{ name: { $regex: req.params.id, $options: 'i' } }, { email: { $regex: req.params.id, $options: 'i' } }] }), 
          Categories.find({ name: { $regex: req.params.id, $options: 'i' } }) 
        ]);
    
        const searchResults = {
          posts,
          users,
          categories 
        };
    
        res.json(searchResults);
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
    
        return res.json({ recommendedPosts });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
}

//-- Search end --//

//-- Actions post start --//
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
//-- Actions post end --//


//-- Actions comment post start --//
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

//-- Actions comment post end --//

//-- Actions reply comment post start --//
const saveReplyComment = async (req, res, next) =>{
    const postId = req.params.id; 
    const { userID, commentId, reply, dateReply } = req.body; 
  
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
  
      // we create the new reply
      const newReply = {
        userID: userID,
        reply: reply,
        dateReply: dateReply
      };
  
      // add the new reply to the comment
      comment.replies.push(newReply);
  
      //save the post
      await post.save();

      await post.populate({
        path: "commenstOnPost.comments",
        populate: {
          path: "replies.userID",
        },
      })

  return res.json(post.commenstOnPost.comments);
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
      return res.json(post.commenstOnPost.comments); 
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
            return res.json(post.commenstOnPost.comments);
    } catch (error) {
        console.log(error);
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
    savePost,
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