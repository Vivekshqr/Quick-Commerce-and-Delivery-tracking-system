import { distanceKm, etaMinutes, formatKm } from "@/lib/geo";
import { ClockIcon, MapPinIcon, TruckIcon } from "./icons";

export default function TrackingStats({ rider, destination, updatedAt }) {
  const km = distanceKm(rider, destination);
  const eta = etaMinutes(km);
  const arrived = km != null && km < 0.05;
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-3 text-white shadow-sm">
        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/80"><TruckIcon className="h-3.5 w-3.5" /> ETA</p>
        <p className="mt-1 text-xl font-black sm:text-2xl">{arrived ? "Arrived" : eta ? `${eta} min` : "—"}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-3">
        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><MapPinIcon className="h-3.5 w-3.5" /> Distance</p>
        <p className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{formatKm(km)}</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-3">
        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ClockIcon className="h-3.5 w-3.5" /> Updated</p>
        <p className="mt-1.5 text-sm font-bold text-slate-900">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}</p>
      </div>
    </div>
  );
}
