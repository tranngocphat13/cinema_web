import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Genre from "@/models/genres.js";

// PUT: Cập nhật thể loại
export async function PUT(req, { params }) {
  await connectDB();
  const { name } = await req.json();

  const updated = await Genre.findByIdAndUpdate(params.id, { name }, { new: true });
  return NextResponse.json(updated);
}

// DELETE: Xóa thể loại
export async function DELETE(req, { params }) {
  await connectDB();
  await Genre.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Đã xóa" });
}
