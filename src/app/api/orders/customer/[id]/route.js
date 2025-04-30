import connectDB from "../../../../../../lib/db";
import Order from "../../../../../../models/Order";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== params.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const orders = await Order.find({ customerId: params.id }).populate("deliveryPartnerId");
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}