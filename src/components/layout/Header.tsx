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
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/ui/NotificationCenter";
import ThemeToggle from "@/components/ui/ThemeToggle";
import toast from "react-hot-toast";

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
  member:    "bg-emerald-100 text-emerald-700",
  tenant:    "bg-sky-100 text-sky-700",
  guard:     "bg-orange-100 text-orange-700",
  watchman:  "bg-orange-100 text-orange-700",
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

  /* Close dropdown on outside click */
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
    <header
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 lg:px-6"
        style={{ height: "60px" }}
      >
        {/* Left — hamburger + brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="header-menu-toggle"
            onClick={onMenuToggle}
            aria-label="Open menu"
            className="btn-icon btn-ghost lg:hidden flex-shrink-0"
            style={{ minHeight: "44px", width: "44px" }}
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0"
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-text-secondary truncate">
              Society Manager
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Join code — desktop only */}
          {canShareJoinCode && (
            <button
              type="button"
              onClick={copyJoinCode}
              title="Copy society join code"
              className="hidden md:flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-primary hover:bg-primary/10 transition-colors"
              style={{ minHeight: "40px" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                Code
              </span>
              <span className="font-mono text-sm font-black tracking-widest">
                {joinCode}
              </span>
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          <ThemeToggle />
          <NotificationCenter />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="header-profile-btn"
              onClick={() => setShowProfile((v) => !v)}
              aria-expanded={showProfile}
              aria-haspopup="true"
              aria-label="Open profile menu"
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface transition-colors cursor-pointer border-l border-border ml-1 pl-3"
              style={{ minHeight: "44px" }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm flex-shrink-0"
              >
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>

              {/* Name + role — hidden on very small screens */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-text-primary leading-tight">
                  {userName}
                </p>
                <p className="text-[11px] text-text-secondary capitalize leading-tight">
                  {roleLabels[userRole] ?? userRole}
                </p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-text-tertiary hidden sm:block transition-transform duration-200 ${
                  showProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showProfile && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50"
                style={{ animation: "scaleIn 0.15s ease" }}
              >
                {/* Profile info */}
                <div className="p-4 border-b border-border bg-surface/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {userEmail}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadge}`}
                      >
                        {roleLabels[userRole] ?? userRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { setShowProfile(false); router.push("/settings"); }}
                    className="sidebar-link !min-h-[44px] w-full"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>

                  {["chairman", "secretary", "treasurer"].includes(userRole) && (
                    <button
                      onClick={() => { setShowProfile(false); router.push("/settings"); }}
                      className="sidebar-link !min-h-[44px] w-full"
                    >
                      <Settings className="w-4 h-4" />
                      Society Settings
                    </button>
                  )}

                  <div className="divider !my-1" />

                  <button
                    onClick={handleLogout}
                    className="sidebar-link !min-h-[44px] w-full !text-danger hover:!bg-danger-bg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
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
