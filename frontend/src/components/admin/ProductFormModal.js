"use client";
import { useState } from "react";
import { Alert, Spinner } from "@/components/ui";
import ProductImage from "@/components/ProductImage";

const EMPTY = { name: "", category: "", price: "", stock: "", unit: "", imageUrl: "", description: "" };

export default function ProductFormModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product ? { ...EMPTY, ...product } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: form.name, category: form.category, unit: form.unit, imageUrl: form.imageUrl, description: form.description,
        price: Number(form.price), stock: Number(form.stock || 0),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{product ? "Edit product" : "Add product"}</h2>
        <Alert onClose={() => setError("")}>{error}</Alert>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label" htmlFor="p-name">Name</label><input id="p-name" className="input" value={form.name} onChange={set("name")} required /></div>
          <div><label className="label" htmlFor="p-cat">Category</label><input id="p-cat" className="input" list="cats" value={form.category} onChange={set("category")} required />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></div>
          <div><label className="label" htmlFor="p-unit">Unit</label><input id="p-unit" className="input" value={form.unit} onChange={set("unit")} placeholder="1 kg" /></div>
          <div><label className="label" htmlFor="p-price">Price (₹)</label><input id="p-price" type="number" min="0" step="0.01" className="input" value={form.price} onChange={set("price")} required /></div>
          <div><label className="label" htmlFor="p-stock">Stock</label><input id="p-stock" type="number" min="0" step="1" className="input" value={form.stock} onChange={set("stock")} required /></div>
          <div className="col-span-2"><label className="label" htmlFor="p-img">Image URL</label><input id="p-img" className="input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></div>
          {form.imageUrl && <ProductImage src={form.imageUrl} alt="preview" className="col-span-2 h-32 w-full rounded-lg" />}
          <div className="col-span-2"><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" rows={2} className="input" value={form.description} onChange={set("description")} /></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving && <Spinner className="h-4 w-4" />}Save</button>
        </div>
      </form>
    </div>
  );
}
