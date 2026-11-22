import dynamic from "next/dynamic";

const placeholder = () => (
  <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">Loading map…</div>
);

// Leaflet needs the browser, so maps are loaded client-side only.
export const TrackingMap = dynamic(() => import("./TrackingMap"), { ssr: false, loading: placeholder });
export const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false, loading: placeholder });
