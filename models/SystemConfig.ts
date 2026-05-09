import mongoose, { Schema, model, models } from "mongoose";

const SystemConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const SystemConfig = models.SystemConfig || model("SystemConfig", SystemConfigSchema);

export default SystemConfig;
