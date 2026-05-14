"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/user-context";
import toast from "react-hot-toast";
import { 
  Plus, AlertTriangle, CheckCircle2, Clock, Share2, 
  MessageSquare, Info, ShieldAlert, Calendar, X, 
  ChevronRight, Filter, Search, MoreVertical, CheckCircle
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

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

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
  medium: { label: "Medium", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  high: { label: "High", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  urgent: { label: "Urgent", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
};

const categories = ["general", "plumbing", "electrical", "cleanliness", "security", "parking", "other"];

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
      .catch(() => toast.error("Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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
        toast.success("Complaint registered successfully");
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
      toast.error("Something went wrong");
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
        toast.success(`Complaint ${status === "resolved" ? "resolved" : "updated"}`);
        fetchComplaints();
      }
    } catch {
      toast.error("Failed to update status");
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
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Helpdesk</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and resolve society issues in one place
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && societyId && (
            <button
              onClick={() => {
                const link = `${window.location.origin}/complaint/submit?sId=${societyId}`;
                navigator.clipboard.writeText(link);
                toast.success("Shareable form link copied!");
              }}
              className="btn btn-secondary !rounded-2xl"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share Link
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-xl shadow-primary/20 !rounded-2xl">
            <Plus className="w-5 h-5 mr-2" /> New Request
          </button>
        </div>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New", val: stats.open, color: "text-rose-600", bg: "bg-rose-50", icon: AlertTriangle, border: "border-rose-100" },
            { label: "Active", val: stats.inProgress, color: "text-amber-600", bg: "bg-amber-50", icon: Clock, border: "border-amber-100" },
            { label: "Fixed", val: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, border: "border-emerald-100" },
            { label: "Total", val: stats.total, color: "text-slate-600", bg: "bg-slate-50", icon: Info, border: "border-slate-100" },
          ].map((s) => (
            <div key={s.label} className={`bg-white dark:bg-slate-800 p-5 rounded-[2rem] border ${s.border} dark:border-slate-700 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} dark:bg-slate-900/50 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label} Issues</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Need immediate help?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Call Security Command at <strong>Ext 99</strong> for urgent issues.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="input !pl-11 !rounded-2xl !bg-white dark:!bg-slate-800 font-bold text-sm" 
            placeholder="Search by issue or flat..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
          {["all", "open", "in_progress", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                statusFilter === s 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
              }`}
            >
              {s === "all" ? "Board View" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No issues found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Everything seems to be working perfectly. New helpdesk requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {filtered.map((c) => (
            <div key={c.id} className="card p-0 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${priorityConfig[c.priority]?.bg} ${priorityConfig[c.priority]?.color}`}>
                      {priorityConfig[c.priority]?.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary text-[10px] font-black border border-slate-200 dark:border-slate-800">
                          {c.flatNumber?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none mb-1">{c.raisedBy}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Flat {c.flatNumber} • {c.category}</p>
                        </div>
                      </div>
                      
                      {c.resolution && (
                        <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                            <span className="opacity-60 uppercase tracking-tighter mr-1">FIXED:</span> 
                            {c.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && (c.status === "open" || c.status === "in_progress") && (
                    <div className="flex flex-col gap-2 shrink-0 sm:pl-6 sm:border-l border-slate-100 dark:border-slate-800 justify-center">
                      {c.status === "open" && (
                        <button
                          onClick={() => updateStatus(c.id, "in_progress")}
                          className="btn btn-secondary !py-2.5 !rounded-xl text-xs font-black shadow-sm"
                        >
                          Start Work
                        </button>
                      )}
                      <button
                        onClick={() => setResolveComplaint(c)}
                        className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-700 !py-2.5 !rounded-xl text-xs font-black shadow-lg shadow-emerald-100/50"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      {showForm && (
        <div className="modal-overlay z-50" onClick={() => setShowForm(false)}>
          <div className="modal-content !max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Raise Request</h2>
                  <p className="text-xs text-slate-500 font-semibold tracking-tight">Your issue will be tracked by the committee</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Flat Number</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} disabled={!isAdmin && !!user?.flatNumber} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reporter</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} disabled={!isAdmin && !!user?.name} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Subject</label>
                <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="Short title of the problem" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Problem Details</label>
                <textarea className="textarea !bg-slate-50 dark:!bg-slate-900 min-h-[120px] font-medium" placeholder="Describe what's wrong and where..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                  <select className="select !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Urgency</label>
                  <select className="select !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Routine</option>
                    <option value="medium">Standard</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Immediate Action</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn btn-secondary h-14">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] btn btn-primary h-14 shadow-xl shadow-primary/20">
                  {saving ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveComplaint && (
        <div className="modal-overlay z-50" onClick={() => setResolveComplaint(null)}>
          <div className="modal-content !max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Confirm Resolution</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Issue: {resolveComplaint.title}</p>
              </div>
              <button onClick={() => setResolveComplaint(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Closing Notes</label>
                <textarea className="textarea !bg-slate-50 dark:!bg-slate-900 min-h-[120px] font-medium" placeholder="Briefly describe what was done to fix this..." value={resolution} onChange={(e) => setResolution(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setResolveComplaint(null)} className="flex-1 btn btn-secondary h-12">Cancel</button>
                <button onClick={() => updateStatus(resolveComplaint.id, "resolved", resolution)} disabled={!resolution.trim()} className="flex-[2] btn btn-success h-12">Mark Fixed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
