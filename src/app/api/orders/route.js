import connectDB from "../../../../../lib/db";
import Order from "../../../../../models/Order";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "customer") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { product, quantity, location } = await req.json();
    const order = new Order({
      customerId: decoded.userId,
      product,
      quantity,
      location,
      status: "Pending",
    });
    await order.save();

    // Emit WebSocket event
    const io = global.io;
    if (io) {
      io.emit("orderUpdate", { orderId: order._id, status: order.status });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}