"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserCheck, Clock, Plus, Calendar, ShieldCheck, X,
  Phone, User, CheckCircle2, XCircle, Bell, ArrowDownLeft,
  ArrowUpRight, History, QrCode, Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Visitor {
  id: string;
  visitorName: string;
  phone: string | null;
  purpose: string;
  status: string;
  isPreApproved: boolean;
  expectedAt: string | null;
  entryTime: string | null;
  exitTime: string | null;
  residentResponse: string | null;
  approvedBy: string | null;
  flatNumber: string;
  createdAt: string;
}

const PURPOSE_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  delivery: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600", label: "Delivery", icon: User },
  guest:    { bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-600",   label: "Guest", icon: UserCheck },
  service:  { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600", label: "Service", icon: User },
  cab:      { bg: "bg-emerald-50 dark:bg-emerald-900/20",text: "text-emerald-600",label: "Cab / Taxi", icon: UserCheck },
  other:    { bg: "bg-slate-50 dark:bg-slate-900/20",  text: "text-text-secondary",  label: "Other", icon: User },
};

const getPurpose = (key: string) => PURPOSE_CONFIG[key] ?? PURPOSE_CONFIG.other;

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] p-5 border border-border animate-pulse flex gap-4">
      <div className="w-12 h-12 rounded-2xl bg-surface flex-shrink-0" />
      <div className="flex-1 space-y-2 mt-1">
        <div className="h-4 bg-surface rounded w-1/3" />
        <div className="h-3 bg-surface rounded w-1/2" />
      </div>
    </div>
  );
}

function statusLabel(v: Visitor): string {
  if (v.status === "expected" && !v.residentResponse && !v.isPreApproved) return "Waiting at Gate";
  if (v.status === "expected" && v.residentResponse === "approved") return v.isPreApproved ? "Pre-approved" : "Entry Approved";
  if (v.status === "in")       return "Inside Premises";
  if (v.status === "out")      return "Visit Completed";
  if (v.status === "rejected") return "Entry Denied";
  return v.status;
}

