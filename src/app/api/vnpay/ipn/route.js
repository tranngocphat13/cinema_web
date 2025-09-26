export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyVnpayReturn } from "@/lib/vnpay";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());

    const { isValid, params, signBase, received, calc } = verifyVnpayReturn(raw);

    if (!isValid) {
      console.error("VNPAY IPN checksum mismatch", { received, calc, signBase, params });
      return NextResponse.json({ RspCode: "97", Message: "Fail checksum" }, { status: 200 });
    }

    const txnRef = params.vnp_TxnRef;
    const rspCode = params.vnp_ResponseCode; // "00" => success
    const amountFromVnp = Number(params.vnp_Amount); // x100

    if (!txnRef) return NextResponse.json({ RspCode: "01", Message: "Missing TxnRef" }, { status: 200 });

    await connectDB();
    const booking = await Booking.findById(txnRef);
    if (!booking) return NextResponse.json({ RspCode: "01", Message: "Order not found" }, { status: 200 });

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

    if (rspCode === "00") {
      booking.status = "paid";
      booking.paymentMethod = "vnpay";
      await booking.save();
      return NextResponse.json({ RspCode: "00", Message: "success" }, { status: 200 });
    } else {
      return NextResponse.json({ RspCode: "00", Message: "Payment not successful at gateway" }, { status: 200 });
    }
  } catch (e) {
    console.error("VNPAY IPN error:", e);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" }, { status: 200 });
  }
}
