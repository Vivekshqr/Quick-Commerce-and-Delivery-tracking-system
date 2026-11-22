"use client";
import { useState } from "react";
import Link from "next/link";
import { errorMessage, ordersApi } from "@/lib/api";
import RateOrder from "./RateOrder";
import { Alert } from "@/components/ui";

// Customer-side actions on an order card: delivery OTP, tracking, cancel, rating.
export default function CustomerOrderExtras({ order, onChange }) {
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const active = !["Delivered", "Cancelled"].includes(order.status);

  const cancel = async () => {
    if (!window.confirm("Cancel this order? Items go back to stock.")) return;
    setCancelling(true);
    setError("");
    try {
      onChange?.(await ordersApi.cancel(order._id));
    } catch (err) {
      setError(errorMessage(err, "Could not cancel"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <Alert onClose={() => setError("")}>{error}</Alert>
      {active && order.deliveryOtp && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-brand-50 px-3 py-2">
          <span className="text-xs text-brand-800">Delivery OTP: share it with the partner at your door</span>
          <span className="font-mono text-lg font-bold tracking-[0.3em] text-brand-900">{order.deliveryOtp}</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {["Accepted", "Out for Delivery"].includes(order.status) && (
          <Link href={`/track/${order._id}`} className="btn-primary flex-1 py-2">
            {order.status === "Out for Delivery" ? "📍 Track live" : "View tracking"}
          </Link>
        )}
        {order.status === "Pending" && (
          <button onClick={cancel} disabled={cancelling} className="btn flex-1 border border-red-200 py-2 text-red-600 hover:bg-red-50">
            {cancelling ? "Cancelling…" : "Cancel order"}
          </button>
        )}
      </div>
      {order.status === "Delivered" && <RateOrder order={order} onRated={onChange} />}
    </div>
  );
}
