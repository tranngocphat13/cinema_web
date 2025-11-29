import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  // giữ lại status như bạn đang dùng
  const status = searchParams.get("status") || "now_playing";

  // thêm lang
  const lang = searchParams.get("lang") === "en" ? "en" : "vi";

  const movies = await Movie.find({ status }).sort({ releaseDate: -1 }).lean();

  // map title theo lang (fallback về title cũ nếu DB chưa có)
  const mapped = movies.map((m) => {
    const title =
      lang === "en"
        ? (m.title_en || m.titleEn || m.title || "")
        : (m.title_vi || m.titleVi || m.title || "");

    return { ...m, title };
  });

  return NextResponse.json(mapped);
}
