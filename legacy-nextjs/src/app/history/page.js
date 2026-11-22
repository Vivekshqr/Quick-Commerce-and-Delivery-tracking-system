"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState, LoadingState, OrderCard } from "@/components/ui";

const FILTERS = ["All", "Pending", "Accepted", "Out for Delivery", "Delivered"];

export default function OrderHistory() {
  const [history, setHistory] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const userResponse = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(userResponse.data.role);
        const { data } = await axios.get(`/api/orders/history/${userResponse.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(data);
        setLoading(false);
      } catch {
        router.push("/");
      }
    };
    fetchHistory();
  }, [router]);

  const dashboard = role === "delivery" ? "/delivery" : "/customer";
  const shown = filter === "All" ? history : history.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Order History</h1>
          <p className="mt-1 text-sm text-slate-500">
            {role === "delivery" ? "Orders you have handled." : "Every order you have placed."}
          </p>
        </div>
        <Link href={dashboard} className="btn-secondary">← Back to dashboard</Link>
      </div>

      <section className="card">
        <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f}
              {f !== "All" && !loading && (
                <span className="ml-1 opacity-70">{history.filter((o) => o.status === f).length}</span>
              )}
            </button>
          ))}
        </div>
        {loading ? (
          <LoadingState label="Loading history…" />
        ) : shown.length === 0 ? (
          <EmptyState
            title={history.length === 0 ? "No orders in history" : `No ${filter.toLowerCase()} orders`}
            description={history.length === 0 ? "Orders will be listed here once there is some activity." : undefined}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {shown.map((order) => (
              <OrderCard key={order._id} order={order}>
                {(order.customerId?.name || order.deliveryPartnerId?.name) && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {order.customerId?.name && <span>Customer: <b className="text-slate-700">{order.customerId.name}</b></span>}
                    {order.deliveryPartnerId?.name && <span>Partner: <b className="text-slate-700">{order.deliveryPartnerId.name}</b></span>}
                  </div>
                )}
              </OrderCard>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
