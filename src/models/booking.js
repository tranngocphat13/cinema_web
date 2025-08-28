import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime" },
  seats: [String],
  user: String, // email/phone
  status: { type: String, default: "pending" }, // pending, paid, cancelled
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
