"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserCheck, Clock, Plus, Calendar, ShieldCheck, X,
  Phone, User, CheckCircle2, XCircle, Bell, ArrowDownLeft,
  ArrowUpRight, History, Copy,
} from "lucide-react";
import toast from "react-hot-toast";

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

const PURPOSE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  delivery: { bg: "bg-orange-50", text: "text-orange-700", label: "Delivery"   },
  guest:    { bg: "bg-blue-50",   text: "text-blue-700",   label: "Guest"      },
  service:  { bg: "bg-purple-50", text: "text-purple-700", label: "Service"    },
  cab:      { bg: "bg-emerald-50",text: "text-emerald-700",label: "Cab / Taxi" },
  other:    { bg: "bg-slate-50",  text: "text-slate-600",  label: "Other"      },
};

const getPurpose = (key: string) => PURPOSE_CONFIG[key] ?? PURPOSE_CONFIG.other;

function SkeletonCard() {
  return (
    <div className="card animate-shimmer space-y-3" style={{ minHeight: 100 }}>
      <div className="flex gap-4 items-center">
        <div className="skeleton rounded-xl flex-shrink-0" style={{ width: 44, height: 44 }} />
        <div className="flex-1 space-y-2">
          <div className="skeleton skeleton-title w-2/5" />
          <div className="skeleton skeleton-text w-3/5" />
        </div>
      </div>
    </div>
  );
}

function statusLabel(v: Visitor): string {
  if (v.status === "expected" && !v.residentResponse && !v.isPreApproved) return "Waiting at gate";
  if (v.status === "expected" && v.residentResponse === "approved") return v.isPreApproved ? "Pre-approved" : "Entry approved";
  if (v.status === "in")       return "Inside premises";
  if (v.status === "out")      return "Visit completed";
  if (v.status === "rejected") return "Entry denied";
  return v.status;
}

