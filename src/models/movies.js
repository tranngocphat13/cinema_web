// models/movies.ts
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
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    duration: Number,
    country: String,
    director: String,
    actors: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
