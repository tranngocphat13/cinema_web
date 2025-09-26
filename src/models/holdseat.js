// models/hold.js
import mongoose from "mongoose";

const HoldSchema = new mongoose.Schema(
  {
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true, index: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    status: { type: String, enum: ["hold", "released"], default: "hold" },
    expireAt: { type: Date, required: true }, // TTL
  },
  { timestamps: true }
);

// TTL index tự động xoá sau khi expireAt < now
HoldSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Hold || mongoose.model("Hold", HoldSchema);
