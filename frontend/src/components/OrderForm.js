"use client";
import { useState } from "react";
import { Alert, Spinner } from "@/components/ui";

// Form a customer uses to place a new order. Calls onSubmit({ product, quantity, location }).
export default function OrderForm({ onSubmit, disabled }) {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await onSubmit({ product, quantity, location });
      setProduct("");
      setQuantity(1);
      setLocation("");
      setSuccess("Order placed! A delivery partner will pick it up soon.");
    } catch (err) {
      setError(err.message || "Order placement failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card lg:col-span-2">
      <h2 className="text-lg font-semibold text-slate-900">Place an order</h2>
      <p className="mb-4 text-sm text-slate-500">Fill in the details below.</p>
      <Alert onClose={() => setError("")}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product" className="label">Product ID</label>
          <input id="product" type="text" value={product} onChange={(e) => setProduct(e.target.value)}
            className="input" placeholder="e.g. MILK-1L" required />
        </div>
        <div>
          <label htmlFor="quantity" className="label">Quantity</label>
          <input id="quantity" type="number" value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))} className="input" min="1" required />
        </div>
        <div>
          <label htmlFor="location" className="label">Delivery location</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="input" placeholder="House no., street, area" required />
        </div>
        <button type="submit" disabled={submitting || disabled} className="btn-primary w-full">
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </section>
  );
}
