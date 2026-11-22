const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-800 ring-amber-200",
  Accepted: "bg-sky-50 text-sky-800 ring-sky-200",
  "Out for Delivery": "bg-violet-50 text-violet-800 ring-violet-200",
  Delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};
const STATUS_DOTS = {
  Pending: "bg-amber-500",
  Accepted: "bg-sky-500",
  "Out for Delivery": "bg-violet-500",
  Delivered: "bg-emerald-500",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}
