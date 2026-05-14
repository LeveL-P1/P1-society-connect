"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border pb-safe"
      style={{ boxShadow: "0 -1px 12px rgba(0,0,0,0.07)" }}
    >
      <div
        className="flex justify-around items-stretch px-1"
        style={{ height: "64px" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          /* match /dashboard exactly, all others use startsWith */
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
              className="flex flex-col items-center justify-center flex-1 gap-1 relative transition-colors"
              style={{
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-tertiary)",
              }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span
                  className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/10"
                  style={{ width: "36px", height: "30px" }}
                  aria-hidden="true"
                />
              )}
              <Icon
                className="relative z-10 transition-transform"
                style={{
                  width: "22px",
                  height: "22px",
                  strokeWidth: isActive ? 2.5 : 1.75,
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
              />
              <span
                className="relative z-10"
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                  letterSpacing: "0.01em",
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
