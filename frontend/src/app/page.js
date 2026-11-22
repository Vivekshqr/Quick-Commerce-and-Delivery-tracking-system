"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authApi, hasSession, productsApi } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import { ArrowRightIcon, BoltIcon, ClockIcon, MapPinIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui";

const FEATURES = [
  { icon: BoltIcon, title: "Minutes, not hours", text: "Order fruits, dairy and daily staples and get them fast from the nearest store." },
  { icon: MapPinIcon, title: "Live rider tracking", text: "Follow your delivery partner on the map with a live ETA." },
  { icon: ShieldIcon, title: "Safe handover", text: "Every order has a 4-digit OTP that only you can see." },
  { icon: StarIcon, title: "Rate your delivery", text: "Tell us how it went and help great partners shine." },
];

const CATEGORY_EMOJI = { Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞", Snacks: "🍫", Beverages: "🧃", Staples: "🌾", Household: "🧴" };

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (hasSession()) authApi.me().then(setUser).catch(() => {});
    productsApi.list().then((p) => setProducts(p.slice(0, 8))).catch(() => setProducts([]));
    productsApi.categories().then(setCategories).catch(() => {});
  }, []);

  const primary = user ? { href: user.role === "customer" ? "/shop" : homeFor(user.role), label: user.role === "customer" ? "Start shopping" : "Go to dashboard" } : { href: "/register", label: "Get started, it's free" };

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-12 text-white shadow-lift sm:px-12 sm:py-16">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
              <ClockIcon className="h-4 w-4" /> Delivery in ~15 minutes
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Groceries at your door, <span className="text-accent-300">in minutes.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">
              Fresh fruits, dairy, snacks and daily essentials, with live tracking from the store to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primary.href} className="btn-accent px-6 py-3 text-base">
                {primary.label} <ArrowRightIcon className="h-4 w-4" />
              </Link>
              {!user && <Link href="/login" className="btn rounded-xl border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">I have an account</Link>}
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[["20+", "Products"], ["15 min", "Avg. delivery"], ["4.8★", "Rider rating"]].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                  <dt className="text-xl font-extrabold">{v}</dt>
                  <dd className="text-xs text-white/75">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden lg:block">
            <div className="ml-auto max-w-sm rotate-2 rounded-3xl bg-surface p-5 text-slate-900 shadow-2xl transition hover:rotate-0">
              <div className="flex items-center justify-between">
                <p className="font-bold">Order #QC4821</p>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">Out for Delivery</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1">{[1, 1, 1, 0].map((on, i) => <div key={i} className={`h-1.5 rounded-full ${on ? "bg-brand-500" : "bg-slate-200"}`} />)}</div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
                <span className="text-3xl animate-float">🛵</span>
                <div>
                  <p className="text-sm text-slate-600">Arriving in</p>
                  <p className="text-2xl font-black text-brand-700">6 min</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-500">Delivery OTP</p>
                  <p className="font-mono text-lg font-bold tracking-widest">4 2 8 1</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {[["🥛 Toned Milk ×2", "₹112"], ["🍌 Bananas ×1", "₹49"], ["🍞 Brown Bread ×1", "₹50"]].map(([a, b]) => (
                  <li key={a} className="flex justify-between"><span className="text-slate-700">{a}</span><span className="font-semibold">{b}</span></li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-6 left-6 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl">
              <TruckIcon className="h-5 w-5 text-brand-600" /> Rider is 1.2 km away
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Shop by category</h2>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {categories.map((c) => (
              <Link key={c} href={user?.role === "customer" ? `/shop?category=${encodeURIComponent(c)}` : "/register"}
                className="lift flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center">
                <span className="text-3xl">{CATEGORY_EMOJI[c] || "🛍️"}</span>
                <span className="text-xs font-semibold text-slate-700">{c}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular products */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Popular right now</h2>
          <Link href={user ? "/shop" : "/register"} className="text-sm font-bold text-brand-600 hover:underline">See all →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(products || Array.from({ length: 8 })).map((p, i) =>
            p ? (
              <div key={p._id} className="lift overflow-hidden rounded-2xl border border-line bg-surface">
                <ProductImage src={p.imageUrl} alt={p.name} className="aspect-[4/3] w-full" />
                <div className="p-3">
                  <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.unit}</p>
                  <p className="mt-1 font-extrabold text-slate-900">{formatPrice(p.price)}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card lift p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></span>
            <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      {!user && (
        <section className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-8 text-center shadow-card sm:flex-row sm:text-left">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Deliver with QuickCart</h2>
            <p className="text-sm text-slate-600">Sign up as a delivery partner, accept orders and earn on your schedule.</p>
          </div>
          <Link href="/register" className="btn-primary px-6 py-3">Become a partner</Link>
        </section>
      )}
    </div>
  );
}
