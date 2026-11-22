import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local");
  return secret;
}

// Returns { user } on success or { response } with a 401 to return directly.
export function authenticate(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  try {
    return { user: jwt.verify(token, getJwtSecret()) };
  } catch {
    return { response: NextResponse.json({ message: "Invalid token" }, { status: 401 }) };
  }
}

export function serverError(error) {
  console.error(error);
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}
