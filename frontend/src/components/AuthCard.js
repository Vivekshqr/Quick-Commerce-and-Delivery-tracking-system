import Logo from "./Logo";
import { BoltIcon, MapPinIcon, ShieldIcon } from "./icons";

const PERKS = [
  { icon: BoltIcon, text: "Groceries at your door in minutes" },
  { icon: MapPinIcon, text: "Watch your rider live on the map" },
  { icon: ShieldIcon, text: "Secure delivery OTP on every order" },
];

// Split auth layout: brand panel on large screens, centred card everywhere.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-line bg-surface shadow-lift lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white lg:block">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">⚡ QuickCart</span>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight">Fresh groceries,<br />delivered fast.</h2>
            <ul className="mt-8 space-y-4">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Icon className="h-5 w-5" /></span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-12 text-6xl animate-float">🛒</p>
          </div>
        </aside>
        <div className="p-6 sm:p-10">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
