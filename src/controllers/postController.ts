import Post from '../models/Post.js';
import User from '../models/User.js';
import Categories from '../models/Categories.js';
import fs from "fs-extra"
import { uploadImagePost } from '../config/cloudinary';
import postsServices from '../services/postsServices';
import { ApiResponse } from '../utils/ApiResponse';


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
const registerPostController = async (req: any, res: any, next: any) => {
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
const getOnePostController = async (req: any, res: any, next: any) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'PUBLISHED' }).populate({
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
const updatePostController = async (req: any, res: any, next: any) => {
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
const deletePostController = async (req: any, res: any, next: any) => {
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

//-- Search start --//
const searchByParamController = async (req: any, res: any, next: any) => {
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


//-- Search end --//

//-- Actions post start --//

// like post
const likePostController = async (req: any, res: any, next: any) => {
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

// dislike Post
const dislikePostController = async (req: any, res: any, next: any) => {
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

// save post
const savePostController = async (req: any, res: any, next: any) => {
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

// unsave post
const unsavePostController = async (req: any, res: any, next: any) => {
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



/**
 * Pages Start
 */

//
const filterPostByCategoryController = async (id: any) => {

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

// get post by category name
const getPostsByCategoryPaginatedController = async (req: any, res: any, next: any) => {
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

// post paginated in home
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

const changePostStatusController = async (
  req: any, 
  res: any, 
  next: any
) => {
  try {

    const {postId, status, reason} = req.body;
    const userR = req.user;
    await postsServices.changeStatusInPostService(postId, status, userR, req, reason);

    // mapping response
    res.status(200).json(
      new ApiResponse(
        200,
        "/api/post" + req.path,
        req.method,
        "Change status successfully.",
        "Change status successfully.",
        false
      )
    );

  } catch (error: any) {
    next(error);
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
  registerPostController,
  getOnePostController,
  updatePostController,
  deletePostController,
  //-- CRUD post end --//

  // -- Search start --//
  filterPostByCategoryController,
  searchByParamController,
  // -- Search end --//

  //-- Actions post start --//
  likePostController,
  dislikePostController,
  savePostController,
  unsavePostController,
  //-- Actions post end --//
  getPostPaginated,
  getPostsByCategoryPaginatedController,
  changePostStatusController
}