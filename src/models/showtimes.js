import mongoose from "mongoose";

const ShowtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie",  required: true }, // <-- bắt buộc kiểu ObjectId
  startTime: { type: Date, required: true }, // <-- bắt buộc kiểu Date
  room: { type: String, required: true },
});

export default mongoose.models.Showtime || mongoose.model("Showtime", ShowtimeSchema);
  