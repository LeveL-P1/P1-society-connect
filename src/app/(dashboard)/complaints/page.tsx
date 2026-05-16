"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/user-context";
import toast from "react-hot-toast";
import { 
  Plus, AlertTriangle, CheckCircle2, Clock, Share2, 
  MessageSquare, Info, ShieldAlert, Calendar, X, 
  ChevronRight, Filter, Search, MoreVertical, CheckCircle,
  Wrench, Zap, Trash2, ShieldCheck, HelpCircle
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

interface Complaint {
  id: string;
  flatNumber: string;
  raisedBy: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface Stats {
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

const PRIORITY_CONFIG: Record<string, { label: string; text: string; bg: string }> = {
  low: { label: "Routine", text: "text-text-tertiary", bg: "bg-surface" },
  medium: { label: "Standard", text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  high: { label: "High Priority", text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  urgent: { label: "Immediate", text: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
};

const CATEGORY_ICONS: Record<string, any> = {
  plumbing: Wrench,
  electrical: Zap,
  cleanliness: Trash2,
  security: ShieldCheck,
  general: MessageSquare,
  other: HelpCircle,
};

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-[2rem] p-6 border border-border animate-pulse flex gap-4">
      <div className="w-12 h-12 rounded-2xl bg-surface" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="h-4 bg-surface rounded w-1/3" />
        <div className="h-10 bg-surface rounded w-full" />
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, inProgress: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resolveComplaint, setResolveComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState("");
  const [societyId, setSocietyId] = useState("");
  const { user } = useUser();

  const [form, setForm] = useState({
    flatNumber: "",
    raisedBy: "",
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const isAdmin = ["chairman", "secretary", "treasurer"].includes(user?.role ?? "");

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => {
        setComplaints(d.complaints || []);
        setStats(d.stats || { open: 0, inProgress: 0, resolved: 0, total: 0 });
        if (d.societyId) setSocietyId(d.societyId);
      })
      .catch(() => toast.error("Failed to load records"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  useEffect(() => {
    if (user.name || user.flatNumber) {
      setForm(prev => ({
        ...prev,
        flatNumber: user.flatNumber || "",
        raisedBy: user.name || ""
      }));
    }
  }, [user.name, user.flatNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Request registered");
        setShowForm(false);
        setForm({ 
          flatNumber: user?.flatNumber || "", 
          raisedBy: user?.name || "", 
          title: "", 
          description: "", 
          category: "general", 
          priority: "medium" 
        });
        fetchComplaints();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to submit");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string, res?: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution: res }),
      });
      if (response.ok) {
        toast.success(`Updated to ${status}`);
        fetchComplaints();
      }
    } catch {
      toast.error("Update failed");
    }
    setResolveComplaint(null);
    setResolution("");
  };

  const filtered = complaints
    .filter((c) => (statusFilter === "all" || c.status === statusFilter))
    .filter((c) => (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flatNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ));

  return (
    <div className="page-container max-w-4xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Helpdesk</h1>
          <p className="text-text-secondary font-medium mt-1">Track and resolve society issues in one place</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && societyId && (
            <button
              onClick={() => {
                const link = `${window.location.origin}/complaint/submit?sId=${societyId}`;
                navigator.clipboard.writeText(link);
                toast.success("Form link copied!");
              }}
              className="p-3 rounded-2xl bg-surface border border-border text-text-secondary hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Stats */}
      {isAdmin ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "New", val: stats.open, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", icon: AlertTriangle },
            { label: "Active", val: stats.inProgress, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
            { label: "Fixed", val: stats.resolved, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 },
            { label: "Total", val: stats.total, color: "text-text-primary", bg: "bg-surface", icon: MessageSquare },
          ].map((s) => (
            <div key={s.label} className="bg-surface-raised p-5 rounded-[2rem] border border-border card-float flex flex-col justify-between h-32">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} strokeWidth={2.5} />
              </div>
              <div>
                <p className={cn("text-2xl font-black tracking-tight", s.color)}>{s.val}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{s.label} Issues</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800 shrink-0">
            <ShieldAlert className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <p className="font-black text-text-primary">Need immediate assistance?</p>
            <p className="text-sm text-text-secondary mt-0.5">
              Call Security Command at <strong className="text-blue-600">Ext 99</strong> for urgent on-site help.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
          <input 
            className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-12 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
            placeholder="Search by issue, flat or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {["all", "open", "in_progress", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
                statusFilter === s 
                  ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                  : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
              )}
            >
              {s === "all" ? "Board View" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <CheckCircle2 className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary">All Clear</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">
            No active issues found matching your filters. New requests will appear here once raised.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const priority = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
            const CatIcon = CATEGORY_ICONS[c.category.toLowerCase()] || MessageSquare;
            
            return (
              <div 
                key={c.id} 
                className="bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border border-border p-6 card-float group hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-transparent", priority.bg, priority.text)}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-text-tertiary uppercase tracking-wider">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-text-primary mb-2 leading-tight group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm font-medium text-text-secondary leading-relaxed mb-6">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm">
                           <CatIcon className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-text-primary leading-none mb-1">{c.raisedBy}</p>
                          <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tighter">Flat {c.flatNumber} • {c.category}</p>
                        </div>
                      </div>

                      {c.resolution && (
                         <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                           <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                           <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                             <span className="opacity-60 mr-1 uppercase text-[10px] tracking-widest font-black">Fixed:</span>
                             {c.resolution}
                           </p>
                         </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && (c.status === "open" || c.status === "in_progress") && (
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:pl-6 md:border-l border-border/50 justify-center">
                      {c.status === "open" && (
                        <button
                          onClick={() => updateStatus(c.id, "in_progress")}
                          className="flex-1 md:w-32 h-11 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-widest hover:bg-surface-raised transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      <button
                        onClick={() => setResolveComplaint(c)}
                        className="flex-1 md:w-32 h-11 rounded-xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                      >
                        Mark Fixed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-10 border border-border shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Raise Request</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Submit an issue for the committee to resolve</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors">
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Flat Number</label>
                  <input className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} disabled={!isAdmin && !!user?.flatNumber} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Reporter</label>
                  <input className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} disabled={!isAdmin && !!user?.name} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Issue Title</label>
                <input className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" placeholder="Briefly what is the issue?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Description</label>
                <textarea className="w-full bg-surface rounded-2xl px-4 py-3 font-medium text-text-primary border border-transparent focus:border-primary outline-none transition-all min-h-[120px] resize-none" placeholder="Provide more details to help us fix it faster..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                  <select className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {Object.keys(CATEGORY_ICONS).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Priority</label>
                  <select className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Routine</option>
                    <option value="medium">Standard</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  {saving ? "Submitting..." : "Raise Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setResolveComplaint(null)} />
          <div className="relative w-full max-w-md bg-surface-raised rounded-[2.5rem] p-8 border border-border shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">Resolve Issue</h2>
                <p className="text-xs font-medium text-text-secondary mt-1">Closing: {resolveComplaint.title}</p>
              </div>
              <button onClick={() => setResolveComplaint(null)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors"><X className="w-5 h-5" strokeWidth={2.5} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Resolution Details</label>
                <textarea className="w-full bg-surface rounded-2xl px-4 py-3 font-medium text-text-primary border border-transparent focus:border-primary outline-none transition-all min-h-[120px] resize-none" placeholder="What was done to fix this?" value={resolution} onChange={(e) => setResolution(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setResolveComplaint(null)} className="flex-1 h-12 rounded-xl font-bold text-text-secondary hover:bg-surface transition-colors">Cancel</button>
                <button onClick={() => updateStatus(resolveComplaint.id, "resolved", resolution)} disabled={!resolution.trim()} className="flex-[2] h-12 bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20">Mark Fixed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
