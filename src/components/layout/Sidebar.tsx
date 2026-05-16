"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Receipt, Bell, BarChart3, Wallet, Settings,
  LogOut, Building2, X, Megaphone, AlertTriangle, UserCheck, Car,
  CalendarCheck, Phone, FileText, Vote, FolderOpen, History, Wrench,
  Briefcase, Package, UserPlus, Shield, CreditCard, KeyRound,
  ClipboardList, BookOpen, MessageSquare, ShoppingBag, PiggyBank,
  TrendingUp, HardDrive, HandCoins, Pin, PinOff, ChevronUp
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

  // Desktop collapse state - Default to collapsed
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Module collapse state
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({
    Governance: true,
  });

  const toggleModule = (title: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // If pinned OR hovered OR open on mobile, the visual sidebar is expanded
  const isExpanded = isOpen || isPinned || isHovered;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

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

      {/* Desktop spacer to push content when sidebar expands so it doesn't hide anything */}
      <div 
        className={`hidden lg:block transition-all duration-150 ease-in-out shrink-0 ${isExpanded ? "w-[256px]" : "w-[88px]"}`} 
      />

      {/* Hover Wrapper to capture extreme left edge interactions */}
      <div
        className="fixed top-0 left-0 z-50 h-[100dvh] pointer-events-none lg:pointer-events-auto lg:py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <aside
          aria-label="Sidebar navigation"
          className={`
            pointer-events-auto
            flex flex-col overflow-hidden
            transition-all duration-150 ease-in-out
            
            /* Mobile */
            ${isOpen ? "translate-x-0 shadow-2xl w-64 h-[100dvh] bg-surface-raised border-r border-border rounded-none" : "-translate-x-full w-64 h-[100dvh] bg-surface-raised border-r border-border rounded-none absolute top-0 left-0 lg:relative lg:translate-x-0"}
            
            /* Desktop */
            lg:h-full lg:rounded-r-[2rem] lg:rounded-l-none lg:border lg:border-l-0 lg:border-border lg:bg-surface-raised/90 lg:backdrop-blur-2xl
            ${isExpanded ? "lg:w-64 lg:shadow-[30px_0_60px_-15px_rgba(0,0,0,0.1)]" : "lg:w-[88px] lg:shadow-[15px_0_30px_-10px_rgba(0,0,0,0.05)]"}
          `}
        >

        {/* Society header */}
        <div className={`flex items-center border-b border-border bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 transition-all duration-150 ${isExpanded ? "p-4 gap-3" : "py-4 justify-center"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          
          <div className={`flex-1 min-w-0 transition-all duration-150 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
            <p className="font-bold text-sm text-text-primary line-clamp-2 leading-tight" title={societyName}>
              {societyName}
            </p>
            {societyAddress && (
              <p className="text-[10px] font-black text-text-secondary truncate leading-tight uppercase tracking-wider mt-0.5" title={societyAddress}>
                {societyAddress}
              </p>
            )}
          </div>

          {/* Desktop Pin Toggle */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            className={`items-center justify-center w-8 h-8 rounded-lg ${isPinned ? "text-primary bg-primary/10" : "text-text-secondary hover:text-text-primary hover:bg-surface"} transition-all duration-150 flex-shrink-0 ${isExpanded ? "hidden lg:flex opacity-100" : "hidden opacity-0"}`}
            title={isPinned ? "Unstick Sidebar" : "Stick Sidebar"}
          >
            {isPinned ? <Pin className="w-4 h-4 fill-current" strokeWidth={2.5} /> : <PinOff className="w-4 h-4" strokeWidth={2.5} />}
          </button>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 hide-scrollbar">
          {visibleSections.map((section, si) => {
            const isSectionCollapsed = section.title ? collapsedModules[section.title] : false;
            
            return (
              <div key={si} className={si > 0 ? "mt-4" : ""}>
                {section.title && (
                  <button 
                    onClick={() => toggleModule(section.title)}
                    className={`w-full flex items-center justify-between px-3 mb-1.5 transition-all duration-150 group ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
                      {section.title}
                    </span>
                    <span className={isSectionCollapsed ? "animate-bounce" : ""}>
                      <ChevronUp 
                        className={`w-[18px] h-[18px] text-text-primary/70 group-hover:text-text-primary transition-all duration-300 ${isSectionCollapsed ? "rotate-180" : ""}`} 
                        strokeWidth={2.5}
                      />
                    </span>
                  </button>
                )}
                
                <div className={`grid transition-all duration-300 ease-in-out ${isSectionCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
                  <ul className="space-y-0.5 overflow-hidden min-h-0">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center rounded-lg transition-all duration-150 group ${
                              isExpanded ? "px-3 py-2 gap-3" : "justify-center p-2.5"
                            } ${active ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-text-primary/80 hover:bg-surface hover:text-primary"}`}
                            title={!isExpanded ? item.label : undefined}
                          >
                             <Icon
                               className={`flex-shrink-0 transition-transform duration-150 ${
                                 active ? "text-primary" : "text-text-secondary group-hover:text-primary"
                               } ${!isExpanded && "group-hover:scale-110"}`}
                               style={{ width: 20, height: 20, strokeWidth: 2.5 }}
                             />
                            <span className={`truncate text-sm font-bold transition-all duration-150 ${
                              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
                            }`}>
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer — logout */}
        <div className={`flex-shrink-0 border-t border-border bg-surface-raised transition-all duration-150 ${isExpanded ? "p-4" : "p-3"}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 transition-all duration-150 group overflow-hidden ${isExpanded ? "px-3 py-2.5 gap-3" : "justify-center p-3"}`}
            title={!isExpanded ? "Sign Out" : undefined}
          >
            <LogOut className={`w-[19px] h-[19px] flex-shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? "group-hover:translate-x-[4.5rem]" : "group-hover:translate-x-1"}`} strokeWidth={2.5} />
            <span className={`text-sm font-bold transition-all duration-300 ${isExpanded ? "opacity-100 group-hover:opacity-0 group-hover:translate-x-2 w-auto" : "opacity-0 w-0 hidden"}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </div>
    </>
  );
}
