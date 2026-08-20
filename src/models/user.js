import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["Admin", "Customer"], default: "Customer" },
  phone: { type: String, default: "" },
  points: { type: Number, default: 120 },
  membershipTier: { type: String, enum: ["Standard", "Silver", "Gold", "VIP", "Diamond"], default: "Standard" },
  avatarUrl: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
