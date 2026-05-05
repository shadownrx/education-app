import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["message", "assignment", "grade", "attendance", "system", "announcement"],
    required: true 
  },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  relatedModel: { 
    type: String, 
    enum: ["Message", "Assignment", "Subject", "Student", null],
    default: null 
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  actionUrl: { type: String, default: null },
  priority: { 
    type: String, 
    enum: ["low", "normal", "high"], 
    default: "normal" 
  }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = models.Notification || model("Notification", NotificationSchema);

export default Notification;
