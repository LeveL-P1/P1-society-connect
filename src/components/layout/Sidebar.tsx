"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Receipt, Bell, BarChart3, Wallet, Settings,
  LogOut, Building2, X, Megaphone, AlertTriangle, UserCheck, Car,
  CalendarCheck, Phone, FileText, Vote, FolderOpen, History, Wrench,
  Briefcase, Package, UserPlus, Shield, CreditCard, KeyRound,
  ClipboardList, BookOpen, MessageSquare, ShoppingBag, PiggyBank,
  TrendingUp, HardDrive, HandCoins,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["chairman","secretary","treasurer","member","tenant","facility_manager"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/visitors",    label: "Security Gate",    icon: Shield,     roles: ["chairman","secretary","treasurer","security","guard","watchman"] },
      { href: "/my-visitors", label: "My Visitors",      icon: UserCheck,  roles: ["member","tenant"] },
      { href: "/staff",       label: "Staff & Daily Help",icon: Briefcase, roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/packages",    label: "Parcel Desk",      icon: Package,    roles: ["chairman","secretary","treasurer","member","tenant","watchman","guard"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/maintenance", label: "Billing & Ledger", icon: Receipt,    roles: ["chairman","secretary","treasurer"] },
      { href: "/my-bills",    label: "My Bills",         icon: CreditCard, roles: ["member","tenant"] },
      { href: "/expenses",    label: "Expenses",         icon: Wallet,     roles: ["chairman","treasurer"] },
      { href: "/funds",       label: "Fund Accounts",    icon: PiggyBank,  roles: ["chairman","treasurer"] },
      { href: "/budgets",     label: "Budget Planning",  icon: TrendingUp, roles: ["chairman","treasurer"] },
      { href: "/salaries",    label: "Staff Payroll",    icon: HandCoins,  roles: ["chairman","treasurer"] },
      { href: "/reports",     label: "Reports",          icon: BarChart3,  roles: ["chairman","secretary","treasurer"] },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/notices",     label: "Announcements",     icon: Megaphone,     roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/complaints",  label: "Helpdesk",          icon: AlertTriangle, roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/directory",   label: "Resident Directory",icon: BookOpen,      roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/forum",       label: "Discussion Forum",  icon: MessageSquare, roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/events",      label: "Events & Calendar", icon: CalendarCheck, roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/amenities",   label: "Amenity Booking",   icon: Building2,     roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/marketplace", label: "Buy & Sell",        icon: ShoppingBag,   roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/parking",     label: "Parking",           icon: Car,           roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/emergency",   label: "SOS & Safety",      icon: Phone,         roles: ["chairman","secretary","treasurer","member","tenant"] },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/meetings",   label: "Meetings",       icon: FileText,   roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/polls",      label: "Polls & Voting", icon: Vote,       roles: ["chairman","secretary","treasurer","member","tenant"] },
      { href: "/documents",  label: "Document Vault", icon: FolderOpen, roles: ["chairman","secretary","treasurer","member","tenant"] },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/members",       label: "Residents",      icon: Users,       roles: ["chairman","secretary","treasurer"] },
      { href: "/tenants",       label: "Tenants",        icon: UserPlus,    roles: ["chairman","secretary","treasurer"] },
      { href: "/move-events",   label: "Move In / Out",  icon: ClipboardList,roles: ["chairman","secretary","treasurer"] },
      { href: "/vendors",       label: "Vendor Hub",     icon: Wrench,      roles: ["chairman","secretary","treasurer"] },
      { href: "/assets",        label: "Asset Register", icon: HardDrive,   roles: ["chairman","secretary","treasurer"] },
      { href: "/reminders",     label: "Smart Nudges",   icon: Bell,        roles: ["chairman","secretary","treasurer"] },
      { href: "/credentials",   label: "Access Control", icon: KeyRound,    roles: ["chairman","secretary"] },
      { href: "/activity-log",  label: "Audit Trail",    icon: History,     roles: ["chairman","secretary","treasurer"] },
      { href: "/settings",      label: "Settings",       icon: Settings,    roles: ["chairman","secretary"] },
    ],
  },
];

interface SidebarProps {
  societyName?: string;
  societyAddress?: string;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

export default function Sidebar({
  societyName = "Society",
  societyAddress = "",
  isOpen = false,
  onClose,
  userRole = "member",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Filter sections and items based on role
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(userRole)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`
          fixed top-0 left-0 z-50 h-[100dvh] w-64 bg-white border-r border-border
          flex flex-col overflow-hidden
          transition-transform duration-250 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Society header */}
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm flex-shrink-0">
            <Building2 className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm text-text-primary truncate leading-tight"
              title={societyName}
            >
              {societyName}
            </p>
            {societyAddress && (
              <p
                className="text-xs text-text-secondary truncate leading-tight mt-0.5"
                title={societyAddress}
              >
                {societyAddress}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden btn-icon btn-ghost flex-shrink-0"
            style={{ minHeight: "36px", width: "36px" }}
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {visibleSections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-4" : ""}>
              {section.title && (
                <p className="section-title px-2 mb-1">{section.title}</p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`sidebar-link ${active ? "active" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon
                          style={{
                            width: 17,
                            height: 17,
                            flexShrink: 0,
                            strokeWidth: active ? 2.25 : 1.75,
                          }}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer — role + logout */}
        <div className="flex-shrink-0 p-2.5 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-text-secondary capitalize truncate">
              {userRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-danger hover:bg-danger-bg"
          >
            <LogOut style={{ width: 17, height: 17, flexShrink: 0 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
