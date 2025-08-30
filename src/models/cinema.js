import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Cinema || mongoose.model("Cinema", cinemaSchema);
