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
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parcel Desk</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track incoming deliveries and packages</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn btn-primary w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Package
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            className="input pl-12" 
            placeholder="Search by flat or courier name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["all", "received", "collected", "returned"].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                filter === f 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50"
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <PackageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No parcels found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
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
                  className={`card p-5 flex flex-col gap-5 relative overflow-hidden ${
                    isOverdue ? "border-rose-200 dark:border-rose-900/50" : ""
                  }`}
                >
                  {isOverdue && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                        Overdue
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Truck className="w-7 h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">
                          {p.courierName || "Local Delivery"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {style.label}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recipient</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {p.flat.wing ? `${p.flat.wing}-` : ""}{p.flat.flatNumber}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                          {p.flat.ownerName.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      "{p.description}"
                    </p>
                  )}

                  {p.status === "received" && (
                    <div className="pt-2">
                      <button 
                        onClick={() => markCollected(p.id)} 
                        className="btn btn-primary w-full shadow-lg shadow-primary/20"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
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
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <PackageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log Package</h2>
                  <p className="text-sm text-slate-500">Record new incoming delivery</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Flat Number *</label>
                  <input 
                    className="input" 
                    placeholder="e.g. A-101" 
                    value={form.flatNumber} 
                    onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Courier Service</label>
                  <input 
                    className="input" 
                    placeholder="Amazon, Flipkart, Swiggy, etc." 
                    value={form.courierName} 
                    onChange={(e) => setForm({ ...form, courierName: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Package Description</label>
                  <textarea 
                    className="input min-h-[100px] py-3" 
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
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-[2] btn btn-primary shadow-xl shadow-primary/20"
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
