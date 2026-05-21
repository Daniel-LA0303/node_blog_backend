import { Types } from "mongoose";

export interface IConversation extends Document {
  members: Types.ObjectId[];
  messages: Types.ObjectId[];
}

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  conversationId: Types.ObjectId;
  read: boolean;
}