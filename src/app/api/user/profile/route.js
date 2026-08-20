import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export const dynamic = "force-dynamic";

// Lấy thông tin profile người dùng
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select("-password -verificationCode -verificationCodeExpires")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role || "Customer",
      points: user.points ?? 120,
      membershipTier: user.membershipTier || "Standard",
      avatarUrl: user.avatarUrl || "",
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

// Cập nhật thông tin cá nhân (Tên, SĐT)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { name, phone } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Tên không được để trống" }, { status: 400 });
    }

    await connectDB();
    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: name.trim(),
          phone: phone ? phone.trim() : "",
        },
      },
      { new: true }
    ).select("-password -verificationCode -verificationCodeExpires");

    return NextResponse.json({
      message: "Cập nhật thông tin thành công",
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
        role: updated.role,
        points: updated.points ?? 120,
        membershipTier: updated.membershipTier || "Standard",
      },
    });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
