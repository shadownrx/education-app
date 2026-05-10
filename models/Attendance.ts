import mongoose, { Schema, model, models } from "mongoose";

const AttendanceSchema = new Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  date: { type: Date, default: Date.now },
  records: [
    {
      studentId: { type: String, required: true }, // Using the custom student identifier
      status: { 
        type: String, 
        enum: ["present", "absent", "late"], 
        required: true 
      },
      name: { type: String } // Optional: cached name for quick display
    }
  ],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Attendance = models.Attendance || model("Attendance", AttendanceSchema);

export default Attendance;
