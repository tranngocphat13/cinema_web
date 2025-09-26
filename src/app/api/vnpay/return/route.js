import { NextResponse } from "next/server";
import { verifyVnpReturn } from "@/lib/vnpay";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Xác minh chữ ký
    const { isValid, params: sorted, received, calc } = verifyVnpReturn(params);

    if (!isValid) {
      return NextResponse.json(
        { message: "Chữ ký không hợp lệ", received, calc },
        { status: 400 }
      );
    }

    // Thanh toán thành công
    if (sorted.vnp_ResponseCode === "00" && sorted.vnp_TransactionStatus === "00") {
      // TODO: cập nhật DB đơn hàng với sorted.vnp_TxnRef nếu cần
      return NextResponse.json({
        message: "Thanh toán thành công",
        txnRef: sorted.vnp_TxnRef,
        amount: Number(sorted.vnp_Amount) / 100,
      });
    }

    // Thanh toán thất bại
    return NextResponse.json(
      {
        message: `Thanh toán thất bại (Mã: ${sorted.vnp_ResponseCode})`,
        txnRef: sorted.vnp_TxnRef,
      },
      { status: 400 }
    );
  } catch (err) {
    console.error("Return error:", err);
    return NextResponse.json(
      { message: "Lỗi xử lý kết quả VNPAY", error: err.message },
      { status: 500 }
    );
  }
}
