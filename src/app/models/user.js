import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["Admin", "Customer"], default: "Customer" },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
