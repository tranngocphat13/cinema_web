export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildVnpayUrl } from "@/lib/vnpay";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { amount, bookingId } = await req.json();

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: "Thiếu amount hoặc bookingId" },
        { status: 400 }
      );
    }

    // ✅ unique TxnRef
    const uniqueOrderId = `${bookingId}-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // ✅ IP (Vercel/Proxy)
    const xf = req.headers.get("x-forwarded-for");
    const xr = req.headers.get("x-real-ip");
    let ip = (xf || xr || "127.0.0.1").split(",")[0].trim();
    if (ip === "::1") ip = "127.0.0.1";

    // ✅ build URL
    const { redirectUrl, vnpParams } = buildVnpayUrl({
      amount,
      orderId: uniqueOrderId,
      orderInfo: `Thanh toan don hang ${bookingId}`,
      ipAddr: ip,
    });

    // ✅ DEBUG: đặt TRONG POST (đừng đặt ngoài file)
    console.log("VNP TIME DEBUG", {
      serverISO: new Date().toISOString(),
      createDate: vnpParams?.vnp_CreateDate,
      expireDate: vnpParams?.vnp_ExpireDate,
      txnRef: vnpParams?.vnp_TxnRef,
      ip,
    });

    return NextResponse.json({ payUrl: redirectUrl, orderId: uniqueOrderId });
  } catch (e) {
    console.error("create vnp error:", e);
    return NextResponse.json({ error: "Lỗi tạo URL VNPAY" }, { status: 500 });
  }
}
