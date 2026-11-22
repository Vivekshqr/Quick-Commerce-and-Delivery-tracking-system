"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cart";

// Cart lines: { productId, name, price, imageUrl, unit, stock, quantity }. Saved in localStorage.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          unit: product.unit,
          stock: product.stock,
          quantity: Math.min(qty, product.stock),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i))
    );
  }, []);

  const remove = useCallback((productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const quantityOf = (id) => items.find((i) => i.productId === id)?.quantity || 0;
    return { items, count, total, loaded, add, setQuantity, remove, clear, quantityOf };
  }, [items, loaded, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
