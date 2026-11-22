// Tiny dependency-free bar chart. data: [{ label, value }]
export default function BarChart({ data, format = (v) => v, color = "bg-indigo-500" }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-2 sm:gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] font-semibold text-slate-600 sm:text-xs">{d.value ? format(d.value) : ""}</span>
          <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 2 }}
            title={`${d.label}: ${format(d.value)}`} />
          <span className="text-[10px] text-slate-500 sm:text-xs">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
