import { distanceKm, etaMinutes, formatKm } from "@/lib/geo";

export default function TrackingStats({ rider, destination, updatedAt }) {
  const km = distanceKm(rider, destination);
  const eta = etaMinutes(km);
  const arrived = km != null && km < 0.05;
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="rounded-xl bg-indigo-50 p-3">
        <p className="text-xs font-medium text-indigo-700">ETA</p>
        <p className="text-xl font-bold text-indigo-900">{arrived ? "Arrived" : eta ? `${eta} min` : "—"}</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500">Distance</p>
        <p className="text-xl font-bold text-slate-900">{formatKm(km)}</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500">Last update</p>
        <p className="text-sm font-semibold text-slate-900">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}</p>
      </div>
    </div>
  );
}
