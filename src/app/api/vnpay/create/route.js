import { NextResponse } from "next/server";
import { buildVnpayUrl } from "@/lib/vnpay";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { amount, bookingId } = await req.json();
    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: "Thiếu amount hoặc bookingId" },
        { status: 400 }
      );
    }

    // ✅ Luôn tạo mã giao dịch duy nhất (bookingId + timestamp + random)
    const uniqueOrderId = `${bookingId}-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    let ip =
      (req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1")
        .split(",")[0]
        .trim();
    if (ip === "::1") ip = "127.0.0.1";

    const { redirectUrl, signData, vnp_SecureHash, vnpParams } = buildVnpayUrl({
      amount,
      orderId: uniqueOrderId,                     // 🔑 dùng mã mới
      orderInfo: `Thanh toan don hang ${bookingId}`,
      ipAddr: ip,
    });

    // (Tuỳ chọn) Lưu uniqueOrderId vào DB để so khớp khi IPN/return
    // await Booking.updateOne({ _id: bookingId }, { vnpTxnRef: uniqueOrderId });

    console.log("VNPAY CREATE DEBUG =>", {
      tmn: process.env.VNP_TMN_CODE,
      secretLen: String(process.env.VNP_HASH_SECRET || "").trim().length,
      signData,
      vnp_SecureHash,
      params: vnpParams,
    });

    return NextResponse.json({ payUrl: redirectUrl });
  } catch (e) {
    console.error("create vnp error:", e);
    return NextResponse.json({ error: "Lỗi tạo URL VNPAY" }, { status: 500 });
  }
}
console.log("VNP TIME DEBUG", {
  serverISO: new Date().toISOString(),
  createDate: vnpParams.vnp_CreateDate,
  expireDate: vnpParams.vnp_ExpireDate,
});
