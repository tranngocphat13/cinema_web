// src/app/api/vnpay/ipn/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyVnpReturn } from "@/lib/vnpay";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";

function getBookingIdFromTxnRef(txnRef) {
  // txnRef = `${bookingId}-${Date.now()}-${random}`
  return String(txnRef || "").split("-")[0];
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());

    const { isValid, params, received, calc } = verifyVnpReturn(raw);

    if (!isValid) {
      console.error("VNPAY IPN checksum mismatch", { received, calc });
      return NextResponse.json({ RspCode: "97", Message: "Fail checksum" }, { status: 200 });
    }

    const txnRef = params.vnp_TxnRef;
    const bookingId = getBookingIdFromTxnRef(txnRef);

    const rspCode = params.vnp_ResponseCode; // "00" => success
    const txnStatus = params.vnp_TransactionStatus; // "00" => success (thường có)
    const amountFromVnp = Number(params.vnp_Amount); // x100

    if (!bookingId) {
      return NextResponse.json({ RspCode: "01", Message: "Missing TxnRef" }, { status: 200 });
    }

    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ RspCode: "01", Message: "Order not found" }, { status: 200 });
    }

    // idempotent
    if (booking.status === "paid") {
      return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" }, { status: 200 });
    }

    const expected = Math.round(Number(booking.total)) * 100;
    if (!Number.isFinite(expected) || expected <= 0) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount (order)" }, { status: 200 });
    }
    if (expected !== amountFromVnp) {
      return NextResponse.json({ RspCode: "04", Message: "Invalid amount (mismatch)" }, { status: 200 });
    }

    const ok = rspCode === "00" && (!txnStatus || txnStatus === "00");

    if (ok) {
      booking.status = "paid";
      booking.paymentMethod = "vnpay";
      await booking.save();

      // ✅ chốt ghế (xóa hold) khi IPN báo OK
      await Hold.deleteMany({ booking: booking._id });

      return NextResponse.json({ RspCode: "00", Message: "success" }, { status: 200 });
    }

    // Không “auto cancel” ở IPN để tránh case gateway retry/latency.
    // Return route sẽ hiển thị fail cho user.
    return NextResponse.json({ RspCode: "00", Message: "Payment not successful" }, { status: 200 });
  } catch (e) {
    console.error("VNPAY IPN error:", e);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" }, { status: 200 });
  }
}
