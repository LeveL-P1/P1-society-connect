"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Package as PackageIcon, Search, CheckCircle, Clock, AlertTriangle, Truck, X, Filter, User, MapPin } from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface PackageEntry {
  id: string;
  courierName: string | null;
  description: string | null;
  status: string;
  receivedAt: string;
  collectedAt: string | null;
  collectedBy: string | null;
  pickupOtp: string | null;
  flat: { flatNumber: string; wing: string | null; ownerName: string; contact: string };
}

const statusStyles: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  received: { bg: "bg-amber-50 dark:bg-amber-900/10", text: "text-amber-600 dark:text-amber-400", label: "At Gate", icon: Clock },
  notified: { bg: "bg-blue-50 dark:bg-blue-900/10", text: "text-blue-600 dark:text-blue-400", label: "Notified", icon: AlertTriangle },
  collected: { bg: "bg-emerald-50 dark:bg-emerald-900/10", text: "text-emerald-600 dark:text-emerald-400", label: "Collected", icon: CheckCircle },
  returned: { bg: "bg-rose-50 dark:bg-rose-900/10", text: "text-rose-600 dark:text-rose-400", label: "Returned", icon: X },
  lost: { bg: "bg-slate-50 dark:bg-slate-900/10", text: "text-slate-600 dark:text-slate-400", label: "Lost", icon: AlertTriangle },
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({ flatNumber: "", courierName: "", description: "" });

  const fetchPackages = useCallback(() => {
    setLoading(true);
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) => setPackages(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load packages"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Package logged successfully");
        setShowForm(false);
        setForm({ flatNumber: "", courierName: "", description: "" });
        fetchPackages();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to log package");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const markCollected = async (packageId: string) => {
    try {
      const res = await fetch("/api/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, action: "collected" }),
      });
      if (res.ok) {
        toast.success("Package marked as collected ✅");
        fetchPackages();
      }
    } catch { toast.error("Failed to update"); }
  };

  const filtered = packages.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.flat.flatNumber.toLowerCase().includes(search.toLowerCase()) &&
        !(p.courierName || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Parcel Desk</h1>
          <p className="text-text-secondary font-medium mt-1">Track incoming deliveries and packages</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Log Package
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
          <input 
            type="text"
            className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-14 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
            placeholder="Search by flat or courier name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {["all", "received", "collected", "returned"].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
                filter === f 
                  ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                  : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
              }`}
            >
              {f === "all" ? "All Deliveries" : (statusStyles[f]?.label || f)}
            </button>
          ))}
        </div>
      </div>

      {/* Package List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
            <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
              <PackageIcon className="w-10 h-10 opacity-50" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary tracking-tight">No parcels found</h3>
            <p className="text-text-secondary mt-2 max-w-sm mx-auto">
              {search ? "No parcels match your search criteria." : "All deliveries have been collected or returned."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => {
              const style = statusStyles[p.status] || statusStyles.received;
              const StatusIcon = style.icon;
              const hoursAgo = Math.round((Date.now() - new Date(p.receivedAt).getTime()) / 3600000);
              const isOverdue = p.status === "received" && hoursAgo > 24;

              return (
                <div 
                  key={p.id} 
                  className={`card-float bg-surface-raised p-6 flex flex-col gap-6 relative overflow-hidden rounded-[2rem_1.5rem_2rem_1.5rem] border group transition-all ${
                    isOverdue ? "border-rose-300 dark:border-rose-800/50" : "border-border hover:border-primary/20"
                  }`}
                >
                  {isOverdue && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-[1rem] uppercase tracking-widest shadow-sm">
                        Overdue
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      <Truck className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-text-primary text-lg sm:text-xl truncate leading-tight group-hover:text-primary transition-colors">
                          {p.courierName || "Local Delivery"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${style.bg} ${style.text}`}>
                          <StatusIcon className="w-3 h-3" strokeWidth={3} />
                          {style.label}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-border">
                          <Clock className="w-3 h-3" strokeWidth={2.5} />
                          {new Date(p.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-[1.25rem] border border-border group-hover:border-primary/10 transition-colors">
                      <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1.5">Recipient</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        <span className="text-sm font-bold text-text-primary">
                          {p.flat.wing ? `${p.flat.wing}-` : ""}{p.flat.flatNumber}
                        </span>
                      </div>
                    </div>
                    <div className="bg-surface p-4 rounded-[1.25rem] border border-border group-hover:border-primary/10 transition-colors">
                      <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1.5">Owner</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        <span className="text-sm font-bold text-text-primary truncate">
                          {p.flat.ownerName.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm font-bold text-text-secondary italic bg-surface p-4 rounded-[1.25rem] border border-dashed border-border group-hover:border-primary/20 transition-colors">
                      "{p.description}"
                    </p>
                  )}

                  {p.status === "received" && (
                    <div className="pt-2">
                      <button 
                        onClick={() => markCollected(p.id)} 
                        className="w-full h-14 rounded-[1.5rem] bg-primary/10 text-primary hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center transition-all active:scale-95"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        Confirm Collection
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Package Modal */}
      {showForm && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowForm(false)}>
          <div className="bg-surface-raised w-full max-w-lg sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                  <PackageIcon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">Log Package</h2>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">Record new incoming delivery</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-surface rounded-full text-text-tertiary transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Flat Number *</label>
                  <input 
                    className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="e.g. A-101" 
                    value={form.flatNumber} 
                    onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Courier Service</label>
                  <input 
                    className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="Amazon, Flipkart, Swiggy, etc." 
                    value={form.courierName} 
                    onChange={(e) => setForm({ ...form, courierName: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Package Description</label>
                  <textarea 
                    className="w-full min-h-[120px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none"
                    placeholder="Any special notes (e.g. large box, fragile, envelope)" 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 h-14 bg-surface rounded-[1.5rem] border border-border text-text-primary hover:bg-surface-raised font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-[2] h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Logging..." : "Confirm Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
