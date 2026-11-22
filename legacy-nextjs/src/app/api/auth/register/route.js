import connectDB from "@/lib/db";
import User from "@/models/user";
import { getJwtSecret, serverError } from "@/lib/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !["customer", "delivery"].includes(role)) {
      return NextResponse.json(
        { message: "Name, email, password and a valid role are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email: normalizedEmail, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ userId: user._id.toString(), role }, getJwtSecret(), {
      expiresIn: "1h",
    });

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
