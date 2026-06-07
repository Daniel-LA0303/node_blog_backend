import { Types } from "mongoose";

export interface IConversation extends Document {
  members: Types.ObjectId[];
  messages: Types.ObjectId[];
  lastMessage: Types.ObjectId;
  isGroup: boolean;
  groupName?: string;
  createdBy?: Types.ObjectId;
  groupImage?: string;
}

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  messageType: string;
  conversationId: Types.ObjectId;
  read: boolean;
  image?: string;
  file?: string;
  replyTo?: Types.ObjectId;
}

export interface SendNewMessageI {
    message: string;
    messageType: string;
    replyTo?: string;
    image?: string | null;
}