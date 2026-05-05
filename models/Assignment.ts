import mongoose, { Schema, model, models } from "mongoose";

const AssignmentSchema = new Schema({
  student: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  submittedAt: { type: Date },
  status: { 
    type: String, 
    enum: ["pending", "submitted", "graded", "late"], 
    default: "pending" 
  },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  grade: { type: Number },
  file: { type: String },
  subject: { type: String, required: true },
  deadline: { type: String, required: true }
}, { timestamps: true });

const Assignment = models.Assignment || model("Assignment", AssignmentSchema);

export default Assignment;
