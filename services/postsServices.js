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
  if(!post){    
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

  return {post, comments};
}

export default {
  saveNewPostService,
  getViewPostInfoService
}