"use client";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";

export default function ProductCard({ product }) {
  const cart = useCart();
  const inCart = cart.quantityOf(product._id);
  const outOfStock = product.stock <= 0;
  const low = !outOfStock && product.stock < 10;

  return (
    <div className={`lift group flex flex-col overflow-hidden rounded-2xl border bg-surface ${inCart ? "border-brand-300 ring-2 ring-brand-100" : "border-line"}`}>
      <div className="relative overflow-hidden">
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full transition duration-300 group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 backdrop-blur">⚡ 10 min</span>
        {(low || outOfStock) && (
          <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${outOfStock ? "bg-black/70 text-white" : "bg-amber-400 text-slate-950"}`}>
            {outOfStock ? "Sold out" : `Only ${product.stock} left`}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{product.category}</span>
        <p className="mt-0.5 line-clamp-2 font-bold leading-snug text-slate-900">{product.name}</p>
        <p className="text-xs text-slate-500">{product.unit}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-lg font-extrabold text-slate-900">{formatPrice(product.price)}</p>
          {inCart > 0 ? (
            <QuantityStepper size="sm" value={inCart} max={product.stock} onChange={(q) => cart.setQuantity(product._id, q)} />
          ) : (
            <button onClick={() => cart.add(product)} disabled={outOfStock}
              className="btn rounded-xl border-2 border-brand-600 px-4 py-1.5 font-bold text-brand-700 hover:bg-brand-600 hover:text-white">
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
