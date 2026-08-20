// src/models/booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
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
      enum: ["pending", "paid", "used", "canceled"],
      default: "pending",
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkInAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "vnpay", "cash", "dev-auto"],
      default: "vnpay",
    },
    customer: { name: String, email: String, phone: String },
  },
  { timestamps: true }
);

BookingSchema.index({ createdAt: -1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
