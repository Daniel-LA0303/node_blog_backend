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

const userLikePostService = async (postId, userId) => {

  // 1. check if user exists
  const user = await User.findById(userId);
  if (!user) throw new ServiceException("User not found", 404);

  // 2. check if post exists
  const post = await Post.findById(postId);
  if (!post) throw new ServiceException("Post not found", 404);

  // 3. validations: check if relation already exists
  const alreadyLikedPost = post.likePost.users.includes(userId);
  if (alreadyLikedPost) {
    throw new ServiceException("User already liked this post", 400);
  }

  const alreadyInUser = user.likePost.posts.includes(postId);
  if (alreadyInUser) {
    throw new ServiceException("Post already liked by user", 400);
  }

  // 4. add user in post likes
  await Post.findByIdAndUpdate(
    postId,
    {
      $addToSet: { 'likePost.users': userId },
      $inc: { 'likePost.countLikes': 1 },
    },
    { new: true }
  );

  // 5. add post in user likes
  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { 'likePost.posts': postId },
      $inc: { 'likePost.countPosts': 1 },
    },
    { new: true }
  );
};

const userDisikePostService = async (postId, userId) => {

  // 1. check if user exists
  const user = await User.findById(userId);
  if (!user) throw new ServiceException("User not found", 404);

  // 2. check if post exists
  const post = await Post.findById(postId);
  if (!post) throw new ServiceException("Post not found", 404);

  // 3. validations: check if relation exists
  const hasLikeInPost = post.likePost.users.includes(userId);
  if (!hasLikeInPost) {
    throw new ServiceException("User has not liked this post", 400);
  }

  const hasLikeInUser = user.likePost.posts.includes(postId);
  if (!hasLikeInUser) {
    throw new ServiceException("Post not liked by user", 400);
  }

  // 4. remove user from post likes
  await Post.findByIdAndUpdate(
    postId,
    {
      $pull: { 'likePost.users': userId },
      $inc: { 'likePost.countLikes': -1 },
    },
    { new: true }
  );

  // 5. remove post from user likes
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { 'likePost.posts': postId },
      $inc: { 'likePost.countPosts': -1 },
    },
    { new: true }
  );
};

const userSavePostService = async (postId, userId) => {

  // 1. check if user exists
  const user = await User.findById(userId);
  if (!user) throw new ServiceException("User not found", 404);

  // 2. check if post exists
  const post = await Post.findById(postId);
  if (!post) throw new ServiceException("Post not found", 404);

  // 3. validations: check if already saved
  const alreadySavedPost = user.postsSaved.posts.includes(postId);
  if (alreadySavedPost) {
    throw new ServiceException("Post already saved by user", 400);
  }

  const alreadyInPost = post.usersSavedPost.users.includes(userId);
  if (alreadyInPost) {
    throw new ServiceException("User already saved this post", 400);
  }

  // 4. add post to user's saved posts
  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { 'postsSaved.posts': postId },
      $inc: { 'postsSaved.countPosts': 1 },
    },
    { new: true }
  );

  // 5. add user to post saved list
  await Post.findByIdAndUpdate(
    postId,
    {
      $addToSet: { 'usersSavedPost.users': userId },
      $inc: { 'usersSavedPost.countUsers': 1 },
    },
    { new: true }
  );
};

const userUnsavePostService = async (postId, userId) => {
  // 1. check if user exists
  const user = await User.findById(userId);
  if (!user) throw new ServiceException("User not found", 404);

  // 2. check if post exists
  const post = await Post.findById(postId);
  if (!post) throw new ServiceException("Post not found", 404);

  // 3. validations: check if post was saved
  const isSavedInUser = user.postsSaved.posts.includes(postId);
  if (!isSavedInUser) {
    throw new ServiceException("Post not saved by user", 400);
  }

  const isSavedInPost = post.usersSavedPost.users.includes(userId);
  if (!isSavedInPost) {
    throw new ServiceException("User has not saved this post", 400);
  }

  // 4. remove post from user's saved posts
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { 'postsSaved.posts': postId },
      $inc: { 'postsSaved.countPosts': -1 },
    },
    { new: true }
  );

  // 5. remove user from post saved list
  await Post.findByIdAndUpdate(
    postId,
    {
      $pull: { 'usersSavedPost.users': userId },
      $inc: { 'usersSavedPost.countUsers': -1 },
    },
    { new: true }
  );
};



export default {
  saveNewPostService,
  getViewPostInfoService,
  deletePostService,
  userLikePostService,
  userDisikePostService,
  userSavePostService,
  userUnsavePostService
}