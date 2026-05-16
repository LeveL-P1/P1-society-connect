"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  AlertTriangle,
  UserCheck,
  User,
  Shield,
  Package,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userRole?: string;
}

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

export default function BottomNav({ userRole = "member" }: BottomNavProps) {
  const pathname = usePathname();

  const isWatchman = userRole === "watchman" || userRole === "guard";
  const isAdmin = ["chairman", "secretary", "treasurer"].includes(userRole);

  const watchmanItems: NavItem[] = [
    { href: "/visitors",  icon: Shield,          label: "Gate"     },
    { href: "/packages",  icon: Package,         label: "Parcels"  },
    { href: "/settings",  icon: User,            label: "Profile"  },
  ];

  const memberItems: NavItem[] = [
    { href: "/dashboard",    icon: LayoutDashboard, label: "Home"     },
    { href: "/my-visitors",  icon: UserCheck,       label: "Visitors" },
    { href: "/notices",      icon: Megaphone,       label: "Notices"  },
    { href: "/my-bills",     icon: Receipt,         label: "Bills"    },
    { href: "/complaints",   icon: AlertTriangle,   label: "Help"     },
  ];

  const adminItems: NavItem[] = [
    { href: "/dashboard",  icon: LayoutDashboard, label: "Home"     },
    { href: "/visitors",   icon: Shield,          label: "Gate"     },
    { href: "/notices",    icon: Megaphone,       label: "Notices"  },
    { href: "/maintenance",icon: Receipt,         label: "Finance"  },
    { href: "/complaints", icon: AlertTriangle,   label: "Help"     },
  ];

  let navItems: NavItem[];
  if (isWatchman)   navItems = watchmanItems;
  else if (isAdmin) navItems = adminItems;
  else              navItems = memberItems;

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-border pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
    >
      <div className="flex justify-around items-stretch px-2 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 relative transition-all duration-300",
                isActive ? "text-primary" : "text-text-tertiary hover:text-text-secondary"
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-[4px] bg-primary rounded-b-full shadow-[0_2px_10px_rgba(225,29,72,0.3)]"
                />
              )}
              
              <div className={cn(
                "relative z-10 transition-transform mb-0.5",
                isActive ? "scale-110 translate-y-0.5" : "scale-100"
              )}>
                <Icon
                  style={{
                    width: "22px",
                    height: "22px",
                    strokeWidth: 2.5,
                  }}
                />
              </div>
              <span className={cn(
                "relative z-10 text-[9px] font-black uppercase tracking-tighter transition-all",
                isActive ? "opacity-100" : "opacity-80"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
