import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <Logo compact />
        <p>Groceries in minutes · Live tracking · Made with ❤️ in India</p>
        <p className="text-xs">© {new Date().getFullYear()} QuickCart</p>
      </div>
    </footer>
  );
}
