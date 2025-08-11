import { NextResponse } from "next/server";
import  connectDB  from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ message: "Tài khoản đã xác thực" }, { status: 400 });
    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      return NextResponse.json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return NextResponse.json({ message: "Xác thực thành công!" }, { status: 200 });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json({ message: "Lỗi khi xác thực" }, { status: 500 });
  }
}
