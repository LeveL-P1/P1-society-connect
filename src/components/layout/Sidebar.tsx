"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Bell,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Building2,
  X,
  Megaphone,
  AlertTriangle,
  UserCheck,
  Car,
  CalendarCheck,
  Phone,
  FileText,
  Vote,
  FolderOpen,
  History,
  Search,
  Wrench,
  Briefcase,
  Package,
  UserPlus,
  ChevronDown,
  Shield,
  CreditCard,
  KeyRound,
  ClipboardList,
  BookOpen,
  MessageSquare,
  ShoppingBag,
  PiggyBank,
  TrendingUp,
  HardDrive,
  HandCoins,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
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
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["chairman", "secretary", "treasurer", "member", "tenant", "facility_manager"] },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/visitors", label: "Security Gate", icon: Shield, roles: ["chairman", "secretary", "treasurer", "security", "guard", "watchman"] },
      { href: "/my-visitors", label: "My Visitors", icon: UserCheck, roles: ["member", "tenant"] },
      { href: "/staff", label: "Staff & Daily Help", icon: Briefcase, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/packages", label: "Parcel Desk", icon: Package, roles: ["chairman", "secretary", "treasurer", "member", "tenant", "watchman", "guard"] },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { href: "/maintenance", label: "Billing & Ledger", icon: Receipt, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/my-bills", label: "My Bills", icon: CreditCard, roles: ["member", "tenant"] },
      { href: "/expenses", label: "Expenses", icon: Wallet, roles: ["chairman", "treasurer"] },
      { href: "/funds", label: "Fund Accounts", icon: PiggyBank, roles: ["chairman", "treasurer"] },
      { href: "/budgets", label: "Budget Planning", icon: TrendingUp, roles: ["chairman", "treasurer"] },
      { href: "/salaries", label: "Staff Payroll", icon: HandCoins, roles: ["chairman", "treasurer"] },
      { href: "/reports", label: "Reports", icon: BarChart3, roles: ["chairman", "secretary", "treasurer"] },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      { href: "/notices", label: "Announcements", icon: Megaphone, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/complaints", label: "Helpdesk", icon: AlertTriangle, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/directory", label: "Resident Directory", icon: BookOpen, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/forum", label: "Discussion Forum", icon: MessageSquare, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/events", label: "Events & Calendar", icon: CalendarCheck, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/amenities", label: "Amenity Booking", icon: Building2, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/marketplace", label: "Buy & Sell", icon: ShoppingBag, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/parking", label: "Parking", icon: Car, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/emergency", label: "SOS & Safety", icon: Phone, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { href: "/meetings", label: "Meetings", icon: FileText, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/polls", label: "Polls & Voting", icon: Vote, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
      { href: "/documents", label: "Document Vault", icon: FolderOpen, roles: ["chairman", "secretary", "treasurer", "member", "tenant"] },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/members", label: "Residents", icon: Users, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/tenants", label: "Tenants", icon: UserPlus, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/move-events", label: "Move In / Out", icon: ClipboardList, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/vendors", label: "Vendor Hub", icon: Wrench, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/assets", label: "Asset Register", icon: HardDrive, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/reminders", label: "Smart Nudges", icon: Bell, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/credentials", label: "Access Control", icon: KeyRound, roles: ["chairman", "secretary"] },
      { href: "/activity-log", label: "Audit Trail", icon: History, roles: ["chairman", "secretary", "treasurer"] },
      { href: "/settings", label: "Settings", icon: Settings, roles: ["chairman", "secretary"] },
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
  societyName = "Loading...",
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

  const minimalItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard#notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard#profile", label: "Profile", icon: Users },
    ...( ["chairman", "secretary"].includes(userRole)
      ? [{ href: "/settings", label: "Settings", icon: Settings }]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] pb-safe w-64 max-w-[16rem] overflow-hidden bg-white border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto`}
      >
        {/* Society header */}
        <div className="p-4 border-b border-border overflow-hidden">
          <div className="flex items-center gap-2 w-full">
            <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h2 className="font-semibold text-sm text-text-primary truncate" title={societyName}>
                {societyName}
              </h2>
              <p className="text-xs text-text-secondary truncate" title={societyAddress}>
                {societyAddress}
              </p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Simple Navigation</p>
            <p className="text-xs text-text-secondary mt-1">Use dashboard cards to open modules.</p>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-2">
            {minimalItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={onClose}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info + Logout */}
        <div className="p-3 border-t border-border mt-auto">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              {userRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-danger hover:bg-danger-bg"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
