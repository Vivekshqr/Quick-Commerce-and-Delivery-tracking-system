import connectDB from "@/lib/db";
import Order from "@/models/order";
import "@/models/user"; // register User model so populate() works
import { authenticate, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params; // Next 15: params is async
  const { user: decoded, response } = authenticate(req);
  if (response) return response;
  if (decoded.userId !== id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const orders = await Order.find({ customerId: id })
      .sort({ _id: -1 })
      .populate("deliveryPartnerId", "-password");
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
