"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, clearSession, hasSession } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { homeFor } from "@/lib/roles";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { CartIcon, CloseIcon, LogoutIcon, MenuIcon } from "./icons";

const ROLE_LABEL = { delivery: "Delivery partner", admin: "Admin", customer: "Customer" };

function Avatar({ name }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white ring-2 ring-surface">
      {initials}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    setOpen(false);
    if (!hasSession()) {
      setUser(null);
      return;
    }
    authApi.me().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  const logout = async () => {
    await authApi.logout().catch(() => {}); // clears the httpOnly cookie
    clearSession();
    cart.clear();
    setUser(null);
    router.push("/login");
  };

  const dashboard = homeFor(user?.role);
  const links = user
    ? [
        ...(user.role === "customer" ? [{ href: "/shop", label: "Shop" }] : []),
        { href: dashboard, label: user.role === "customer" ? "My orders" : "Dashboard" },
        ...(user.role !== "admin" ? [{ href: "/history", label: "History" }] : []),
        ...(user.role === "customer" ? [{ href: "/addresses", label: "Addresses" }] : []),
      ]
    : [{ href: "/", label: "Home" }];

  const isActive = (href) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <header className="glass sticky top-0 z-20">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo href={user ? dashboard : "/"} />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user?.role === "customer" && (
            <Link href="/cart" aria-label={`Cart, ${cart.count} items`}
              className={`btn-ghost relative h-10 w-10 rounded-xl p-0 ${pathname === "/cart" ? "bg-brand-50 text-brand-700" : ""}`}>
              <CartIcon />
              {cart.count > 0 && (
                <span key={cart.count} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-accent-400 px-1 text-[11px] font-bold text-slate-950 ring-2 ring-surface">
                  {cart.count > 99 ? "99+" : cart.count}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <div className="ml-1 hidden items-center gap-2 border-l border-line pl-3 md:flex">
              <Avatar name={user.name} />
              <div className="hidden leading-tight lg:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
              </div>
              <button onClick={logout} className="btn-ghost h-10 w-10 rounded-xl p-0" aria-label="Logout" title="Logout">
                <LogoutIcon />
              </button>
            </div>
          ) : (
            <div className="ml-1 hidden items-center gap-2 md:flex">
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/register" className="btn-primary">Sign up</Link>
            </div>
          )}
          <button className="btn-ghost h-10 w-10 rounded-xl p-0 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-up border-t border-line bg-surface px-4 py-3 md:hidden">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Avatar name={user.name} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"}`}>
                {l.label}
              </Link>
            ))}
            {user?.role === "customer" && (
              <Link href="/cart" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Cart {cart.count > 0 && `(${cart.count})`}
              </Link>
            )}
            {user ? (
              <button onClick={logout} className="btn-secondary mt-2 w-full"><LogoutIcon className="h-4 w-4" /> Logout</button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="btn-secondary">Log in</Link>
                <Link href="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
