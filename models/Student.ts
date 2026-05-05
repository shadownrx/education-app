import mongoose, { Schema, model, models } from "mongoose";

const StudentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["present", "absent", "late", "pending"], 
    default: "pending" 
  },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  grade: { type: Number, min: 0, max: 100, default: null },
  attendanceHistory: [{
    date: { type: Date, default: Date.now },
    status: String
  }],
  passwordChangedAt: { type: Date, default: null },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

const Student = models.Student || model("Student", StudentSchema);

export default Student;
