import mongoose, { Schema, model, models } from "mongoose";

const ResourceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // MIME type
    size: { type: Number, required: true },  // bytes
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Resource = models.Resource || model("Resource", ResourceSchema);

export default Resource;
