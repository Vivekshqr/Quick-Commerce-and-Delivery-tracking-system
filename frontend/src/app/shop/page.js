"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi, errorMessage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import { CartIcon, ClockIcon, SearchIcon } from "@/components/icons";
import { Alert, EmptyState, ProductSkeleton } from "@/components/ui";

const CATEGORY_EMOJI = { All: "✨", Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞", Snacks: "🍫", Beverages: "🧃", Staples: "🌾", Household: "🧴" };

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cart = useCart();

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c) setCategory(c);
    productsApi.categories().then(setCategories).catch(() => {});
  }, []);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ q: search || undefined, category: category === "All" ? undefined : category })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(errorMessage(err, "Could not load products")))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-6 pb-24">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white shadow-card sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-400/30 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold"><ClockIcon className="h-3.5 w-3.5" /> Delivery in minutes</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">What do you need today?</h1>
            <p className="mt-1 text-sm text-white/80">Fresh groceries and daily essentials, delivered fast.</p>
          </div>
          <span className="hidden text-6xl sm:block animate-float">🧺</span>
        </div>
      </section>

      <div className="sticky top-16 z-10 -mx-4 space-y-3 bg-page/85 px-4 py-3 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:border sm:border-line sm:bg-surface/90 sm:p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for milk, bread, fruits…" className="input rounded-2xl py-3 pl-11" aria-label="Search products" />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {["All", ...categories].map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`chip ${category === c ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30" : "border border-line bg-surface text-slate-700 hover:border-brand-300 hover:text-brand-700"}`}>
              <span>{CATEGORY_EMOJI[c] || "🛍️"}</span>{c}
            </button>
          ))}
        </div>
      </div>

      <Alert>{error}</Alert>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon="🔍" title="No products found" description="Try a different search or category." />
      ) : (
        <>
          <p className="text-sm text-slate-500">{products.length} product{products.length === 1 ? "" : "s"}{category !== "All" && <> in <b className="text-slate-800">{category}</b></>}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}

      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-10 px-4">
          <Link href="/cart"
            className="mx-auto flex max-w-md animate-fade-up items-center justify-between rounded-2xl bg-brand-600 px-5 py-3.5 text-white shadow-lift transition hover:bg-brand-700">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><CartIcon className="h-5 w-5" /></span>
              <span className="text-sm leading-tight"><b className="block">{cart.count} item{cart.count > 1 ? "s" : ""}</b>{formatPrice(cart.total)}</span>
            </span>
            <span className="font-bold">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
