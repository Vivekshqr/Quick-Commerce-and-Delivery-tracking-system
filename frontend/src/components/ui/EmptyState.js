export default function EmptyState({ title, description, children, icon = "📦" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-brand-50 text-3xl">{icon}</div>
      <p className="text-base font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
