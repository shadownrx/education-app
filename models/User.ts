import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "teacher" },
  isAdmin: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  avatar: { type: String }
}, { timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;
