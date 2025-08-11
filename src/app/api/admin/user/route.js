import connectDB from "@/lib/mongodb";
import User from "@/models/user";

// Lấy danh sách user
export async function GET() {
  await connectDB();
  const users = await User.find().lean();
  return Response.json({ users });
}

// Cập nhật role
export async function PUT(req) {
  await connectDB();
  const { id, role } = await req.json();
  await User.findByIdAndUpdate(id, { role });
  return Response.json({ message: "Cập nhật thành công" });
}

// Xóa user
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await User.findByIdAndDelete(id);
  return Response.json({ message: "Xóa thành công" });
}
