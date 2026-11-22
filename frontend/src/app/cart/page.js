"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, errorMessage, getToken, ordersApi } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import ProductImage from "@/components/ProductImage";
import QuantityStepper from "@/components/QuantityStepper";
import { Alert, EmptyState, Spinner } from "@/components/ui";

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    authApi.me().then((u) => u.role !== "customer" && router.push("/delivery")).catch(() => router.push("/"));
  }, [router]);

  const checkout = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      await ordersApi.create({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        location,
      });
      cart.clear();
      router.push("/customer?placed=1");
    } catch (err) {
      setError(errorMessage(err, "Checkout failed"));
      setPlacing(false);
    }
  };

  if (!cart.loaded) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Your cart" subtitle="Review items and check out." actionHref="/shop" actionLabel="← Continue shopping" />
      {cart.items.length === 0 ? (
        <div className="card">
          <EmptyState title="Your cart is empty" description="Add some groceries from the shop.">
            <Link href="/shop" className="btn-primary">Browse products</Link>
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="card lg:col-span-3">
            <ul className="divide-y divide-slate-100">
              {cart.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 py-3">
                  <ProductImage src={i.imageUrl} alt={i.name} className="h-16 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{i.name}</p>
                    <p className="text-xs text-slate-500">{i.unit} · {formatPrice(i.price)} each</p>
                    <button onClick={() => cart.remove(i.productId)} className="mt-1 text-xs font-medium text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <QuantityStepper size="sm" value={i.quantity} max={i.stock} onChange={(q) => cart.setQuantity(i.productId, q)} />
                    <span className="text-sm font-semibold text-slate-900">{formatPrice(i.price * i.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="card h-fit lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Items</dt><dd className="font-medium">{cart.count}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd className="font-medium text-emerald-600">Free</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-bold">{formatPrice(cart.total)}</dd></div>
            </dl>
            <form onSubmit={checkout} className="mt-4 space-y-4">
              <Alert onClose={() => setError("")}>{error}</Alert>
              <div>
                <label htmlFor="location" className="label">Delivery location</label>
                <input id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="input" placeholder="House no., street, area" required />
              </div>
              <button type="submit" disabled={placing} className="btn-primary w-full">
                {placing && <Spinner className="h-4 w-4" />}
                {placing ? "Placing order…" : `Place order · ${formatPrice(cart.total)}`}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
