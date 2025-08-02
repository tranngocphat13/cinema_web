import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    await connectDB();
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({message: "User registered successfully"}, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({message: "Error registering user"}, { status: 500 });
  }
}
