"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addressesApi, errorMessage, getToken } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import AddressForm from "@/components/AddressForm";
import { Alert, EmptyState, LoadingState } from "@/components/ui";

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const load = () => addressesApi.list().then(setAddresses);

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    load().catch(() => router.push("/")).finally(() => setLoading(false));
  }, [router]);

  const run = async (fn) => {
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Something went wrong"));
    }
  };

  const save = async (address) => {
    try {
      await addressesApi.add(address);
      await load();
      setAdding(false);
    } catch (err) {
      throw new Error(errorMessage(err, "Could not save address"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Saved addresses" subtitle="Pick delivery points on the map for faster checkout." actionHref="/shop" actionLabel="← Back to shop" />
      <Alert onClose={() => setError("")}>{error}</Alert>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Your addresses</h2>
          {loading ? (
            <LoadingState />
          ) : addresses.length === 0 ? (
            <EmptyState title="No saved addresses" description="Add one using the map." />
          ) : (
            <ul className="space-y-3">
              {addresses.map((a) => (
                <li key={a._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {a.label}
                        {a.isDefault && <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">Default</span>}
                      </p>
                      <p className="text-sm text-slate-600">{a.line}</p>
                      <a className="text-xs text-indigo-600 hover:underline" target="_blank" rel="noreferrer"
                        href={`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=17/${a.lat}/${a.lng}`}>
                        View on map ({a.lat.toFixed(4)}, {a.lng.toFixed(4)})
                      </a>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!a.isDefault && (
                      <button onClick={() => run(() => addressesApi.update(a._id, { isDefault: true }))} className="btn-secondary px-3 py-1.5 text-xs">
                        Make default
                      </button>
                    )}
                    <button onClick={() => window.confirm("Remove this address?") && run(() => addressesApi.remove(a._id))}
                      className="btn px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          {adding ? (
            <>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">New address</h2>
              <AddressForm onSave={save} onCancel={() => setAdding(false)} />
            </>
          ) : (
            <EmptyState title="Add a new address" description="Search, use your location, or click on the map.">
              <button onClick={() => setAdding(true)} className="btn-primary">+ Add address</button>
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
