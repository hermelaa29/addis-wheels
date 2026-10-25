"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sw_theme_mode_v1";
export const THEME_CHANGE_EVENT = "sw_theme_change";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read persisted preference or default to light
    const getActiveTheme = (): Theme => {
      if (typeof window === "undefined") return "light";
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (saved === "dark") return "dark";
        return "light";
      } catch {
        return "light";
      }
    };

    const initialTheme = getActiveTheme();
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleThemeUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<Theme>;
      const nextTheme = customEvt.detail || getActiveTheme();
      setTheme(nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeUpdate);
    window.addEventListener("storage", handleThemeUpdate);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeUpdate);
      window.removeEventListener("storage", handleThemeUpdate);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (err) {
        console.warn("Could not save theme preference:", err);
      }

      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }));
      return next;
    });
  }, []);

  return { theme, toggleTheme, mounted };
}
