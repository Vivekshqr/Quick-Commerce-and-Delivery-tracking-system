"use client";
import { useState } from "react";

// Shows stars; pass onChange to make it an input.
export default function StarRating({ value = 0, onChange, size = "text-xl" }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className={`inline-flex ${size}`} role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
            className={`px-0.5 leading-none transition ${n <= shown ? "text-amber-400" : "text-slate-300"} hover:scale-110`}>★</button>
        ) : (
          <span key={n} className={`leading-none ${n <= Math.round(shown) ? "text-amber-400" : "text-slate-300"}`}>★</span>
        )
      )}
    </div>
  );
}
