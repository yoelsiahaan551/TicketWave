"use client";

import { useTheme, useIsMounted } from "@/app/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({
  showLabel = false,
  className = "",
  size = 20,
  brandHover = false,
}) {
  const { toggleTheme, isDark } = useTheme();
  const mounted = useIsMounted();

  // Avoid SSR hydration icon mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 ${className}`}
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 ${className}`}
      >
        <div className="flex items-center gap-3">
          {isDark ? (
            <Sun size={size} className="text-slate-200" />
          ) : (
            <Moon size={size} className="text-slate-600" />
          )}
          <span>Tema {isDark ? "Gelap (Dark)" : "Terang (Light)"}</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
    >
      {isDark ? (
        <Sun size={size} className="text-slate-200 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={size} className="text-slate-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
