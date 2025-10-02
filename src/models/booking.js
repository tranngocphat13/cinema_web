// src/models/booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
      index: true,
    },
    seats: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    ],
    ticketType: {
      type: String,
      enum: ["normal", "vip", "couple"],
      required: true,
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "cash", "dev-auto"],
      default: "vnpay",
    },
    customer: { name: String, email: String },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
