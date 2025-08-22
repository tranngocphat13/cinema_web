import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const data = await req.json();
    const updated = await Movie.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /movies/:id error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Movie.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Đã xóa" });
  } catch (err) {
    console.error("DELETE /movies/:id error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
