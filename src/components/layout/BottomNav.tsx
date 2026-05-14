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
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      <div
        className="flex justify-around items-stretch px-2"
        style={{ height: "64px" }}
      >
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
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center flex-1 relative transition-all duration-300"
              style={{
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
                color: isActive ? "#E11D48" : "#64748B", // Rose-600 for active, Slate-500 for inactive
              }}
            >
              {/* Top Active Indicator Line (like inspiration) */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-[3px] bg-rose-600 rounded-b-full"
                />
              )}
              
              <Icon
                className="relative z-10 transition-transform mb-1"
                style={{
                  width: "24px",
                  height: "24px",
                  strokeWidth: isActive ? 2.5 : 2,
                  transform: isActive ? "scale(1.1) translateY(2px)" : "scale(1) translateY(0)",
                }}
              />
              <span
                className="relative z-10 transition-all"
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
