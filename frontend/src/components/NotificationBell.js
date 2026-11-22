"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationBell() {
  const n = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && n.unread) setTimeout(n.markAllRead, 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
        </svg>
        {n.unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {n.unread > 9 ? "9+" : n.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {n.items.length > 0 && <button onClick={n.clearAll} className="text-xs text-slate-500 hover:text-slate-800">Clear</button>}
          </div>
          {n.permission === "default" && (
            <button onClick={n.requestPermission} className="block w-full bg-indigo-50 px-4 py-2 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-100">
              🔔 Enable browser notifications
            </button>
          )}
          {n.permission === "denied" && (
            <p className="bg-amber-50 px-4 py-2 text-xs text-amber-800">Browser notifications are blocked. Allow them in your browser&apos;s site settings.</p>
          )}
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {n.items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</li>
            ) : (
              n.items.map((x) => (
                <li key={x.id} className={x.read ? "" : "bg-indigo-50/50"}>
                  <Link href={x.link || "#"} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-slate-50">
                    <p className="text-sm font-medium text-slate-900">{x.title}</p>
                    <p className="text-xs text-slate-600">{x.message}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{new Date(x.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
