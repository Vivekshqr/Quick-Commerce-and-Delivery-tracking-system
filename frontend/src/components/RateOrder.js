"use client";
import { useState } from "react";
import { errorMessage, ordersApi } from "@/lib/api";
import StarRating from "./StarRating";
import { Alert, Spinner } from "@/components/ui";

// Rating form shown on a delivered order (once).
export default function RateOrder({ order, onRated }) {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (order.rating?.stars) {
    return (
      <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">
        <div className="flex items-center gap-2"><StarRating value={order.rating.stars} size="text-base" /><span className="text-xs text-amber-800">Your rating</span></div>
        {order.rating.review && <p className="mt-1 text-slate-700">“{order.rating.review}”</p>}
      </div>
    );
  }

  const submit = async () => {
    if (!stars) return setError("Choose 1 to 5 stars.");
    setSaving(true);
    setError("");
    try {
      const updated = await ordersApi.rate(order._id, stars, review);
      onRated?.(updated);
    } catch (err) {
      setError(errorMessage(err, "Could not save rating"));
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <p className="text-sm font-semibold text-slate-800">How was your delivery{order.deliveryPartnerId?.name ? ` with ${order.deliveryPartnerId.name}` : ""}?</p>
      <Alert onClose={() => setError("")}>{error}</Alert>
      <StarRating value={stars} onChange={setStars} size="text-2xl" />
      <textarea rows={2} value={review} onChange={(e) => setReview(e.target.value)} maxLength={500} className="input text-sm" placeholder="Write a short review (optional)" aria-label="Review" />
      <button onClick={submit} disabled={saving} className="btn-primary w-full py-2">{saving && <Spinner className="h-4 w-4" />}Submit rating</button>
    </div>
  );
}
