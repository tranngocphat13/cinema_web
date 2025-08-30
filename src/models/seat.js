import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    number: { type: String, required: true }, // VD: A1, B2
    type: { type: String, enum: ["normal", "vip", "couple"], default: "normal" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    isAvailable: { type: Boolean, default: true },
    row: { type: String }, // "A", "B", ...
    column: { type: Number }, // 1, 2, 3...
    pairId: { type: String }, // ghế đôi
  },
  { timestamps: true }
);


export default mongoose.models.Seat || mongoose.model("Seat", seatSchema);
