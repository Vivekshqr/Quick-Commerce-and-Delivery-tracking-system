"use client";
import { useCallback, useEffect, useState } from "react";
import { adminApi, errorMessage, productsApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import ProductFormModal from "./ProductFormModal";
import { Alert, LoadingState } from "@/components/ui";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // product, "new" or null
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([productsApi.list(), productsApi.categories()]);
    setProducts(p);
    setCategories(c);
  }, []);

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err, "Could not load products"))).finally(() => setLoading(false));
  }, [load]);

  const save = async (data) => {
    try {
      if (editing === "new") await adminApi.createProduct(data);
      else await adminApi.updateProduct(editing._id, data);
      setEditing(null);
      await load();
    } catch (err) {
      throw new Error(errorMessage(err, "Could not save product"));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? Past orders keep their copy of the item.`)) return;
    setError("");
    try {
      await adminApi.deleteProduct(p._id);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Could not delete product"));
    }
  };

  const shown = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="search" className="input max-w-xs" placeholder="Filter products…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter products" />
        <button onClick={() => setEditing("new")} className="btn-primary ml-auto">+ Add product</button>
      </div>
      <Alert onClose={() => setError("")}>{error}</Alert>
      {loading ? (
        <LoadingState label="Loading products…" />
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-2 pr-3">Product</th><th className="py-2 pr-3">Category</th><th className="py-2 pr-3 text-right">Price</th>
                <th className="py-2 pr-3 text-right">Stock</th><th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((p) => (
                <tr key={p._id}>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.imageUrl} alt={p.name} className="h-10 w-10 shrink-0 rounded-md" />
                      <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-400">{p.unit}</p></div>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-slate-700">{p.category}</td>
                  <td className="py-2 pr-3 text-right font-medium">{formatPrice(p.price)}</td>
                  <td className={`py-2 pr-3 text-right font-semibold ${p.stock < 10 ? "text-amber-600" : "text-slate-800"}`}>{p.stock}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => setEditing(p)} className="btn-secondary px-3 py-1.5 text-xs">Edit</button>
                    <button onClick={() => remove(p)} className="btn ml-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <ProductFormModal product={editing === "new" ? null : editing} categories={categories} onSave={save} onClose={() => setEditing(null)} />
      )}
    </section>
  );
}
