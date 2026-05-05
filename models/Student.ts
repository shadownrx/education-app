import mongoose, { Schema, model, models } from "mongoose";

const StudentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["present", "absent", "late", "pending"], 
    default: "pending" 
  },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  attendanceHistory: [{
    date: { type: Date, default: Date.now },
    status: String
  }]
}, { timestamps: true });

const Student = models.Student || model("Student", StudentSchema);

export default Student;
