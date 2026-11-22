import connectDB from "@/lib/db";
import Order from "@/models/order";
import { authenticate, serverError } from "@/lib/auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const ALLOWED_STATUSES = ["Accepted", "Out for Delivery", "Delivered"];

export async function PUT(req, { params }) {
  const { id } = await params; // Next 15: params is async
  const { user: decoded, response } = authenticate(req);
  if (response) return response;
  if (decoded.role !== "delivery") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await req.json();
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    // Don't let one partner take over an order already assigned to another.
    if (order.deliveryPartnerId && order.deliveryPartnerId.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Order is assigned to another delivery partner" },
        { status: 403 }
      );
    }

    order.status = status;
    order.deliveryPartnerId = decoded.userId;
    await order.save();

    // Emit WebSocket event
    global.io?.emit("orderUpdate", { orderId: order._id.toString(), status: order.status });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
