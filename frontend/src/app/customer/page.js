"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSocket from "@/lib/useSocket";
import { authApi, errorMessage, getToken, ordersApi } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import PageHeader from "@/components/PageHeader";
import OrderForm from "@/components/OrderForm";
import { Alert, EmptyState, LoadingState, OrderCard } from "@/components/ui";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placed, setPlaced] = useState(false);
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      if (!getToken()) {
        router.push("/");
        return;
      }
      try {
        const user = await authApi.me();
        if (user.role !== "customer") {
          router.push(homeFor(user.role));
          return;
        }
        setUserId(user._id);
        setOrders(await ordersApi.forCustomer(user._id));
        setLoading(false);
      } catch {
        router.push("/");
      }
    };
    setPlaced(new URLSearchParams(window.location.search).has("placed"));
    fetchUserAndOrders();
  }, [router]);

  // Live status updates pushed by the backend.
  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = ({ orderId, status }) => {
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)));
    };
    socket.on("orderUpdate", onOrderUpdate);
    return () => socket.off("orderUpdate", onOrderUpdate);
  }, [socket]);

  const placeOrder = async (order) => {
    try {
      await ordersApi.create(order);
      setOrders(await ordersApi.forCustomer(userId));
    } catch (error) {
      console.error("Order placement failed:", error);
      throw new Error(errorMessage(error, "Order placement failed"));
    }
  };

  const active = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Dashboard"
        subtitle="Place new orders and track them live."
        actionHref="/shop"
        actionLabel="🛒 Browse the shop"
      />
      {placed && <Alert type="success" onClose={() => setPlaced(false)}>Order placed! You can track it below.</Alert>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <OrderForm onSubmit={placeOrder} disabled={!userId} />
        <section className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your orders</h2>
            {!loading && orders.length > 0 && (
              <span className="text-sm text-slate-500">{active} active · {orders.length} total</span>
            )}
          </div>
          {loading ? (
            <LoadingState label="Loading your orders…" />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Your orders will appear here once you place one." />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order}>
                  {["Accepted", "Out for Delivery"].includes(order.status) && (
                    <Link href={`/track/${order._id}`} className="btn-primary mt-3 w-full py-2">
                      {order.status === "Out for Delivery" ? "📍 Track live" : "View tracking"}
                    </Link>
                  )}
                </OrderCard>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
