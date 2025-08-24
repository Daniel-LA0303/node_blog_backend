import { deleteImage } from "../config/cloudinary.js";
import Comment from "../models/Comments.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { ServiceException } from "../utils/exception/ServiceException.js";


// save new post
const saveNewPostService = async (userId, postData) => {

  // 1. search user
  const user = await User.findById(userId);
  if (!user) {
    throw new ServiceException("User not found", 404);
  }

  // 2. valid if title exists
  const postSearch = await Post.findOne({ title: postData.title });
  if (postSearch) {
    throw new ServiceException("Post already exists with this title", 400);
  }

  // 3. assamble the info
  const post = new Post(postData);
  await post.save();

  // 4. increment number post of user
  user.numberPost = user.numberPost + 1;
  user.posts.push(post._id);
  await user.save();

  // 5. return response
  return post;
};

// delete a post
const deletePostService = async (postId, userId) => {

  // 1. first we need to find post
  const post = await Post.findById(postId)
  if (!post) {
    throw new ServiceException("Post not found", 404);
  }

  // 2. check if user exits
  const user = await User.findById(userId);
  if (!user) {
    throw new ServiceException("User not found", 404);
  }

  // 3. check if user is the same user in post  
  if (user._id.toString() !== post.user.toString()) {
    throw new ServiceException("You don't have permissions to delete this post", 403);
  }

  // 4. we need to delete image from cloudinary
  if (post.linkImage !== '') {
    await deleteImage(post.linkImage.public_id)
  }

  // 5. reduce number post
  user.numberPost = user.numberPost - 1;

  // 6. delete post from user
  user.posts = user.posts.filter(postId => postId.toString() !== post._id);
  user.save();
  post.remove();

}


// get a post with info
const getViewPostInfoService = async (postId) => {

  // 1. search a post
  const post = await Post.findById(postId)
    .select('categoriesPost categoriesSelect content date desc likePost linkImage title usersSavedPost createdAt')
    .populate({
      path: 'categories',
      select: '_id name value label color'
    })
    .populate({
      path: 'user',
      select: 'name email followedUsers followersUsers profilePicture'
    });

  // 2. validate if post exists
  if (!post) {
    throw new ServiceException("This post doesn't exists", 404);
  }

  // 3. search comments by post
  const comments = await Comment.find({ postID: postId })
    .select('comment dateComment postID')
    .populate({
      path: 'userID',
      select: 'name profilePicture'
    })
    .populate({
      path: 'replies',
      select: 'reply dateReply',
      populate: {
        path: 'userID',
        select: 'name profilePicture'
      }
    });

  return { post, comments };
}

export default {
  saveNewPostService,
  getViewPostInfoService,
  deletePostService
}