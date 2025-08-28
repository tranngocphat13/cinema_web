import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema({
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime" },
  seatNumber: String,     // A1, A2...
  isBooked: { type: Boolean, default: false },
  holdUntil: Date,        // thời gian giữ ghế (3 phút)
});

export default mongoose.models.Seat || mongoose.model("Seat", SeatSchema);
