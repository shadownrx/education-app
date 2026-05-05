import mongoose, { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema({
  name: { type: String, required: true }, // e.g., Programación
  institution: { type: String, required: true }, // e.g., Escuela Técnica 1
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true, unique: true }, // For student access
}, { timestamps: true });

const Subject = models.Subject || model("Subject", SubjectSchema);

export default Subject;
