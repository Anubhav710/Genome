import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface IChat extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, required: true, enum: ["user", "model"] },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: "New Conversation" },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Chat ||
  mongoose.model<IChat>("Chat", ChatSchema);
