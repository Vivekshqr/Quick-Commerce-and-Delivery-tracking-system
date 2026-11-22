import connectDB from "@/lib/db";
import Order from "@/models/order";
import { authenticate, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { user: decoded, response } = authenticate(req);
  if (response) return response;
  if (decoded.role !== "customer") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { product, quantity, location } = await req.json();
    if (!product || !location || !(Number(quantity) >= 1)) {
      return NextResponse.json(
        { message: "Product, quantity (>= 1) and location are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = new Order({
      customerId: decoded.userId,
      product,
      quantity: Number(quantity),
      location,
      status: "Pending",
    });
    await order.save();

    // Emit WebSocket event
    global.io?.emit("orderUpdate", { orderId: order._id.toString(), status: order.status });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