function statusColor(v: Visitor): string {
  if (v.status === "expected" && !v.residentResponse && !v.isPreApproved) return "text-amber-600";
  if (v.status === "in")  return "text-emerald-600";
  if (v.status === "out") return "text-slate-500";
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
      toast.error("Unable to load visitor log. Please try again.");
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
    if (!form.visitorName.trim()) { toast.error("Please enter the visitor's name."); return; }
    setSaving(true);
    const tid = toast.loading("Creating pre-approval...");
    try {
      const res = await fetch("/api/my-visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Guest pre-approved. They can enter smoothly.", { id: tid });
        setShowForm(false);
        setForm({ visitorName: "", phone: "", purpose: "guest", expectedAt: new Date().toISOString().slice(0, 16) });
        fetchVisitors();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed to create pre-approval.", { id: tid });
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { id: tid });
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
        toast.success(data.message ?? (action === "approved" ? "Visitor approved for entry." : "Visitor entry denied."));
        fetchVisitors();
      } else {
        toast.error(data.error ?? "Action failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  /* Visitors needing approval shown first */
  const sortedVisitors = [...visitors].sort((a, b) => {
    const aNeedsAction = a.status === "expected" && !a.residentResponse && !a.isPreApproved;
    const bNeedsAction = b.status === "expected" && !b.residentResponse && !b.isPreApproved;
    return aNeedsAction === bNeedsAction ? 0 : aNeedsAction ? -1 : 1;
  });

  const pendingCount = visitors.filter(
    (v) => v.status === "expected" && !v.residentResponse && !v.isPreApproved
  ).length;

  return (
    <div className="page-container max-w-2xl mx-auto space-y-5">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Visitors</h1>
          <p className="page-subtitle">
            {pendingCount > 0
              ? `${pendingCount} visitor${pendingCount > 1 ? "s" : ""} waiting for approval`
              : "Pre-approve guests for faster entry"}
          </p>
        </div>
        <button
          id="pre-approve-btn"
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Pre-approve Guest
        </button>
      </div>

      {/* Pending approval alert */}
      {pendingCount > 0 && (
        <div className="info-banner info-banner-warning rounded-2xl">
          <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              {pendingCount} visitor{pendingCount > 1 ? "s are" : " is"} waiting at the gate
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              Scroll down to approve or deny entry
            </p>
          </div>
        </div>
      )}

      {/* History toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-secondary">
          {showHistory ? "Full history" : "Recent visitors"}
        </p>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="btn btn-ghost btn-sm border border-border"
        >
          <History className="w-3.5 h-3.5" />
          {showHistory ? "Show recent" : "Full history"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : sortedVisitors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3>No visitor records</h3>
          <p>Gate entries and pre-approved guests will appear here.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Pre-approve a Guest
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVisitors.map((v) => {
            const style = getPurpose(v.purpose);
            const needsApproval = v.status === "expected" && !v.residentResponse && !v.isPreApproved;
            const isHighlighted = highlightId === v.id || needsApproval;

            return (
              <article
                key={v.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-shadow ${
                  isHighlighted
                    ? "border-amber-300 shadow-md shadow-amber-50"
                    : "border-border hover:shadow-sm"
                }`}
                aria-label={`Visitor: ${v.visitorName}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}
                  >
                    <User className={`w-5 h-5 ${style.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + purpose */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-text-primary">
                        {v.visitorName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                      {needsApproval && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Bell className="w-3 h-3" /> At gate
                        </span>
                      )}
                    </div>

                    {/* Status + phone */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className={`text-sm font-semibold ${statusColor(v)}`}>
                        {statusLabel(v)}
                      </span>
                      {v.phone && (
                        <a
                          href={`tel:${v.phone}`}
                          className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary"
                        >
                          <Phone className="w-3 h-3" />
                          {v.phone}
                        </a>
                      )}
                    </div>

                    {/* Times */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                      {!v.entryTime && (
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {v.expectedAt
                            ? `Expected ${formatDateTime(v.expectedAt)}`
                            : `Requested ${formatDateTime(v.createdAt)}`}
                        </span>
                      )}
                      {v.entryTime && (
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3" />
                          In {formatTime(v.entryTime)}
                        </span>
                      )}
                      {v.exitTime && (
                        <>
                          <span className="text-xs text-text-tertiary flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            Out {formatTime(v.exitTime)}
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {visitDuration(v.entryTime, v.exitTime)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval actions — large, thumb-friendly */}
                {needsApproval && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApproval(v.id, "approved")}
                      disabled={actionLoading === v.id}
                      className="btn btn-success flex-1"
                      aria-label={`Approve ${v.visitorName}`}
                    >
                      {actionLoading === v.id ? (
                        <span className="spinner spinner-sm" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Allow Entry
                    </button>
                    <button
                      onClick={() => handleApproval(v.id, "rejected")}
                      disabled={actionLoading === v.id}
                      className="btn btn-danger flex-1"
                      aria-label={`Deny ${v.visitorName}`}
                    >
                      <XCircle className="w-4 h-4" />
                      Deny Entry
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Pre-approve modal */}
      {showForm && (
        <div
          className="modal-overlay z-50"
          onClick={() => setShowForm(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Pre-approve a guest"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Pre-approve Guest</h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  Guest can enter without waiting
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="btn-icon btn-ghost" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="form-group !mb-0">
                <label className="label" htmlFor="visitor-name">Guest Name *</label>
                <input
                  id="visitor-name"
                  className="input"
                  placeholder="Full name of your guest"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group !mb-0">
                <label className="label" htmlFor="visitor-phone">
                  Guest Phone <span className="text-text-tertiary font-normal">(optional)</span>
                </label>
                <input
                  id="visitor-phone"
                  className="input"
                  type="tel"
                  placeholder="Mobile number"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-group !mb-0">
                <label className="label" htmlFor="visitor-purpose">Purpose of Visit</label>
                <select
                  id="visitor-purpose"
                  className="select"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                >
                  <option value="guest">Guest / Relative</option>
                  <option value="delivery">Delivery</option>
                  <option value="service">Service / Repair</option>
                  <option value="cab">Cab / Taxi</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group !mb-0">
                <label className="label" htmlFor="visitor-time">Expected Arrival *</label>
                <input
                  id="visitor-time"
                  type="datetime-local"
                  className="input"
                  value={form.expectedAt}
                  onChange={(e) => setForm({ ...form, expectedAt: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary flex-[2]">
                  {saving ? (
                    <><span className="spinner spinner-sm" /> Saving...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Confirm Pre-approval</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
