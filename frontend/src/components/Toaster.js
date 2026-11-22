"use client";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";

const ACCENT = {
  Pending: "border-l-amber-500",
  Accepted: "border-l-sky-500",
  "Out for Delivery": "border-l-violet-500",
  Delivered: "border-l-emerald-500",
  Cancelled: "border-l-red-500",
};

export default function Toaster() {
  const { toasts, dismiss } = useNotifications();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <div key={t.id} role="status"
          className={`pointer-events-auto w-full max-w-sm rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-lg ${ACCENT[t.status] || "border-l-indigo-500"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{t.message}</p>
              {t.link && (
                <Link href={t.link} onClick={() => dismiss(t.id)} className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                  View →
                </Link>
              )}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-lg leading-none text-slate-400 hover:text-slate-700" aria-label="Dismiss">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}
