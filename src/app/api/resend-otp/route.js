// /api/resend-otp/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/user";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = expires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Movie App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã OTP mới",
      text: `Mã OTP mới của bạn là: ${verificationCode}. Mã này sẽ hết hạn sau 3 phút.`,
    });

    return NextResponse.json({ message: "Đã gửi lại mã OTP" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Lỗi gửi lại mã" }, { status: 500 });
  }
}
