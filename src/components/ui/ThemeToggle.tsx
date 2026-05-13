"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Wait until client-side mount
  useEffect(() => {
    setMounted(true);

    const theme = localStorage.getItem("theme");
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const dark = theme === "dark" || (!theme && isSystemDark);

    setIsDark(dark);

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;

    setIsDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="p-2 rounded-full opacity-0 pointer-events-none">
        <Moon className="w-4.5 h-4.5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors relative"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5" />
      ) : (
        <Moon className="w-4.5 h-4.5" />
      )}
    </button>
  );
}