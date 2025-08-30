import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate ghế
roomSchema.virtual("seats", {
  ref: "Seat",
  localField: "_id",
  foreignField: "room",
});

mongoose.set("strictPopulate", false);

// ⚠️ Đây là cách chuẩn để tránh lỗi "Use mongoose.model"
export default mongoose.models.Room || mongoose.model("Room", roomSchema);
