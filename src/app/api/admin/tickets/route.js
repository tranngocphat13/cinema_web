import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";
import Seat from "@/models/seat";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15")));

    await connectDB();

    const filter = {};

    // Filter by status
    if (status === "paid") {
      filter.status = "paid";
      filter.isUsed = { $ne: true };
    } else if (status === "used") {
      filter.$or = [{ status: "used" }, { isUsed: true }];
    } else if (status === "canceled") {
      filter.status = "canceled";
    }

    // Search query
    if (q) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(q);
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      if (isObjectId) {
        filter.$or = [
          { _id: q },
          { "customer.name": regex },
          { "customer.email": regex },
          { "customer.phone": regex },
          { ticketCode: regex },
        ];
      } else {
        filter.$or = [
          { "customer.name": regex },
          { "customer.email": regex },
          { "customer.phone": regex },
          { ticketCode: regex },
        ];
      }
    }

    const totalTickets = await Booking.countDocuments(filter);
    const tickets = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title posterUrl runtime" },
          { path: "cinema", select: "name address" },
          { path: "room", select: "name" },
        ],
      })
      .populate("seats", "number type row column")
      .lean();

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total: totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/tickets error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách vé" }, { status: 500 });
  }
}
