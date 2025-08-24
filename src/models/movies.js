import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, unique: true, index: true },
    title: String,
    overview: String,
    releaseDate: Date,
    posterUrl: String,
    trailerUrl: String,
    ratingLabel: String,
    genres: [String],
    duration: Number,
    country: String,
    director: String,
    actors: [String],
    status: { type: String, enum: ["now_playing", "upcoming"], default: "now_playing" }
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
