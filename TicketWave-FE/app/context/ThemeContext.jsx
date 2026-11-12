"use client";

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
});

const STORAGE_KEY = "ticketwave_theme";

const emptySubscribe = () => () => {};

export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeProvider({ children }) {
  // Lazy state initialization to read from localStorage without cascading renders
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") {
          return saved;
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return "light";
  });

  const pathname = usePathname();

  // Synchronize the DOM .dark class with current route and theme
  useEffect(() => {
    if (typeof document === "undefined") return;

    // LANDING PAGE RULE:
    // Landing page '/' MUST NOT take theme toggle and stays in its original design
    if (pathname === "/") {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
      return;
    }

    // All other pages: apply active theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme, pathname]);

  const setTheme = (newTheme) => {
    if (newTheme !== "dark" && newTheme !== "light") return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("[Theme] Failed to persist theme:", e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
