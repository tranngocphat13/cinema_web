import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
    seats: [String],
    status: { type: String, enum: ["held","confirmed"], default: "held" },
    holdExpires: { type: Date },
    user: {
      name: String,
      email: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
