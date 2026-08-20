import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";
import Showtime from "@/models/showtimes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Tổng quan Doanh thu & Vé
    const validBookingFilter = { status: { $in: ["paid", "used"] } };

    const [
      allTimeStats,
      todayStats,
      monthStats,
      totalMovies,
      nowPlayingMovies,
      upcomingMovies,
      totalCinemas,
      totalRooms,
      recentBookings,
    ] = await Promise.all([
      // Toàn thời gian
      Booking.aggregate([
        { $match: validBookingFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalTickets: { $sum: { $size: "$seats" } },
            totalOrders: { $sum: 1 },
          },
        },
      ]),

      // Hôm nay
      Booking.aggregate([
        { $match: { ...validBookingFilter, createdAt: { $gte: startOfToday } } },
        {
          $group: {
            _id: null,
            revenueToday: { $sum: "$total" },
            ticketsToday: { $sum: { $size: "$seats" } },
          },
        },
      ]),

      // Tháng này
      Booking.aggregate([
        { $match: { ...validBookingFilter, createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            revenueMonth: { $sum: "$total" },
          },
        },
      ]),

      // Số lượng phim
      Movie.countDocuments(),
      Movie.countDocuments({ status: "now_playing" }),
      Movie.countDocuments({ status: "upcoming" }),

      // Rạp & phòng
      Cinema.countDocuments(),
      Room.countDocuments(),

      // Đơn đặt vé mới nhất
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate({
          path: "showtime",
          populate: [
            { path: "movie", select: "title posterUrl" },
            { path: "cinema", select: "name" },
            { path: "room", select: "name" },
          ],
        })
        .populate("seats", "number type")
        .lean(),
    ]);

    // 2. Doanh thu 7 ngày gần nhất
    const dailyStatsRaw = await Booking.aggregate([
      {
        $match: {
          ...validBookingFilter,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" },
          },
          revenue: { $sum: "$total" },
          tickets: { $sum: { $size: "$seats" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format đủ 7 ngày liên tục kể cả ngày có 0đ
    const dailyStatsMap = new Map(dailyStatsRaw.map((d) => [d._id, d]));
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;

      const found = dailyStatsMap.get(key);
      dailyRevenue.push({
        date: label,
        fullDate: key,
        revenue: found?.revenue || 0,
        tickets: found?.tickets || 0,
      });
    }

    // 3. Top 5 Phim bán chạy nhất
    const topMoviesRaw = await Booking.aggregate([
      { $match: validBookingFilter },
      {
        $lookup: {
          from: "showtimes",
          localField: "showtime",
          foreignField: "_id",
          as: "showtimeDoc",
        },
      },
      { $unwind: "$showtimeDoc" },
      {
        $group: {
          _id: "$showtimeDoc.movie",
          ticketsSold: { $sum: { $size: "$seats" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movieDoc",
        },
      },
      { $unwind: { path: "$movieDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          ticketsSold: 1,
          revenue: 1,
          title: { $ifNull: ["$movieDoc.title", "Phim không xác định"] },
          posterUrl: { $ifNull: ["$movieDoc.posterUrl", ""] },
          ratingLabel: { $ifNull: ["$movieDoc.ratingLabel", ""] },
        },
      },
    ]);

    const stats = {
      totalRevenue: allTimeStats[0]?.totalRevenue || 0,
      totalTickets: allTimeStats[0]?.totalTickets || 0,
      totalOrders: allTimeStats[0]?.totalOrders || 0,
      revenueToday: todayStats[0]?.revenueToday || 0,
      ticketsToday: todayStats[0]?.ticketsToday || 0,
      revenueMonth: monthStats[0]?.revenueMonth || 0,
      totalMovies,
      nowPlayingMovies,
      upcomingMovies,
      totalCinemas,
      totalRooms,
      dailyRevenue,
      topMovies: topMoviesRaw,
      recentBookings,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Lỗi tổng hợp dữ liệu thống kê" }, { status: 500 });
  }
}
