export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildVnpayUrl } from "@/lib/vnpay";
import crypto from "crypto";

function getClientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  const xr = req.headers.get("x-real-ip");
  let ip = (xf || xr || "127.0.0.1").split(",")[0].trim();
  if (!ip || ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
}

export async function POST(req) {
  try {
    const { amount, bookingId } = await req.json();

    if (!amount || !bookingId) {
      return NextResponse.json({ error: "Thiếu amount hoặc bookingId" }, { status: 400 });
    }

    // ✅ TxnRef phải ngắn <= 34. Dùng bookingId là an toàn nhất.
    // Nếu cần unique cho nhiều lần bấm, hãy tạo booking mới mỗi lần (đúng flow).
    const orderId = String(bookingId);

    const ipAddr = getClientIp(req);

    const { redirectUrl, signData, vnp_SecureHash, vnpParams } = buildVnpayUrl({
      amount,
      orderId,
      orderInfo: `Thanh toan don hang ${bookingId}`,
      ipAddr,
    });

    console.log("VNPAY CREATE DEBUG =>", {
      tmn: process.env.VNP_TMN_CODE,
      secretLen: String(process.env.VNP_HASH_SECRET || "").trim().length,
      orderId,
      orderIdLen: orderId.length,
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
