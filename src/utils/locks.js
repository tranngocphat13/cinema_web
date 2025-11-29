// src/utils/locks.js
import Hold from "@/models/holdseat";
import Booking from "@/models/booking";

/**
 * Trả về Set seatId đang bị khoá:
 * - Đang hold và CHƯA hết hạn
 * - Hoặc đã được thanh toán (paid)
 *
 * NOTE:
 * - TTL Mongo có thể xoá chậm ~60s, nên function này chủ động ignore hold hết hạn
 * - và dọn luôn hold hết hạn để DB gọn.
 */
export async function getLockedSeatIds(showtimeId) {
  const now = new Date();
  const locked = new Set();

  // ✅ Dọn các hold đã hết hạn (TTL có thể chưa xoá kịp)
  await Hold.deleteMany({
    showtime: showtimeId,
    status: "hold",
    expireAt: { $lte: now },
  });

  // ✅ 1) Ghế đang hold và còn hạn
  const holds = await Hold.find(
    {
      showtime: showtimeId,
      status: "hold",
      expireAt: { $gt: now },
    },
    { seat: 1 }
  ).lean();

  for (const h of holds) locked.add(String(h.seat));

  // ✅ 2) Ghế đã thanh toán (paid) => khoá cứng
  const paidBookings = await Booking.find(
    { showtime: showtimeId, status: "paid" },
    { seats: 1 }
  ).lean();

  for (const b of paidBookings) {
    const seats = Array.isArray(b.seats) ? b.seats : [];
    for (const sid of seats) locked.add(String(sid));
  }

  return locked;
}
