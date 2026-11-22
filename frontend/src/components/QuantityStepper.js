export default function QuantityStepper({ value, onChange, max, size = "md" }) {
  const pad = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
      <button type="button" onClick={() => onChange(value - 1)} className={`${pad} text-lg font-bold transition hover:bg-brand-700 active:scale-90`} aria-label="Decrease">−</button>
      <span key={value} className="min-w-7 animate-pop text-center text-sm font-bold">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={max !== undefined && value >= max}
        className={`${pad} text-lg font-bold transition hover:bg-brand-700 active:scale-90 disabled:opacity-40`} aria-label="Increase">+</button>
    </div>
  );
}
