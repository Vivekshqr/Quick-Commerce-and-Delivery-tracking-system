export default function Alert({ children, type = "error", onClose }) {
  if (!children) return null;
  const styles = {
    success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "✓" },
    info: { box: "border-sky-200 bg-sky-50 text-sky-800", icon: "i" },
    error: { box: "border-red-200 bg-red-50 text-red-800", icon: "!" },
  }[type] || { box: "border-red-200 bg-red-50 text-red-800", icon: "!" };
  return (
    <div role="alert" className={`mb-4 flex animate-fade-up items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles.box}`}>
      <span className="flex items-start gap-2.5">
        <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-black">{styles.icon}</span>
        <span>{children}</span>
      </span>
      {onClose && (
        <button onClick={onClose} className="font-bold opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
      )}
    </div>
  );
}
