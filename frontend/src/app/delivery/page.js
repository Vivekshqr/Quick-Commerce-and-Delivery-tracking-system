"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/lib/useSocket";
import { errorMessage, getToken, ordersApi } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import DeliveryActions from "@/components/DeliveryActions";
import { Alert, EmptyState, LoadingState, OrderCard } from "@/components/ui";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!getToken()) {
        router.push("/");
        return;
      }
      try {
        setOrders(await ordersApi.active());
        setLoading(false);
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
      if (getToken()) ordersApi.active().then(setOrders).catch(() => {});
    };
    socket.on("orderUpdate", onOrderUpdate);
    return () => socket.off("orderUpdate", onOrderUpdate);
  }, [socket]);

  const updateStatus = async (orderId, status) => {
    setError("");
    setUpdating(`${orderId}:${status}`);
    try {
      await ordersApi.updateStatus(orderId, status);
      setOrders(await ordersApi.active());
    } catch (error) {
      console.error("Status update failed:", error);
      setError(errorMessage(error, "Status update failed"));
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
