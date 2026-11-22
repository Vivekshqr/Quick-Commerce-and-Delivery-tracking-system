"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, clearToken, getToken } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!getToken()) {
      setUser(null);
      return;
    }
    authApi.me().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/");
  };

  const dashboard = user?.role === "delivery" ? "/delivery" : "/customer";
  const links = user
    ? [
        { href: dashboard, label: "Dashboard" },
        { href: "/history", label: "History" },
      ]
    : [
        { href: "/", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href={user ? dashboard : "/"} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            Q
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Quick<span className="text-indigo-600">Cart</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <span className="ml-3 hidden text-sm text-slate-500 md:inline">
                {user.name}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                  {user.role === "delivery" ? "Delivery partner" : "Customer"}
                </span>
              </span>
              <button onClick={logout} className="btn-secondary ml-3">
                Logout
              </button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          {user && (
            <p className="mb-2 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-800">{user.name}</span>
            </p>
          )}
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === l.href ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <button onClick={logout} className="btn-secondary mt-2 w-full">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
