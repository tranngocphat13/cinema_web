// models/showtime.js
import mongoose from "mongoose";

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

ShowtimeSchema.index({ movie: 1, cinema: 1 });
ShowtimeSchema.index({ room: 1, startTime: 1, endTime: 1 });
ShowtimeSchema.index({ endTime: 1 });

export default mongoose.models.Showtime || mongoose.model("Showtime", ShowtimeSchema);