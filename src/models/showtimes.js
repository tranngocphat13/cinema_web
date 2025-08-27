import mongoose from "mongoose";

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    startTime: { type: Date, required: true },
    seats: [
      {
        label: String, // ví dụ A1, A2
        status: { type: String, enum: ["available","held","confirmed"], default: "available" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Showtime || mongoose.model("Showtime", ShowtimeSchema);
