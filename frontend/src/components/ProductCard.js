"use client";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";

export default function ProductCard({ product }) {
  const cart = useCart();
  const inCart = cart.quantityOf(product._id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-3">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{product.category}</span>
        <p className="mt-0.5 line-clamp-2 font-semibold text-slate-900">{product.name}</p>
        <p className="text-xs text-slate-500">{product.unit}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div>
            <p className="font-bold text-slate-900">{formatPrice(product.price)}</p>
            <p className={`text-xs ${product.stock < 10 ? "text-amber-600" : "text-slate-400"}`}>
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </p>
          </div>
          {inCart > 0 ? (
            <QuantityStepper size="sm" value={inCart} max={product.stock}
              onChange={(q) => cart.setQuantity(product._id, q)} />
          ) : (
            <button onClick={() => cart.add(product)} disabled={outOfStock} className="btn-primary px-3 py-2">
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
