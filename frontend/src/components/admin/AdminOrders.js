"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi, errorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import useSocket from "@/lib/useSocket";
import { Alert, EmptyState, LoadingState, StatusBadge } from "@/components/ui";

const FILTERS = ["All", "Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);
  const socket = useSocket();

  const load = useCallback(() => adminApi.orders(filter === "All" ? undefined : filter).then(setOrders), [filter]);

  useEffect(() => {
    setLoading(true);
    load().catch((err) => setError(errorMessage(err, "Could not load orders"))).finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    adminApi.partners().then(setPartners).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load().catch(() => {});
    socket.on("orderUpdate", refresh);
    return () => socket.off("orderUpdate", refresh);
  }, [socket, load]);

  const assign = async (orderId, partnerId) => {
    if (!partnerId) return;
    setError("");
    setSaving(orderId);
    try {
      await adminApi.assign(orderId, partnerId);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not assign partner"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="card">
      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      <Alert onClose={() => setError("")}>{error}</Alert>
      {loading ? (
        <LoadingState label="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" />
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-3">Order</th><th className="py-2 pr-3">Customer</th><th className="py-2 pr-3">Items</th>
                <th className="py-2 pr-3 text-right">Total</th><th className="py-2 pr-3">Status</th><th className="py-2">Delivery partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const locked = ["Delivered", "Cancelled"].includes(o.status);
                return (
                  <tr key={o._id} className="align-top">
                    <td className="py-3 pr-3">
                      <p className="font-mono text-xs font-semibold text-slate-800">#{o._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : ""}</p>
                    </td>
                    <td className="py-3 pr-3"><p className="text-slate-800">{o.customerId?.name || "—"}</p><p className="max-w-48 truncate text-xs text-slate-400">{o.location}</p></td>
                    <td className="max-w-56 py-3 pr-3 text-slate-700"><p className="line-clamp-2">{o.product}</p></td>
                    <td className="py-3 pr-3 text-right font-medium">{o.total != null ? formatPrice(o.total) : "—"}</td>
                    <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                    <td className="py-3">
                      {locked ? (
                        <span className="text-slate-700">{o.deliveryPartnerId?.name || "—"}</span>
                      ) : (
                        <select aria-label="Assign partner" className="input py-1.5 text-sm" disabled={saving === o._id || partners.length === 0}
                          value={o.deliveryPartnerId?._id || ""} onChange={(e) => assign(o._id, e.target.value)}>
                          <option value="">{partners.length ? "Assign partner…" : "No partners yet"}</option>
                          {partners.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
