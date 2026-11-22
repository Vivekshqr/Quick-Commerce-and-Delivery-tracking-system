"use client";
import { useEffect, useState } from "react";
import { adminApi, errorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import BarChart from "./BarChart";
import { BoxIcon, ChartIcon, TagIcon, TruckIcon, UsersIcon } from "@/components/icons";
import { Alert, LoadingState, StatusBadge } from "@/components/ui";

const STATUSES = ["Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

const TONES = {
  brand: "bg-brand-50 text-brand-600",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

function Stat({ label, value, hint, icon: Icon, tone = "brand" }) {
  return (
    <div className="card lift relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}><Icon className="h-5 w-5" /></span>}
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function StatsOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.stats().then(setStats).catch((err) => setError(errorMessage(err, "Could not load stats")));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <LoadingState label="Loading stats…" />;

  const day = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });
  const totalStatus = Object.values(stats.byStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={ChartIcon} label="Revenue" value={formatPrice(stats.totals.revenue)} hint="catalogue orders" />
        <Stat icon={BoxIcon} tone="sky" label="Orders" value={stats.totals.orders} />
        <Stat icon={UsersIcon} tone="violet" label="Customers" value={stats.totals.customers} />
        <Stat icon={TruckIcon} tone="amber" label="Partners" value={stats.totals.partners} />
        <Stat icon={TagIcon} tone="emerald" label="Products" value={stats.totals.products} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card">
          <h3 className="mb-4 font-bold text-slate-900">Revenue, last 7 days</h3>
          <BarChart data={stats.last7Days.map((d) => ({ label: day(d.date), value: d.revenue }))} format={(v) => `₹${Math.round(v)}`} />
        </section>
        <section className="card">
          <h3 className="mb-4 font-bold text-slate-900">Orders, last 7 days</h3>
          <BarChart color="from-sky-400 to-sky-600" data={stats.last7Days.map((d) => ({ label: day(d.date), value: d.orders }))} />
        </section>
        <section className="card">
          <h3 className="mb-4 font-bold text-slate-900">Orders by status</h3>
          <ul className="space-y-3">
            {STATUSES.filter((s) => stats.byStatus[s] || s !== "Cancelled").map((s) => (
              <li key={s} className="flex items-center gap-3">
                <span className="w-36 shrink-0"><StatusBadge status={s} /></span>
                <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700" style={{ width: `${((stats.byStatus[s] || 0) / totalStatus) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-slate-700">{stats.byStatus[s] || 0}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3 className="mb-4 font-bold text-slate-900">Top products</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No catalogue sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-slate-500"><th className="pb-2">Product</th><th className="pb-2 text-right">Sold</th><th className="pb-2 text-right">Revenue</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {stats.topProducts.map((p) => (
                  <tr key={p.name}><td className="py-2 text-slate-800">{p.name}</td><td className="py-2 text-right">{p.quantity}</td><td className="py-2 text-right font-medium">{formatPrice(p.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {stats.lowStock.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <b>Low stock:</b> {stats.lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
