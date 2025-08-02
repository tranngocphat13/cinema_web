import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    return NextResponse.json({message: "User registered successfully"}, { status: 201 });
  } catch (error) {
    return NextResponse.json({message: "Error registering user"}, { status: 500 });
  }
}
