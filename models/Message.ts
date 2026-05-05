import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  content: { type: String, required: true, maxlength: 5000 },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  }],
  conversationId: { type: String, required: true },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null }
}, { timestamps: true });

// Compound index for conversation queries
MessageSchema.index({ senderId: 1, recipientId: 1, conversationId: 1 });
MessageSchema.index({ recipientId: 1, isRead: 1 });

const Message = models.Message || model("Message", MessageSchema);

export default Message;
