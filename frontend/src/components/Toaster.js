"use client";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";

const TONE = {
  Pending: { bar: "bg-amber-500", icon: "⏳", ring: "bg-amber-50" },
  Accepted: { bar: "bg-sky-500", icon: "👍", ring: "bg-sky-50" },
  "Out for Delivery": { bar: "bg-violet-500", icon: "🛵", ring: "bg-violet-50" },
  Delivered: { bar: "bg-emerald-500", icon: "✅", ring: "bg-emerald-50" },
  Cancelled: { bar: "bg-red-500", icon: "✖️", ring: "bg-red-50" },
};

// Slide-in toasts (top right on desktop, top centre on mobile) with an auto-dismiss progress bar.
export default function Toaster() {
  const { toasts, dismiss } = useNotifications();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => {
        const tone = TONE[t.status] || { bar: "bg-brand-500", icon: "🔔", ring: "bg-brand-50" };
        return (
          <div key={t.id} role="status"
            className="pointer-events-auto relative w-full max-w-sm animate-slide-in overflow-hidden rounded-2xl border border-line bg-surface p-4 pr-10 shadow-lift">
            <div className="flex items-start gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${tone.ring}`}>{tone.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{t.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{t.message}</p>
                {t.link && (
                  <Link href={t.link} onClick={() => dismiss(t.id)} className="mt-1 inline-block text-xs font-bold text-brand-600 hover:underline">
                    View →
                  </Link>
                )}
              </div>
            </div>
            <button onClick={() => dismiss(t.id)} className="absolute right-3 top-3 text-lg leading-none text-slate-400 hover:text-slate-700" aria-label="Dismiss">×</button>
            <span className={`absolute bottom-0 left-0 h-1 ${tone.bar}`} style={{ animation: "toast-progress 6s linear forwards" }} />
          </div>
        );
      })}
    </div>
  );
}
