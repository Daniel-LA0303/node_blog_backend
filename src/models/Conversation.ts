import mongoose, { Model, Schema } from "mongoose";
import { IConversation } from "../interfaces/message.interfaces";

const conversationSchema = new Schema<IConversation>(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    isGroup: {
      type: Boolean,
      required: false,
      default: false
    },
    groupImage: {
      type: String,
      required: false,
      default: "default"
    },
    groupName: {
      type: String,
      required: false,
      default: "default"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const Conversation: Model<IConversation> =
  mongoose.model<IConversation>(
    "Conversation",
    conversationSchema
  );

export default Conversation;