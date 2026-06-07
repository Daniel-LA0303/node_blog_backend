import Post from '../models/Post.js';
import User from '../models/User.js';
import Categories from '../models/Categories.js';
import { fileURLToPath } from "url";
import path from "path"
// import fs from "fs"
import fs from "fs-extra"
import { deleteImage, uploadImage, uploadImagePost } from '../config/cloudinary';
import Reply from '../models/Replies.js';
import postsServices from '../services/postsServices';
import { ApiResponse } from '../utils/ApiResponse';
import { log } from 'console';

// -- Upload image post start --//
const uploadImagePostController = async (req: any, res: any) => {
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
const registerPost = async (req: any, res: any, next: any) => {
  try {
    // 1. extract info 
    const { user, title, content, categories, desc, date, linkImage } = req.body;

    // 2. call service
    const newPost = await postsServices.saveNewPostService(user, {
      title,
      user,
      content,
      categories,
      desc,
      date,
      linkImage,
    });

    // 3. assamble success response
    res.status(201).json(
      new ApiResponse(
        201,
        "/api" + req.path,
        req.method,
        "Post created successfully",
        newPost,
        false
      )
    );

  } catch (error) {
    // if there is a error, we catch with our middleware
    next(error);
  }
};

//get one post
const getOnePost = async (req: any, res: any, next: any) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "commenstOnPost",
      populate: {
        path: "comments",
        populate: {
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
    res.json({ msg: 'This post does not exist' });
    next();
  }
}

//update a post
const updatePost = async (req: any, res: any, next: any) => {
  try {

    // 1. get service
    await postsServices.updatePostService(req.params.id, req.body);

    // 2. assamble success response
    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Post updated successfully",
        "Post updated",
        false
      )
    );
  } catch (error: any) {
    console.log(error);
    next(error);
    res.status(500).json({ error: 'Error', msg: error.message });
  }
}

//delete a post
const deletePost = async (req: any, res: any, next: any) => {
  //search info about


  // delete info from db
  try {

    await postsServices.deletePostService(req.params.postId, req.query.userId);

    res.status(201).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Post deleted successfully",
        null,
        false
      )
    );
  } catch (error) {
    next(error);
  }
}

//-- CRUD post end --//

// -- Dashboard action start --//
const getUserPost = async (req: any, res: any, next: any) => {
  const post = await Post.find({ user: req.params.id })
  res.json(post)
}

//-- Dashboard action end --//

//-- Search start --//


const searchByParam = async (req: any, res: any, next: any) => {
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
  } catch (error: any) {
    res.status(500).json({ error: 'Error to search', msg: error.message });
  }
}

const postsRecommend = async (req: any, res: any, next: any) => {

  try {
    // get post
    const { id } = req.params;
    const post = await Post.findOne({ id });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Extrait les catégories du post
    const { categories } = post;

    // Bchercher les posts qui ont des catégories en commun avec le post actuel
    const recommendedPosts = await Post.find({
      _id: { $ne: post._id }, // exclure le post actuel
      categoriesPost: { $in: categories }, // chercher les posts qui ont des catégories en commun avec le post actuel
    }).limit(5); // limite à 5 posts

    return res.json({ recommendedPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

//-- Search end --//

//-- Actions post start --//

const likePost = async (req: any, res: any, next: any) => {
  try {
    const postId = req.params.id;
    const { userId } = req.query;

    await postsServices.userLikePostService(postId, userId);

    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Like on post updated successfully",
        "Like success",
        false
      )
    );
  } catch (error) {
    next(error);
  }
};

// Dislike Post
const dislikePost = async (req: any, res: any, next: any) => {
  try {
    const postId = req.params.id;
    const { userId } = req.query;

    await postsServices.userDisikePostService(postId, userId);

    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Dislike on post updated successfully",
        "Dislike success",
        false
      )
    );
  } catch (error) {
    next(error);
  }
};

// Save Post
const savePost = async (req: any, res: any, next: any) => {
  try {
    const postId = req.params.id;
    const { userId } = req.query;

    await postsServices.userSavePostService(postId, userId);

    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Post saved successfully",
        "Save success",
        false
      )
    );
  } catch (error) {
    next(error);
  }
};

// Unsave Post
const unsavePost = async (req: any, res: any, next: any) => {
  try {
    const postId = req.params.id;
    const { userId } = req.query;

    await postsServices.userUnsavePostService(postId, userId);

    res.status(200).json(
      new ApiResponse(
        200,
        "/api" + req.path,
        req.method,
        "Post unsaved successfully",
        "Unsave success",
        false
      )
    );
  } catch (error) {
    next(error);
  }
};


//-- Actions post end --//


