"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi, errorMessage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { Alert, EmptyState, LoadingState } from "@/components/ui";

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
      <PageHeader title="Shop" subtitle="Fresh groceries delivered in minutes." actionHref="/cart"
        actionLabel={`Cart (${cart.count})`} />

      <div className="card space-y-4 p-4">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for milk, bread, fruits…" className="input pl-10" aria-label="Search products" />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {["All", ...categories].map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                category === c ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <Alert>{error}</Alert>
      {loading ? (
        <LoadingState label="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-10 px-4">
          <Link href="/cart"
            className="mx-auto flex max-w-md items-center justify-between rounded-xl bg-indigo-600 px-5 py-3 text-white shadow-lg hover:bg-indigo-700">
            <span className="text-sm font-medium">{cart.count} item{cart.count > 1 ? "s" : ""} · {formatPrice(cart.total)}</span>
            <span className="font-semibold">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
