"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  // Wait until client-side mount
  useEffect(() => {
    setMounted(true);
    
    // TEMPORARY: Force light mode and remove any cached dark class
    // until dark mode styling is fully implemented across all components.
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    // Show a toast message instead of toggling the theme
    toast("Dark mode is coming soon!", {
      icon: "🌙",
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
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
      title="Dark mode coming soon"
    >
      <Moon className="w-4.5 h-4.5" />
    </button>
  );
}