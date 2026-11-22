export default function QuantityStepper({ value, onChange, max, size = "md" }) {
  const pad = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <div className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50">
      <button type="button" onClick={() => onChange(value - 1)} className={`${pad} font-bold text-indigo-700 hover:bg-indigo-100 rounded-l-lg`} aria-label="Decrease">−</button>
      <span className="min-w-8 text-center text-sm font-semibold text-indigo-900">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={max !== undefined && value >= max}
        className={`${pad} font-bold text-indigo-700 hover:bg-indigo-100 rounded-r-lg disabled:opacity-40`} aria-label="Increase">+</button>
    </div>
  );
}
