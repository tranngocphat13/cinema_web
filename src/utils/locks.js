// src/utils/locks.js
import Hold from "@/models/holdseat";
import Booking from "@/models/booking";

/** Trả về Set<string> các seatId đang bị khóa
 *  - Hold còn hạn (status:"hold", expireAt > now)
 *  - Booking ở trạng thái "pending" hoặc "paid"
 */
export async function getLockedSeatIds(showtimeId) {
  const now = new Date();

  const holds = await Hold.find({
    showtime: showtimeId,
    status: "hold",
    expireAt: { $gt: now },
  }).select("seat");

  const bookings = await Booking.find({
    showtime: showtimeId,
    status: { $in: ["pending", "paid"] },
  }).select("seats");

  const locked = new Set();
  for (const h of holds) locked.add(String(h.seat));
  for (const b of bookings) for (const sid of b.seats) locked.add(String(sid));
  return locked;
}
