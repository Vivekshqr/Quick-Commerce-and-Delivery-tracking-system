"use client";
import { useState } from "react";
import { reverseGeocode, searchPlaces } from "@/lib/geocode";
import { Alert, Spinner } from "@/components/ui";

import { LocationPickerMap } from "./map";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bengaluru
const LABELS = ["Home", "Work", "Other"];

// Add a saved address: search or click on the map, or use the device location.
export default function AddressForm({ onSave, onCancel }) {
  const [label, setLabel] = useState("Home");
  const [line, setLine] = useState("");
  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const pick = async (pos, text) => {
    setPosition(pos);
    if (text) setLine(text);
    else {
      setBusy("Looking up address…");
      const found = await reverseGeocode(pos);
      if (found) setLine(found);
      setBusy("");
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setBusy("Searching…");
    setError("");
    try {
      const r = await searchPlaces(query);
      setResults(r);
      if (!r.length) setError("No places found. Try another search or click on the map.");
    } catch {
      setError("Search is unavailable right now. Click on the map instead.");
    }
    setBusy("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError("Your browser doesn't support location.");
    setBusy("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (p) => pick({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { setBusy(""); setError("Couldn't get your location. Allow location access or click on the map."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async () => {
    setError("");
    if (!position) return setError("Pick the delivery point on the map.");
    if (!line.trim()) return setError("Enter the address text.");
    setBusy("Saving…");
    try {
      await onSave({ label, line, lat: position.lat, lng: position.lng });
    } catch (err) {
      setError(err.message || "Could not save address");
      setBusy("");
    }
  };

  return (
    <div className="space-y-4">
      <Alert onClose={() => setError("")}>{error}</Alert>
      {/* Not a <form>: this component is used inside the checkout form. */}
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="input" placeholder="Search area, street or landmark"
          aria-label="Search place" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search(); } }} />
        <button type="button" onClick={search} className="btn-secondary">Search</button>
      </div>
      {results.length > 0 && (
        <ul className="max-h-40 overflow-auto rounded-lg border border-slate-200 text-sm">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button type="button" onClick={() => { pick({ lat: r.lat, lng: r.lng }, r.label); setResults([]); }}
                className="w-full px-3 py-2 text-left hover:bg-brand-50">{r.label}</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Click the map or drag the pin to the exact spot.</p>
        <button type="button" onClick={useMyLocation} className="btn-secondary px-3 py-1.5 text-xs">📍 Use my location</button>
      </div>
      <LocationPickerMap position={position} onPick={(p) => pick(p)} center={DEFAULT_CENTER} />
      {position && <p className="text-xs text-slate-400">Lat {position.lat.toFixed(5)}, Lng {position.lng.toFixed(5)}</p>}
      <div>
        <span className="label">Label</span>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <button type="button" key={l} onClick={() => setLabel(l)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${label === l ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="addr-line" className="label">Address (house no., street, area)</label>
        <textarea id="addr-line" value={line} onChange={(e) => setLine(e.target.value)} rows={2} className="input" placeholder="Flat 4B, 12 MG Road, Bengaluru" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={!!busy} className="btn-primary flex-1">
          {busy && <Spinner className="h-4 w-4" />}{busy || "Save address"}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
      </div>
    </div>
  );
}
