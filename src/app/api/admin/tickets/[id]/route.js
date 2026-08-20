import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

export const dynamic = "force-dynamic";

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const { action } = await req.json();

    await connectDB();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Không tìm thấy vé" }, { status: 404 });
    }

    if (action === "check_in") {
      booking.isUsed = true;
      booking.status = "used";
      booking.checkInAt = new Date();
      await booking.save();

      return NextResponse.json({
        message: "Soát vé (Check-in) thành công! Khách đã vào phòng.",
        booking,
      });
    }

    if (action === "undo_check_in") {
      booking.isUsed = false;
      booking.status = "paid";
      booking.checkInAt = null;
      await booking.save();

      return NextResponse.json({
        message: "Đã hoàn tác trạng thái soát vé.",
        booking,
      });
    }

    if (action === "cancel") {
      booking.status = "canceled";
      await booking.save();

      return NextResponse.json({
        message: "Đã hủy vé thành công.",
        booking,
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/tickets/[id] error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái vé" }, { status: 500 });
  }
}
