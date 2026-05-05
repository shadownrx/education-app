import mongoose, { Schema, model, models } from "mongoose";

const LessonPlanSchema = new Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [{ type: String }],
  status: { 
    type: String, 
    enum: ["completed", "current", "upcoming"], 
    default: "upcoming" 
  },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  date: { type: String, required: true }
}, { timestamps: true });

const LessonPlan = models.LessonPlan || model("LessonPlan", LessonPlanSchema);

export default LessonPlan;
