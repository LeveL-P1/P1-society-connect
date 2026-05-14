"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/user-context";
import toast from "react-hot-toast";
import {
  Plus, Pin, PinOff, Trash2, Megaphone, Bell, Calendar,
  Info, AlertTriangle, MessageCircle, X, ChevronDown, ChevronUp,
  Search, Filter, Clock, MoreVertical
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

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
  border: string; 
  icon: LucideIcon; 
  label: string;
  gradient: string;
}> = {
  general:     { bg: "bg-blue-50",   text: "text-blue-600",  border: "border-blue-100",  icon: Info,          label: "Update",      gradient: "from-blue-500/10 to-cyan-500/10" },
  event:       { bg: "bg-purple-50", text: "text-purple-600",border: "border-purple-100",icon: Bell,          label: "Event",       gradient: "from-purple-500/10 to-pink-500/10" },
  maintenance: { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-100", icon: AlertTriangle, label: "Maintenance", gradient: "from-amber-500/10 to-orange-500/10" },
  emergency:   { bg: "bg-rose-50",   text: "text-rose-600",  border: "border-rose-100",  icon: Megaphone,     label: "Emergency",   gradient: "from-rose-500/10 to-red-500/10" },
  meeting:     { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100",icon: MessageCircle, label: "Meeting",     gradient: "from-emerald-500/10 to-teal-500/10" },
};

const getCat = (key: string) => CATEGORIES[key as CategoryKey] ?? CATEGORIES.general;

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
  const cat = getCat(notice.category);
  const Icon = cat.icon;
  const isEmergency = notice.category === "emergency";

  return (
    <article
      className={`card overflow-hidden transition-all duration-300 hover:shadow-lg group ${
        isEmergency
          ? "border-rose-200 ring-1 ring-rose-50 bg-rose-50/20"
          : notice.isPinned
          ? "border-primary/20 ring-1 ring-primary/5"
          : "border-slate-200"
      }`}
    >
      {isEmergency && (
        <div className="bg-rose-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-white animate-pulse" />
            <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
              Priority Emergency
            </span>
          </div>
          <Clock className="w-3.5 h-3.5 text-white/60" />
        </div>
      )}

      {notice.isPinned && !isEmergency && (
        <div className="bg-primary/5 px-4 py-1.5 flex items-center gap-2 border-b border-primary/10">
          <Pin className="w-3.5 h-3.5 text-primary rotate-45" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            Always Important
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${cat.bg} ${cat.text} ${cat.border} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                  {notice.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${cat.bg} ${cat.text} ${cat.border}`}>
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">•</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    REF: #{notice.id.slice(-4).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {isAdmin && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={onPin} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors">
                    {notice.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button onClick={onDelete} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap ${!expanded ? "line-clamp-3" : ""}`}>
                {notice.body}
              </p>
              {notice.body.length > 240 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 flex items-center gap-1 text-xs font-black text-primary hover:underline"
                >
                  {expanded ? "Collapse Details" : "Read Full Notice"}
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-primary text-[10px] font-black">
                    {notice.postedBy?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none mb-1">{notice.postedBy}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Society Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-black">
                  {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>
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
      .catch(() => toast.error("Unable to load notices"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Please fill in the title and details.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Notice published successfully");
        setShowForm(false);
        setForm({ title: "", body: "", category: "general", isPinned: false });
        fetchNotices();
      } else {
        toast.error("Failed to publish");
      }
    } catch {
      toast.error("Something went wrong");
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
      toast.success(isPinned ? "Notice unpinned" : "Notice pinned to top");
    } catch {
      toast.error("Unable to update notice");
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to remove this notice?")) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Notice removed");
        fetchNotices();
      }
    } catch {
      toast.error("Failed to delete");
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
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Official communication from your society committee
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary shadow-xl shadow-primary/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Announcement
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            className="input !pl-11 !rounded-2xl !bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 font-semibold text-sm" 
            placeholder="Search through archives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                activeFilter === tab.key
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
            <Megaphone className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No announcements found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery ? `No results for "${searchQuery}". Try a different term.` : "Everything looks quiet! New notices will appear here when posted."}
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
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

      {showForm && (
        <div className="modal-overlay z-50" onClick={() => setShowForm(false)}>
          <div className="modal-content !max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Post Announcement</h2>
                  <p className="text-xs text-slate-500 font-semibold tracking-tight">Notification will be sent to all residents</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Title</label>
                <input
                  className="input !bg-slate-50 dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 font-bold"
                  placeholder="e.g. Schedule Maintenance of Lift B"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                  <select
                    className="select !bg-slate-50 dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 font-bold"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="general">General Update</option>
                    <option value="event">Society Event</option>
                    <option value="maintenance">Utility/Repair</option>
                    <option value="emergency">Emergency Alert</option>
                    <option value="meeting">Meeting/AGM</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Highlight</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                    className={`w-full h-[46px] rounded-xl border flex items-center justify-between px-4 transition-all ${
                      form.isPinned ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="text-sm font-bold">Pin to Top</span>
                    {form.isPinned ? <Pin className="w-4 h-4 rotate-45" /> : <PinOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Message Details</label>
                <textarea
                  className="textarea !bg-slate-50 dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 font-medium min-h-[160px]"
                  placeholder="Provide full context, dates, and instructions for residents..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn btn-secondary h-14"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] btn btn-primary h-14 shadow-xl shadow-primary/20"
                >
                  {saving ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
