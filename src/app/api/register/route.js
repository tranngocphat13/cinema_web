// /api/register/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    await connectDB();

    let user = await User.findOne({ email });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3 * 60 * 1000);

    if (user && user.isVerified) {
      return NextResponse.json({ message: "Email đã tồn tại" }, { status: 400 });
    }

    if (user && !user.isVerified) {
      user.name = name;
      user.password = await bcrypt.hash(password, 10);
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = expires;
      await user.save();
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Customer",
        isVerified: false,
        verificationCode,
        verificationCodeExpires: expires,
      });
    }

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Movie App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực tài khoản",
      text: `Mã OTP của bạn là: ${verificationCode}. Mã này sẽ hết hạn sau 3 phút.`,
    });

    return NextResponse.json({ message: "Đăng ký thành công", success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Lỗi khi đăng ký" }, { status: 500 });
  }
}
