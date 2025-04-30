import connectDB from "../../../../../lib/db";
import User from "../../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { name, email, password, role } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();

  const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return NextResponse.json({ token }, { status: 201 });
}