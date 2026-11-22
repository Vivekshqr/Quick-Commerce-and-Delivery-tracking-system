// Tiny dependency-free bar chart. data: [{ label, value }]; color = gradient stops.
export default function BarChart({ data, format = (v) => v, color = "from-brand-400 to-brand-600" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div>
      <p className="-mt-2 mb-3 text-sm text-slate-500">Total <b className="text-slate-900">{format(total)}</b></p>
      <div className="relative flex h-48 items-end gap-2 sm:gap-3">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-dashed border-line" />)}
        </div>
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-bold text-slate-600 sm:text-xs">{d.value ? format(d.value) : ""}</span>
            <div className={`w-full max-w-10 rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700 group-hover:opacity-80`}
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 2 }} title={`${d.label}: ${format(d.value)}`} />
            <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
