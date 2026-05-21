import { Types } from "mongoose";

interface IImage {
  secure_url: string;
  public_id: string;
}

interface IReplyEmbedded {
  _id?: any;
  userID: Types.ObjectId;
  reply: string;
  dateReply: string;
}

interface ICommentEmbedded {
  _id: any
  userID: Types.ObjectId;
  comment: string;
  dateComment: string;
  replies: IReplyEmbedded[];
}

interface ICommentsOnPost {
  numberComments: number;
  comments: ICommentEmbedded[];
}

interface ILikePost {
  users: Types.ObjectId[];
}

interface IUsersSavedPost {
  users: Types.ObjectId[];
}

export interface IPost extends Document {
  user: Types.ObjectId;

  title: string;

  desc: string;

  content: string;

  linkImage: IImage;

  categories: Types.ObjectId[];

  likePost: ILikePost;

  commenstOnPost: ICommentsOnPost;

  usersSavedPost: IUsersSavedPost;

  date?: number;

  comments: Types.ObjectId[];
}
