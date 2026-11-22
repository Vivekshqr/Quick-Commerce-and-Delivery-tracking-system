import Link from "next/link";
import { BoltIcon } from "./icons";

export default function Logo({ href = "/", compact = false }) {
  return (
    <Link href={href} className="group flex items-center gap-2" aria-label="QuickCart home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 transition group-hover:rotate-[-6deg]">
        <BoltIcon className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-slate-900">
          Quick<span className="text-brand-600">Cart</span>
        </span>
      )}
    </Link>
  );
}
