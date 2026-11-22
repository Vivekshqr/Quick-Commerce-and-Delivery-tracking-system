import Link from "next/link";

export default function PageHeader({ title, subtitle, actionHref, actionLabel, eyebrow, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {actionHref && <Link href={actionHref} className="btn-secondary">{actionLabel}</Link>}
      </div>
    </div>
  );
}
