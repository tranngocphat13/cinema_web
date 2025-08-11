import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function PUT(req, { params }) {
  await connectDB();
  const data = await req.json();
  const updated = await Movie.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  await connectDB();
  await Movie.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Đã xóa" });
}
