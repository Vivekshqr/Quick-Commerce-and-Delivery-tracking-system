import connectDB from "@/lib/db";
import User from "@/models/user";
import { authenticate, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { user: decoded, response } = authenticate(req);
  if (response) return response;

  try {
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
