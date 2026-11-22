"use client";
import { useState } from "react";

// Product picture with a soft fallback tile if the image can't load.
export default function ProductImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-3xl ${className}`} aria-label={alt}>
        🛒
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} loading="lazy" />;
}
