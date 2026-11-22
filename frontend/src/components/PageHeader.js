import Link from "next/link";

export default function PageHeader({ title, subtitle, actionHref, actionLabel }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actionHref && (
        <Link href={actionHref} className="btn-secondary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
