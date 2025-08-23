import Post from "../models/Post.js";
import User from "../models/User.js";
import { ServiceException } from "../utils/exception/ServiceException.js";


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

export default {
    saveNewPostService
}