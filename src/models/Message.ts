import mongoose, { Model, Schema } from "mongoose";
import { IMessage } from "../interfaces/message.interfaces";

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: false,
      default: null
    },
    file: {
      type: String,
      required: false,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const Message: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  messageSchema
);

export default Message;