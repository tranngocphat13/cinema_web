import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, unique: true }, // 🔹 Để tránh trùng lặp
    title: { type: String, required: true },
    duration: { type: Number }, // phút
    country: { type: String },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    director: { type: String },
    releaseDate: { type: Date },
    endDate: { type: Date },
    ageLimit: { type: String }, // T13, T18, K
    actors: [{ type: String }],
    posterUrl: { type: String },
    trailerUrl: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema);
