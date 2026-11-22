"use client";
import { useEffect, useState } from "react";
import { getTheme, setTheme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle({ className = "" }) {
  const [theme, setState] = useState(null);
  useEffect(() => setState(getTheme()), []);

  const toggle = () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    setState(next);
  };

  return (
    <button onClick={toggle} className={`btn-ghost h-10 w-10 rounded-xl p-0 ${className}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title="Toggle theme">
      {theme === "dark" ? <SunIcon className="h-5 w-5 animate-pop" /> : <MoonIcon className="h-5 w-5 animate-pop" />}
    </button>
  );
}