function statusColor(v: Visitor): string {
  if (v.status === "expected" && !v.residentResponse && !v.isPreApproved) return "text-warning";
  if (v.status === "in")  return "text-success";
  if (v.status === "out") return "text-text-tertiary";
  if (v.status === "rejected") return "text-danger";
  return "text-primary";
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatTime(value?: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function visitDuration(entry?: string | null, exit?: string | null) {
  if (!entry || !exit) return "";
  const mins = Math.max(0, Math.round((new Date(exit).getTime() - new Date(entry).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function MyVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    visitorName: "",
    phone: "",
    purpose: "guest",
    expectedAt: new Date().toISOString().slice(0, 16),
  });

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/my-visitors${showHistory ? "?history=all" : ""}`);
      const data = await res.json();
      if (data.visitors) setVisitors(data.visitors);
    } catch {
      toast.error("Unable to load visitor log.");
    } finally {
      setLoading(false);
    }
  }, [showHistory]);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const approve = params.get("approve");
    if (approve) setHighlightId(approve);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitorName.trim()) { toast.error("Please enter guest name."); return; }
    setSaving(true);
    const tid = toast.loading("Processing...");
    try {
      const res = await fetch("/api/my-visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Guest pre-approved!", { id: tid });
        setShowForm(false);
        setForm({ visitorName: "", phone: "", purpose: "guest", expectedAt: new Date().toISOString().slice(0, 16) });
        fetchVisitors();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed to pre-approve.", { id: tid });
      }
    } catch {
      toast.error("Error occurred.", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleApproval = async (visitorId: string, action: "approved" | "rejected") => {
    setActionLoading(visitorId);
    try {
      const res = await fetch("/api/my-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message ?? "Action completed.");
        fetchVisitors();
      } else {
        toast.error(data.error ?? "Action failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = visitors.filter(
    (v) => v.status === "expected" && !v.residentResponse && !v.isPreApproved
  ).length;

  const sortedVisitors = [...visitors].sort((a, b) => {
    const aNeedsAction = a.status === "expected" && !a.residentResponse && !a.isPreApproved;
    const bNeedsAction = b.status === "expected" && !b.residentResponse && !b.isPreApproved;
    return aNeedsAction === bNeedsAction ? 0 : aNeedsAction ? -1 : 1;
  });

  return (
    <div className="page-container max-w-3xl mx-auto space-y-6 pb-20">
      {/* Premium Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Visitor Management</h1>
          <p className="text-text-secondary font-medium mt-1">
            {pendingCount > 0
              ? `${pendingCount} guest waiting at the security gate`
              : "Pre-approve guests for a seamless entry experience"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-2xl h-12 px-6"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span>Pre-approve Guest</span>
        </button>
      </div>

      {/* Floating Action Alerts */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Bell className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-400">Immediate Action Required</p>
            <p className="text-sm text-amber-800/80 dark:text-amber-400/80">Security is waiting for your response at the gate.</p>
          </div>
        </div>
      )}

      {/* List Filters & Actions */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          {showHistory ? <History className="w-5 h-5 text-primary" strokeWidth={2.5} /> : <UserCheck className="w-5 h-5 text-primary" strokeWidth={2.5} />}
          {showHistory ? "Visit History" : "Recent Arrivals"}
        </h2>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
        >
          {showHistory ? "View Recent" : "View Full History"}
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : sortedVisitors.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-12 border border-border card-float flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-surface flex items-center justify-center mb-6">
            <UserCheck className="w-10 h-10 text-text-tertiary" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-text-primary">No visitors to show</h3>
          <p className="text-text-secondary mt-2 max-w-sm">
            Visitor entries and pre-approved digital passes will appear here once they are generated.
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-8 px-8 h-12 rounded-2xl">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Pre-approve First Guest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {sortedVisitors.map((v) => {
            const config = getPurpose(v.purpose);
            const needsApproval = v.status === "expected" && !v.residentResponse && !v.isPreApproved;
            const isHighlighted = highlightId === v.id || needsApproval;

            return (
              <div
                key={v.id}
                className={cn(
                  "bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border p-5 card-float group relative transition-all duration-300",
                  isHighlighted ? "border-amber-400/50 shadow-xl shadow-amber-500/5" : "border-border"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", config.bg)}>
                    <config.icon className={cn("w-6 h-6", config.text)} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-text-primary truncate pr-2">{v.visitorName}</h3>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg", config.bg, config.text)}>
                        {config.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn("text-xs font-bold", statusColor(v))}>
                        {statusLabel(v)}
                      </span>
                      {v.phone && (
                        <a href={`tel:${v.phone}`} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {v.phone}
                        </a>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {!v.entryTime && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-text-tertiary">
                          <Calendar className="w-3.5 h-3.5" />
                          {v.expectedAt ? formatDateTime(v.expectedAt) : "Date Not Specified"}
                        </div>
                      )}
                      {v.entryTime && (
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary">
                             <ArrowDownLeft className="w-3.5 h-3.5 text-success" />
                             In: {formatTime(v.entryTime)}
                           </div>
                           {v.exitTime && (
                             <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary">
                               <ArrowUpRight className="w-3.5 h-3.5 text-danger" />
                               Out: {formatTime(v.exitTime)}
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visitor Pass Token (Digital Pass Concept) */}
                {v.isPreApproved && v.status === "expected" && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                        <QrCode className="w-4 h-4 text-text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Digital Pass</p>
                        <p className="text-sm font-black text-primary tracking-widest">#{v.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-surface text-text-tertiary hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}

                {/* Critical Approval CTAs */}
                {needsApproval && (
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleApproval(v.id, "approved")}
                      disabled={actionLoading === v.id}
                      className="flex-1 h-12 rounded-2xl bg-success text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-success/20 hover:scale-[1.02] transition-all"
                    >
                      {actionLoading === v.id ? <span className="spinner spinner-sm" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                      Allow
                    </button>
                    <button
                      onClick={() => handleApproval(v.id, "rejected")}
                      disabled={actionLoading === v.id}
                      className="flex-1 h-12 rounded-2xl bg-danger/10 text-danger font-black text-sm flex items-center justify-center gap-2 hover:bg-danger/20 transition-all"
                    >
                      <XCircle className="w-4 h-4" strokeWidth={2.5} />
                      Deny
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Slide-up Pre-approve Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-8 border border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Visitor Pass</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Generate a digital token for your guest</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Guest Full Name</label>
                <input
                  className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all placeholder:font-medium"
                  placeholder="Who's visiting?"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Mobile Number</label>
                  <input
                    className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all"
                    type="tel"
                    placeholder="10 digits"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Purpose</label>
                  <select
                    className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  >
                    <option value="guest">Guest</option>
                    <option value="delivery">Delivery</option>
                    <option value="service">Service</option>
                    <option value="cab">Cab</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-text-tertiary ml-1">Expected Arrival</label>
                <input
                  type="datetime-local"
                  className="w-full h-12 bg-surface rounded-2xl px-4 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all"
                  value={form.expectedAt}
                  onChange={(e) => setForm({ ...form, expectedAt: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-12 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">
                  Discard
                </button>
                <button type="submit" disabled={saving} className="flex-[2] h-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  {saving ? <span className="spinner spinner-sm" /> : <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />}
                  Confirm Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
