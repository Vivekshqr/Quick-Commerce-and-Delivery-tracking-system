"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSocket from "@/lib/useSocket";
import { Alert, EmptyState, LoadingState, OrderCard, Spinner } from "@/components/ui";

const STEPS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];
const ACTIONS = [
  { status: "Accepted", label: "Accept" },
  { status: "Out for Delivery", label: "Out for delivery" },
  { status: "Delivered", label: "Mark delivered" },
];

export default function DeliveryDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const socket = useSocket();

  const loadOrders = async (token) => {
    const { data } = await axios.get("/api/orders/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingOrders(data);
  };

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => {
      const token = localStorage.getItem("token");
      if (token) loadOrders(token).catch(() => {});
    };
    socket.on("orderUpdate", onOrderUpdate);
    return () => socket.off("orderUpdate", onOrderUpdate);
  }, [socket]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        await loadOrders(token);
        setLoading(false);
      } catch (error) {
        router.push(error.response?.status === 403 ? "/customer" : "/");
      }
    };
    fetchPendingOrders();
  }, [router]);

  const updateStatus = async (orderId, status) => {
    setError("");
    setUpdating(`${orderId}:${status}`);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadOrders(token);
    } catch (error) {
      console.error("Status update failed:", error);
      setError(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdating(null);
    }
  };

  const newCount = pendingOrders.filter((o) => o.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Delivery Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Accept new orders and update their delivery status.</p>
        </div>
        <Link href="/history" className="btn-secondary">View completed orders</Link>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Active orders</h2>
          {!loading && pendingOrders.length > 0 && (
            <span className="text-sm text-slate-500">{newCount} new · {pendingOrders.length} total</span>
          )}
        </div>
        <Alert onClose={() => setError("")}>{error}</Alert>
        {loading ? (
          <LoadingState label="Loading orders…" />
        ) : pendingOrders.length === 0 ? (
          <EmptyState title="No active orders" description="New orders from customers will show up here automatically." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pendingOrders.map((order) => {
              const current = STEPS.indexOf(order.status);
              return (
                <OrderCard key={order._id} order={order}>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {ACTIONS.map((a) => {
                      const step = STEPS.indexOf(a.status);
                      const isNext = step === current + 1;
                      const busy = updating === `${order._id}:${a.status}`;
                      return (
                        <button
                          key={a.status}
                          onClick={() => updateStatus(order._id, a.status)}
                          disabled={step <= current || updating !== null}
                          className={`${isNext ? "btn-primary" : "btn-secondary"} flex-1 px-3 py-2 text-xs sm:text-sm`}
                        >
                          {busy && <Spinner className="h-4 w-4" />}
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </OrderCard>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
