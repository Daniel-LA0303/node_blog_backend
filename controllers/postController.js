import Post from '../models/Post.js';
import User from '../models/User.js';
import Categories from '../models/Categories.js';
import { fileURLToPath } from "url";
import path from "path"
// import fs from "fs"
import fs from "fs-extra"
import { deleteImage, uploadImage, uploadImagePost } from '../config/cloudinary.js';
import Reply from '../models/Replies.js';

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
    try {
        const user = await User.findById(req.body.user);
        if (!user) {
            return res.status(404).json({ error: "User not found", msg: "Error User not found"});
        }

        const postSearch = await Post.findOne({ title: req.body.title });
        if (postSearch) {
            return res.status(400).json({ error: "Post already exists", msg: "Error Post whith this title already exists"});
        }

        const post = new Post(req.body);
        await post.save();

        user.numberPost = user.numberPost + 1;
        user.posts.push(post._id);
        await user.save();

        res.status(201).json({ msg: "Post created correctly"})
    } catch (error) {
        console.error("Error in registerPost:", error);
        res.status(400).json({ error: 'Error', msg: error.message });
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
        .select('title desc content linkImage categoriesPost categoriesSelect usersSavedPost _id user likePost commenstOnPost date')

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
        // throw new Error("Simulated error in getUserPosts");
        const post1 = await Post.findById(req.params.id)
        .select('user');

        if (post1.user.toString() !== req.query.user) {
            return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
        }
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
        res.status(201).json({msg: 'Post has been edited'});
    } catch (error) {
        res.status(500).json({ error: 'Error', msg: error.message});
    }
}

//delete a post
const deletePost = async (req, res, next) =>{
    //search info about


    // delete info from db
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(post.user)
        const post1 = await Post.findById(req.params.id)
        .select('user');
    
        // throw new Error("Simulated error in getUserPosts");
        if (post1.user.toString() !== req.query.user) {
          return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
      }
    
        if(post.linkImage !== ''){
            await deleteImage(post.linkImage.public_id) 
        }
        user.numberPost = user.numberPost - 1;
        // Remove the post from the user's posts array
        user.posts = user.posts.filter(postId => postId.toString() !== req.params.id);
        await user.save();
        await post.remove();
        res.status(200).json({msg: 'The post has been eliminated'})
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message});
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


const searchByParam = async (req, res, next) =>{
    try {

        // throw new Error("Simulated error in getUserPosts");
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
    
        res.json(searchResults);
        console.log(posts);
      } catch (error) {
        res.status(500).json({ error: 'Error to search',  msg: error.message });
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

const likePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario
    
    // throw new Error("Simulated error in getUserPosts");

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
        $addToSet: { 'likePost.posts': postId },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Like on post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', msg: error.message });
  }
};

const dislikePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    // throw new Error("Simulated error in getUserPosts");

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
    res.status(500).json({ error: 'Internal server error', msg: error.message });
  }
};

const savePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    // throw new Error("Simulated error in getUserPosts");

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
    res.status(500).json({ error: 'Internal server error', msg: error.message });
  }
};

const unsavePost = async (req, res) => {
  try {
    const postId = req.params.id; // ID del post
    const userId = req.body._id; // ID del usuario

    // throw new Error("Simulated error in getUserPosts");

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
    res.status(500).json({ error: 'Internal server error', msg: error.message });
  }
};


//-- Actions post end --//


//-- Actions comment post start --//
const saveComment = async (req, res, next) =>{

    const post = await Post.findById(req.params.id)
    const userPost = await User.findById(req.body.userPost)
    
    try {
        post.commenstOnPost.numberComments = post.commenstOnPost.numberComments +1;
        const newComments = [...post.commenstOnPost.comments, req.body.data]
        post.commenstOnPost.comments = newComments;

        const Obj = {
          user: req.body.data.userID,
          notification: 'comment your Post:',
          type: 'comment',
          date: req.body.data.dateComment,
        }
        userPost.notifications.push(Obj);

        await post.save();
        await userPost.save();

        return res.json(Obj);
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

/**
 * Pages Start
 */

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

//get all posts
const getAllPosts = async (req, res, next) =>{

  try {
      const post2 = await Post.find({})
      .populate({
        path: 'user',
        select: 'name _id profilePicture' // Especificar los campos del usuario que quieres incluir
      })
      .select('title linkImage categoriesPost _id user likePost commenstOnPost date') // Especificar los campos del post que quieres incluir
      res.status(200).json(post2);
  } catch (error) {
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
    const post2 = await Post.find({})
        .populate({
            path: 'user',
            select: 'name _id profilePicture' 
        })
        .select('title linkImage categoriesPost _id user likePost commenstOnPost date comments');
    return post2;
  } catch (error) {
      console.error("Error in getAllPostsCard:", error);
      throw new Error('Error to find posts');
  }
}

const getEditOnePost = async (id) =>{
  try {
    const post = await Post.findById(id)
      .select('title desc content linkImage categoriesPost categoriesSelect _id');
      return post;
  } catch (error) {
    console.log(error);
  }
}

const getViewPost = async (id) => {
  try {
      const post = await Post.findById(id)
          .select('categoriesPost categoriesSelect content date desc likePost linkImage title usersSavedPost createdAt')
          .populate({
              path: 'user',
              select: 'name email followedUsers followersUsers profilePicture'
          });
      
      return post;
  } catch (error) {
      console.error("Error en getViewPost:", error);
      throw error; // Lanza el error para que sea capturado por el try-catch en getViewPostPage
  }
}
/**
 * Pages End
 */


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
    getAllPostsCard,
    getEditOnePost,
    getViewPost
}