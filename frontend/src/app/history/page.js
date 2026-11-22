"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, getToken, ordersApi } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import PageHeader from "@/components/PageHeader";
import { EmptyState, LoadingState, OrderCard } from "@/components/ui";
import StarRating from "@/components/StarRating";

const FILTERS = ["All", "Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

export default function OrderHistory() {
  const [history, setHistory] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!getToken()) {
        router.push("/");
        return;
      }
      try {
        const user = await authApi.me();
        setRole(user.role);
        setHistory(await ordersApi.history(user._id));
        setLoading(false);
      } catch {
        router.push("/");
      }
    };
    fetchHistory();
  }, [router]);

  const dashboard = homeFor(role);
  const shown = filter === "All" ? history : history.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order History"
        subtitle={role === "delivery" ? "Orders you have handled." : "Every order you have placed."}
        actionHref={dashboard}
        actionLabel="← Back to dashboard"
      />
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
                {order.rating?.stars && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <StarRating value={order.rating.stars} size="text-base" />
                    {order.rating.review && <span className="truncate text-slate-600">“{order.rating.review}”</span>}
                  </div>
                )}
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
