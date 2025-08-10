import mongoose, { Schema } from "mongoose";

const GenreSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Genre || mongoose.model("Genre", GenreSchema);
