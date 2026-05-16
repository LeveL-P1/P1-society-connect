"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function ThemeToggle() {
  return (
    <AnimatedThemeToggler
      variant="circle"
      duration={500}
      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors relative [&_svg]:w-[18px] [&_svg]:h-[18px]"
      title="Toggle theme"
    />
  );
}