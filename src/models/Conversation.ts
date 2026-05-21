import mongoose, {Model, Schema } from "mongoose";
import { IConversation } from "../interfaces/message.interfaces";

const conversationSchema = new Schema<IConversation>(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
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