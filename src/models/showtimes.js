import mongoose from "mongoose";

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    startTime: { type: Date, required: true },
    room: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Showtime || mongoose.model("Showtime", ShowtimeSchema);
