import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    await connectDB();

    // Check tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email đã tồn tại" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3 * 60 * 1000); // 10 phút

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Customer",
      isVerified: false,
      verificationCode,
      verificationCodeExpires: expires,
    });

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Movie App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác thực tài khoản Movie App",
      text: `Mã xác thực của bạn là: ${verificationCode}. Mã này sẽ hết hạn sau 3 phút.`,
    });

    return NextResponse.json({ message: "Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP." }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Lỗi khi đăng ký" }, { status: 500 });
  }
}
