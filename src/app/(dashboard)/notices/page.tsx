"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/user-context";
import toast from "react-hot-toast";
import {
  Plus, Pin, PinOff, Trash2, Megaphone, Bell, Calendar,
  Info, AlertTriangle, MessageCircle, X, ChevronDown, ChevronUp,
  Search, Filter, Clock, MoreVertical, Wrench, Sparkles, ChevronRight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  body: string;
  category: string;
  postedBy: string;
  isPinned: boolean;
  expiresAt: string | null;
  createdAt: string;
}

type CategoryKey = "general" | "event" | "maintenance" | "emergency" | "meeting";

const CATEGORIES: Record<CategoryKey, {
  bg: string; 
  text: string; 
  icon: LucideIcon; 
  label: string;
  glow: string;
}> = {
  general:     { bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-600",  icon: Info,          label: "Update",      glow: "shadow-blue-500/10" },
  event:       { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600",icon: Bell,          label: "Event",       glow: "shadow-purple-500/10" },
  maintenance: { bg: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-600", icon: AlertTriangle, label: "Maintenance", glow: "shadow-amber-500/10" },
  emergency:   { bg: "bg-rose-50 dark:bg-rose-900/20",   text: "text-rose-600",  icon: Megaphone,     label: "Emergency",   glow: "shadow-rose-500/10" },
  meeting:     { bg: "bg-emerald-50 dark:bg-emerald-900/20",text: "text-emerald-600",icon: MessageCircle, label: "Meeting",     glow: "shadow-emerald-500/10" },
};

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-[2rem] p-6 border border-border animate-pulse space-y-4">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-surface" />
        <div className="flex-1 space-y-2 mt-1">
          <div className="h-4 bg-surface rounded w-1/3" />
          <div className="h-4 bg-surface rounded w-1/2" />
        </div>
      </div>
      <div className="h-20 bg-surface rounded-2xl w-full" />
    </div>
  );
}

function NoticeCard({
  notice,
  isAdmin,
  onPin,
  onDelete,
}: {
  notice: Notice;
  isAdmin: boolean;
  onPin: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(notice.body.length < 240);
  const cat = CATEGORIES[notice.category as CategoryKey] ?? CATEGORIES.general;
  const Icon = cat.icon;
  const isEmergency = notice.category === "emergency";

  return (
    <article
      className={cn(
        "bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border p-6 card-float group relative overflow-hidden transition-all",
        isEmergency ? "border-rose-500/30" : notice.isPinned ? "border-primary/30" : "border-border"
      )}
    >
      {isEmergency && (
        <div className="absolute top-0 right-0 p-1 bg-rose-500 rounded-bl-xl z-10">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-transparent transition-transform group-hover:scale-105", cat.bg, cat.text)}>
              <Icon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border border-transparent", cat.bg, cat.text)}>
                  {cat.label}
                </span>
                {notice.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-lg">
                    <Pin className="w-3 h-3 rotate-45" strokeWidth={3} /> Featured
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-text-primary leading-tight truncate group-hover:text-primary transition-colors">
                {notice.title}
              </h3>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all -mr-2">
              <button onClick={onPin} className="p-2.5 rounded-xl hover:bg-surface text-text-tertiary hover:text-primary transition-colors">
                {notice.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              <button onClick={onDelete} className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-text-tertiary hover:text-rose-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <p className={cn(
            "text-sm font-medium text-text-secondary leading-relaxed whitespace-pre-wrap",
            !expanded && "line-clamp-3"
          )}>
            {notice.body}
          </p>
          {notice.body.length > 240 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1.5 text-xs font-black text-primary hover:gap-2 transition-all"
            >
              {expanded ? "SHOW LESS" : "READ FULL NOTICE"}
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", expanded ? "-rotate-90" : "rotate-0")} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-border/50">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-primary text-[10px] font-black shadow-sm">
                {notice.postedBy?.charAt(0).toUpperCase()}
             </div>
             <div>
                <p className="text-xs font-black text-text-primary leading-none mb-0.5">{notice.postedBy}</p>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter">Society Admin</p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary bg-surface px-3 py-1.5 rounded-xl border border-border">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "general",
    isPinned: false,
  });

  const isAdmin = ["chairman", "secretary", "treasurer"].includes(user?.role ?? "");

  const fetchNotices = useCallback(() => {
    setLoading(true);
    fetch("/api/notices")
      .then((r) => r.json())
      .then((d) => setNotices(d.notices ?? []))
      .catch(() => toast.error("Sync failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Notice published");
        setShowForm(false);
        setForm({ title: "", body: "", category: "general", isPinned: false });
        fetchNotices();
      } else {
        toast.error("Publish failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      await fetch(`/api/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      fetchNotices();
      toast.success(isPinned ? "Unpinned" : "Pinned to top");
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("Remove this announcement?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Removed");
        fetchNotices();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = notices
    .filter((n) => (activeFilter === "all" || n.category === activeFilter))
    .filter((n) => (
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  const filterTabs = [
    { key: "all",         label: "Board",      icon: Megaphone },
    { key: "emergency",   label: "Emergency",  icon: AlertTriangle },
    { key: "maintenance", label: "Utility",    icon: Wrench },
    { key: "event",       label: "Events",     icon: Calendar },
    { key: "meeting",     label: "Meetings",   icon: MessageCircle },
    { key: "general",     label: "General",    icon: Info },
  ].filter(tab => tab.key === "all" || notices.some(n => n.category === tab.key));

  return (
    <div className="page-container max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Announcements</h1>
          <p className="text-text-secondary font-medium mt-1">Official communication from society committee</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
          <input 
            className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-12 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
            placeholder="Search through archives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 flex items-center gap-2",
                activeFilter === tab.key 
                  ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                  : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <Megaphone className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary">Quiet Board</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">
            Everything looks quiet! New notices will appear here when posted by the administration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((n) => (
            <NoticeCard
              key={n.id}
              notice={n}
              isAdmin={isAdmin}
              onPin={() => togglePin(n.id, n.isPinned)}
              onDelete={() => deleteNotice(n.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-10 border border-border shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Publish Notice</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Notification will be sent to all residents</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors">
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Subject Title</label>
                <input className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" placeholder="e.g. Lift Maintenance Schedule" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                  <select className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{CATEGORIES[c as CategoryKey].label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Display Option</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                    className={cn(
                      "w-full h-12 rounded-2xl px-4 font-bold border transition-all flex items-center justify-between",
                      form.isPinned ? "bg-primary text-white border-primary" : "bg-surface text-text-tertiary border-transparent"
                    )}
                  >
                    <span>Pin to top</span>
                    {form.isPinned ? <Pin className="w-4 h-4 rotate-45" /> : <PinOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Message Body</label>
                <textarea className="w-full bg-surface rounded-2xl px-4 py-3 font-medium text-text-primary border border-transparent focus:border-primary outline-none transition-all min-h-[160px] resize-none" placeholder="Provide full context, dates and timings..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  {saving ? "Publishing..." : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
