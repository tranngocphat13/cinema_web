import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find().populate("genres").sort({ createdAt: -1 });
    return NextResponse.json(movies);
  } catch (err) {
    console.error("GET /movies error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = {
        title: formData.get("title"),
        duration: parseInt(formData.get("duration")),
        country: formData.get("country"),
        genres: JSON.parse(formData.get("genres") || "[]"),
        director: formData.get("director"),
        releaseDate: formData.get("releaseDate") || null,
        endDate: formData.get("endDate") || null,
        ageLimit: formData.get("ageLimit"),
        actors: (formData.get("actors") || "").split(",").map((a) => a.trim()),
        trailerUrl: formData.get("trailerUrl"),
        description: formData.get("description"),
      };

      const posterFile = formData.get("poster");
      if (posterFile && posterFile.name) {
        const buffer = Buffer.from(await posterFile.arrayBuffer());

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const fileName = Date.now() + "-" + posterFile.name;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        data.posterUrl = `/uploads/${fileName}`;
      }
    } else {
      data = await req.json();
    }

    if (!data.title || !data.duration) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
    }

    const movie = await Movie.create(data);
    return NextResponse.json(movie);
  } catch (err) {
    console.error("POST /movies error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
