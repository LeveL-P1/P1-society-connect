"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Receipt,
  AlertTriangle,
  Megaphone,
  Vote,
  UserCheck,
  Clock,
  X,
  BellRing,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  bill_due: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  bill_paid: { icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  complaint_update: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
  notice_new: { icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  poll_new: { icon: Vote, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  visitor_entry: { icon: UserCheck, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  late_fee: { icon: Receipt, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  reminder: { icon: BellRing, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch("/api/notifications?limit=30");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => fetchNotifications(false), 2000);
    const interval = setInterval(() => fetchNotifications(true), 60_000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
    if (n.link) {
      setOpen(false);
      window.location.href = n.link;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-11 h-11 rounded-[1.25rem] flex items-center justify-center transition-all",
          open ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface text-text-secondary hover:bg-primary/5"
        )}
        id="notification-bell"
      >
        <Bell className="w-5 h-5" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 animate-in zoom-in duration-300">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-4 w-[380px] bg-surface-raised rounded-[2.5rem] border border-border shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-text-primary">Alerts</h3>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{unreadCount} UNREAD MESSAGES</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-5 h-5" strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-text-tertiary hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px] overscroll-contain no-scrollbar">
            {loading && !notifications.length ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center animate-pulse">
                   <Bell className="w-6 h-6 text-text-tertiary" />
                </div>
                <p className="text-xs font-bold text-text-tertiary animate-pulse">Checking for updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 px-10">
                <div className="w-16 h-16 bg-surface rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-text-tertiary border border-border">
                  <Inbox className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h4 className="text-base font-black text-text-primary">Inbox is Clear</h4>
                <p className="text-xs font-medium text-text-secondary mt-2">Everything is up to date. You'll see new alerts here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {notifications.map((n) => {
                  const config = typeConfig[n.type] || typeConfig.reminder;
                  const Icon = config.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={cn(
                        "w-full text-left px-6 py-4 flex gap-4 transition-all hover:bg-surface/50 group relative",
                        !n.isRead ? "bg-primary/[0.03]" : ""
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-transparent transition-transform group-hover:scale-105", config.bg, config.color)}>
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn("text-sm truncate", !n.isRead ? "font-black text-text-primary" : "font-bold text-text-secondary")}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-text-tertiary line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                           <Clock className="w-3 h-3 text-text-tertiary" strokeWidth={2.5} />
                           <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tight">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-surface/30 border-t border-border/50 text-center">
             <button onClick={() => setOpen(false)} className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] hover:text-primary transition-colors">
                Dismiss Panel
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
