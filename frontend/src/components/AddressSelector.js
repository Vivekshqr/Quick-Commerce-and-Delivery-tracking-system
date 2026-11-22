"use client";
import { useEffect, useState } from "react";
import { addressesApi, errorMessage } from "@/lib/api";
import AddressForm from "./AddressForm";
import { LoadingState } from "@/components/ui";

// Lets the customer choose a saved address (or add one on the map). Calls onChange(address|null).
export default function AddressSelector({ value, onChange }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    addressesApi
      .list()
      .then((list) => {
        setAddresses(list);
        setAdding(list.length === 0);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) onChange(def);
      })
      .catch(() => setAdding(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (address) => {
    try {
      const saved = await addressesApi.add(address);
      const list = await addressesApi.list();
      setAddresses(list);
      onChange(list.find((a) => a._id === saved._id) || saved);
      setAdding(false);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not save address"));
    }
  };

  if (loading) return <LoadingState label="Loading addresses…" />;

  return (
    <div className="space-y-3">
      {addresses.length > 0 && (
        <div className="space-y-2" role="radiogroup" aria-label="Delivery address">
          {addresses.map((a) => (
            <label key={a._id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                value?._id === a._id ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-300 hover:border-slate-400"
              }`}>
              <input type="radio" name="address" className="mt-1 accent-indigo-600" checked={value?._id === a._id} onChange={() => onChange(a)} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  {a.label} {a.isDefault && <span className="ml-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600">Default</span>}
                </span>
                <span className="block text-xs text-slate-600">{a.line}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      {adding ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-3">
          <p className="mb-3 text-sm font-semibold text-slate-800">Add a delivery address</p>
          <AddressForm onSave={save} onCancel={addresses.length ? () => setAdding(false) : undefined} />
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          + Add new address
        </button>
      )}
    </div>
  );
}
