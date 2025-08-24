import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, unique: true, required: true, index: true },
    title: String,
    overview: String,
    genres: [String],
    posterUrl: String,
    backdropUrl: String,
    trailerUrl: String,
    releaseDate: Date,
    status: { type: String, enum: ["now_playing", "upcoming", "ended"] },
    runtime: Number,
    ratingLabel: String,
    countries: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
