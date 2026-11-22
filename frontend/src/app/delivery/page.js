"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/lib/useSocket";
import { authApi, errorMessage, hasSession, ordersApi } from "@/lib/api";
import StarRating from "@/components/StarRating";
import PageHeader from "@/components/PageHeader";
import DeliveryActions from "@/components/DeliveryActions";
import { Alert, EmptyState, LoadingState, OrderCard } from "@/components/ui";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(null);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!hasSession()) {
        router.push("/");
        return;
      }
      try {
        setOrders(await ordersApi.active());
        setLoading(false);
        const me = await authApi.me();
        ordersApi.partnerRating(me._id).then(setRating).catch(() => {});
      } catch (error) {
        router.push(error.response?.status === 403 ? "/customer" : "/");
      }
    };
    fetchOrders();
  }, [router]);

  // Reload when any order changes (new orders, other partners accepting, ...).
  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => {
      if (hasSession()) ordersApi.active().then(setOrders).catch(() => {});
    };
    socket.on("orderUpdate", onOrderUpdate);
    return () => socket.off("orderUpdate", onOrderUpdate);
  }, [socket]);

  // Throws (with a readable message) so the OTP dialog can show the error.
  const updateStatus = async (orderId, status, otp) => {
    setError("");
    setUpdating(`${orderId}:${status}`);
    try {
      await ordersApi.updateStatus(orderId, status, otp);
      setOrders(await ordersApi.active());
    } catch (error) {
      const message = errorMessage(error, "Status update failed");
      if (status !== "Delivered") setError(message);
      throw new Error(message);
    } finally {
      setUpdating(null);
    }
  };

  const newCount = orders.filter((o) => o.status === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Dashboard"
        subtitle="Accept new orders and update their delivery status."
        actionHref="/history"
        actionLabel="View completed orders"
      />
      {rating && (
        <section className="card flex flex-wrap items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <StarRating value={rating.average || 0} />
            <span className="text-lg font-bold text-slate-900">{rating.average ?? "—"}</span>
            <span className="text-sm text-slate-500">({rating.count} rating{rating.count === 1 ? "" : "s"})</span>
          </div>
          {rating.recent[0]?.review && (
            <p className="min-w-0 flex-1 truncate text-sm text-slate-600">Latest: “{rating.recent[0].review}” — {rating.recent[0].customer}</p>
          )}
        </section>
      )}

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Active orders</h2>
          {!loading && orders.length > 0 && (
            <span className="text-sm text-slate-500">{newCount} new · {orders.length} total</span>
          )}
        </div>
        <Alert onClose={() => setError("")}>{error}</Alert>
        {loading ? (
          <LoadingState label="Loading orders…" />
        ) : orders.length === 0 ? (
          <EmptyState title="No active orders" description="New orders from customers will show up here automatically." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order}>
                <DeliveryActions order={order} updating={updating} onUpdate={updateStatus} />
              </OrderCard>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
