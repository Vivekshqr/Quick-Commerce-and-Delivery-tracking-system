import connectDB from "@/lib/db";
import Order from "@/models/order";
import { authenticate, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

// Orders a delivery partner can act on: unassigned pending orders plus
// orders already assigned to this partner that are not yet delivered.
export async function GET(req) {
  const { user: decoded, response } = authenticate(req);
  if (response) return response;
  if (decoded.role !== "delivery") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const orders = await Order.find({
      $or: [
        { status: "Pending" },
        { deliveryPartnerId: decoded.userId, status: { $ne: "Delivered" } },
      ],
    }).sort({ _id: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