//-- Actions comment post start --//
const saveComment = async (
    req: any,
    res: any,
    next: any
) => {

    const post = await Post.findById(req.params.id);
    const userPost = await User.findById(req.body.userPost);

    try {

        // validate
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        if (!userPost) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // increase comments
        post.commenstOnPost.numberComments =
            post.commenstOnPost.numberComments + 1;

        // add new comment
        const newComments = [
            ...post.commenstOnPost.comments,
            req.body.data
        ];

        post.commenstOnPost.comments = newComments;

        // notification
        const Obj = {
            user: req.body.data.userID,
            notification: 'comment your Post:',
            type: 'comment',
            date: req.body.data.dateComment,
        };

        userPost.notifications.push(Obj);

        await post.save();
        await userPost.save();

        return res.json(Obj);

    } catch (error) {

        console.log(error);
        next();

    }
};

const deleteComment = async (
    req: any,
    res: any,
    next: any
) => {

    const post = await Post.findById(req.params.id);

    try {

        // validate post
        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        // decrease comments
        post.commenstOnPost.numberComments =
            post.commenstOnPost.numberComments - 1;

        // remove comment
        const newComments =
            post.commenstOnPost.comments.filter(
                (comment: any) =>
                    comment._id.toString() !== req.body.id
            );

        post.commenstOnPost.comments = newComments;

        await post.save();

        return res.json({
            message: 'Comment deleted'
        });

    } catch (error) {

        next(error);

    }

};

const editComment = async (req: any, res: any, next: any) => {

  //solution 2
  Post.findOneAndUpdate(
    { "_id": req.params.id, "commenstOnPost.comments._id": req.body._id },
    {
      "$set": {
        "commenstOnPost.comments.$": req.body
      }
    },
  )
}

//-- Actions comment post end --//

//-- Actions reply comment post start --//
const saveReplyComment = async (req: any, res: any, next: any) => {
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

const deleteReplyComment = async (req: any, res: any, next: any) => {
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
    comment.replies = comment.replies.filter(
      (reply) => reply._id.toString() !== idReply
    );

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

const editReplyComment = async (req: any, res: any, next: any) => {
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
    return res.json(post?.commenstOnPost.comments);
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
const filterPostByCategory = async (id: any) => {

  try {
    const category = await Categories.findOne({ name: id }); // aquí id = "Docker"
    if (!category) {
      return []; // o lanzar error si no existe la categoría
    }

    // 2. Filtrar posts que tengan esa categoría
    const filteredPosts = await Post.find({
      categories: { $in: [category._id] }
    })
      .select('title linkImage categories _id user likePost commenstOnPost date createdAt numberComments usersSavedPost')
      .populate({
        path: 'user',
        select: 'name _id profilePicture'
      })
      .populate({
        path: 'categories',
        select: '_id name value label color'
      });
    return filteredPosts;
  } catch (error) {
    // res.status(500).json({ error: 'Error to find posts' });
  }

}


const getPostsByCategoryPaginated = async (req: any, res: any, next: any) => {
  try {
  
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const categoryName = req.params.id;

    const result = await postsServices.getPostsByCategoryPaginatedService(page, limit, categoryName);

    res.status(200).json(
      new ApiResponse(
        200,
        "/api/categories" + req.path,
        req.method,
        "Success get posts by category paginated",
        result,
        false
      )
    );

  } catch (error) {
    console.error(error);
    next(error);
  }
};

//get all posts
const getAllPosts = async (req: any, res: any, next: any) => {

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
const getAllPostsCard = async (req: any, res: any, next: any) => {
  try {
    const posts = await Post.find({})
      .populate({
        path: 'user',
        select: 'name _id profilePicture'
      })
      .populate({
        path: 'categories',
        select: '_id name value label color'
      })
      .select('title linkImage categories _id user likePost commenstOnPost date comments usersSavedPost');

    return posts;
  } catch (error) {
    console.error("Error in getAllPostsCard:", error);
    throw new Error('Error finding posts');
  }
};

const getEditOnePost = async (id: any) => {
  try {
    const post = await Post.findById(id)
      .select('title desc content linkImage _id')
      .populate({
        path: 'categories',
        select: '_id name value label color desc follows'
      });
    return post;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Get Posts Page
 * @param {*} req 
 * @param {*} res 
 */
const getPostPaginated = async (req: any, res: any, next: any) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postsServices.getAllPostsPaginatedService(page, limit);

    // mapping response
    res.status(200).json(
      new ApiResponse(
        200,
        "/api/post" + req.path,
        req.method,
        "Success get posts paginated",
        result,
        false
      )
    );

  } catch (error: any) {
    console.log(error);
    next(error);
    res.status(500).json(new ApiResponse(500, "/api/page" + req.path, req.method, error.message, null, true));
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
  getPostPaginated,
  getPostsByCategoryPaginated
}