"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  LogOut,
  Settings,
  User,
  Shield,
  ChevronDown,
  Copy,
  Bell,
  UserCircle2,
  Mail,
  Building2,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/ui/NotificationCenter";
import ThemeToggle from "@/components/ui/ThemeToggle";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
  joinCode?: string;
  onMenuToggle?: () => void;
}

const roleLabels: Record<string, string> = {
  chairman:         "Chairman",
  secretary:        "Secretary",
  treasurer:        "Treasurer",
  member:           "Flat Member",
  tenant:           "Tenant",
  guard:            "Security Guard",
  watchman:         "Watchman",
  vendor_staff:     "Vendor",
  facility_manager: "Facility Manager",
};

const roleColors: Record<string, string> = {
  chairman:  "bg-blue-100 text-blue-700",
  secretary: "bg-blue-100 text-blue-700",
  treasurer: "bg-blue-100 text-blue-700",
  member:    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  tenant:    "bg-sky-50 text-sky-600 dark:bg-sky-900/20",
  guard:     "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
  watchman:  "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
};

export default function Header({
  userName = "User",
  userRole = "member",
  userEmail = "",
  joinCode,
  onMenuToggle,
}: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    router.push("/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const canShareJoinCode = ["chairman", "secretary"].includes(userRole) && !!joinCode;
  const roleBadge = roleColors[userRole] ?? "bg-slate-100 text-slate-600";

  const copyJoinCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied!");
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-border lg:bg-transparent lg:border-none pointer-events-none">
      <div className="flex items-center justify-between gap-3 px-4 lg:px-6 h-[72px] lg:h-[88px]">
        {/* Left — hamburger + brand (Mobile Only) */}
        <div className="flex items-center gap-3 min-w-0 lg:hidden pointer-events-auto">
          <button
            onClick={onMenuToggle}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-surface border border-border text-text-secondary hover:text-primary transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-black text-text-primary truncate tracking-tight">
              SOCIETY CONNECT
            </span>
          </div>
        </div>

        {/* Action Bar (Glassmorphic Container) */}
        <div className="flex items-center gap-2 ml-auto bg-white dark:bg-slate-900/80 backdrop-blur-xl px-2 py-2 lg:px-3 lg:py-2 rounded-[2rem] border border-border shadow-2xl shadow-black/5 pointer-events-auto transition-all">
          
          {/* Join code — desktop only */}
          {canShareJoinCode && (
            <button
              onClick={copyJoinCode}
              className="hidden md:flex items-center gap-3 h-11 px-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary transition-all group"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-0.5">Society Code</span>
                <span className="text-sm font-black tracking-[0.1em]">{joinCode}</span>
              </div>
              <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            </button>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>

          <div className="w-px h-8 bg-border/50 mx-1 hidden sm:block" />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfile((v) => !v)}
              className={cn(
                "flex items-center gap-3 rounded-2xl pl-2 pr-4 h-11 transition-all group",
                showProfile ? "bg-surface" : "hover:bg-surface/50"
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/10 shrink-0">
                <span className="text-white text-[11px] font-black">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-text-primary leading-tight group-hover:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tight mt-0.5">
                  {roleLabels[userRole] ?? userRole}
                </p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-text-tertiary transition-transform duration-300", showProfile ? "rotate-180" : "rotate-0")} strokeWidth={2.5} />
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-4 w-72 bg-surface-raised rounded-[2.5rem] border border-border shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl shadow-primary/20 shrink-0">
                      <span className="text-white text-lg font-black">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-black text-text-primary truncate tracking-tight">{userName}</h4>
                      <p className="text-xs font-medium text-text-tertiary truncate mb-2">{userEmail}</p>
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent", roleBadge)}>
                        {roleLabels[userRole] ?? userRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <button onClick={() => { setShowProfile(false); router.push("/profile"); }} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-surface text-text-secondary hover:text-primary transition-all group">
                    <UserCircle2 className="w-5 h-5 text-text-tertiary group-hover:text-primary" strokeWidth={2.5} />
                    <span className="text-sm font-bold">My Account</span>
                    <ChevronDown className="w-4 h-4 ml-auto -rotate-90 opacity-0 group-hover:opacity-100 transition-all" strokeWidth={2.5} />
                  </button>

                  {["chairman", "secretary", "treasurer"].includes(userRole) && (
                    <button onClick={() => { setShowProfile(false); router.push("/settings"); }} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-surface text-text-secondary hover:text-primary transition-all group">
                      <Building2 className="w-5 h-5 text-text-tertiary group-hover:text-primary" strokeWidth={2.5} />
                      <span className="text-sm font-bold">Society Portal</span>
                      <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" strokeWidth={2} />
                    </button>
                  )}

                  <div className="h-px bg-border/50 mx-4 my-2" />

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 transition-all group">
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
