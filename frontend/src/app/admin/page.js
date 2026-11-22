"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, hasSession } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import PageHeader from "@/components/PageHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import { LoadingState } from "@/components/ui";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
];

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!hasSession()) {
      router.push("/");
      return;
    }
    authApi
      .me()
      .then((u) => (u.role === "admin" ? setReady(true) : router.push(homeFor(u.role))))
      .catch(() => router.push("/"));
    const t = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some((x) => x.id === t)) setTab(t);
  }, [router]);

  const choose = (id) => {
    setTab(id);
    window.history.replaceState(null, "", `/admin?tab=${id}`);
  };

  if (!ready) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" subtitle="Sales, orders, delivery partners and the product catalogue." />
      <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1 sm:w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => choose(t.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <StatsOverview />}
      {tab === "orders" && <AdminOrders />}
      {tab === "products" && <AdminProducts />}
    </div>
  );
}
