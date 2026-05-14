"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Users, Clock, Phone, Search, X, CheckCircle, Briefcase, MapPin, ArrowRight, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  category: string;
  entryCode: string | null;
  isActive: boolean;
  flatLinks: { agreedMonthlyPay: number | null; flat: { flatNumber: string; wing: string | null } }[];
}

interface Flat {
  id: string;
  flatNumber: string;
  wing: string | null;
}

const categoryStyles: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  maid: { bg: "bg-rose-50 dark:bg-rose-900/10", text: "text-rose-600 dark:text-rose-400", label: "Maid", icon: Users },
  cook: { bg: "bg-orange-50 dark:bg-orange-900/10", text: "text-orange-600 dark:text-orange-400", label: "Cook", icon: Users },
  driver: { bg: "bg-blue-50 dark:bg-blue-900/10", text: "text-blue-600 dark:text-blue-400", label: "Driver", icon: Users },
  nanny: { bg: "bg-purple-50 dark:bg-purple-900/10", text: "text-purple-600 dark:text-purple-400", label: "Nanny", icon: Users },
  gardener: { bg: "bg-emerald-50 dark:bg-emerald-900/10", text: "text-emerald-600 dark:text-emerald-400", label: "Gardener", icon: Users },
  watchman: { bg: "bg-amber-50 dark:bg-amber-900/10", text: "text-amber-600 dark:text-amber-400", label: "Watchman", icon: Users },
  other: { bg: "bg-slate-50 dark:bg-slate-900/10", text: "text-slate-600 dark:text-slate-400", label: "Other", icon: Briefcase },
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [marking, setMarking] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: "maid",
    flatIds: [] as string[],
    agreedMonthlyPay: "",
  });

  const fetchStaff = useCallback(() => {
    setLoading(true);
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load staff"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStaff();
    fetch("/api/members?flatsOnly=true")
      .then((r) => r.json())
      .then((d) => setFlats(d.flats || d || []))
      .catch(() => {});
  }, [fetchStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Staff member registered");
        setShowForm(false);
        setForm({ name: "", phone: "", category: "maid", flatIds: [], agreedMonthlyPay: "" });
        fetchStaff();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to register staff");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const markAttendance = async (staffId: string) => {
    setMarking(staffId);
    try {
      const res = await fetch("/api/staff/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          data.action === "checkin"
            ? `${data.staff.name} checked IN ✅`
            : `${data.staff.name} checked OUT 👋`
        );
      }
    } catch {
      toast.error("Failed to record attendance");
    } finally {
      setMarking(null);
    }
  };

  const toggleFlatSelection = (flatId: string) => {
    setForm((prev) => ({
      ...prev,
      flatIds: prev.flatIds.includes(flatId)
        ? prev.flatIds.filter((id) => id !== flatId)
        : [...prev.flatIds, flatId],
    }));
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff & Daily Help</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and track domestic help attendance
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Staff
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone or category..."
          className="input pl-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Staff Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No staff found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
              {search ? "No staff matches your search criteria." : "Register your domestic help to track their entry and attendance."}
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="mt-4 text-primary font-semibold text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s) => {
              const style = categoryStyles[s.category] || categoryStyles.other;
              const CategoryIcon = style.icon;
              
              return (
                <div key={s.id} className="card p-5 flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center`}>
                        <CategoryIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                            {s.name}
                          </h3>
                          {s.isActive && (
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                          • {s.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {s.flatLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {s.flatLinks.map((link, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {link.flat.wing ? `${link.flat.wing}-` : ""}{link.flat.flatNumber}
                          </span>
                          {link.agreedMonthlyPay && (
                            <span className="text-[10px] font-bold text-primary ml-1">
                              {formatCurrency(link.agreedMonthlyPay)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {s.entryCode && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl flex items-center justify-between border border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          Gate Access Code
                        </span>
                      </div>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-widest font-mono">
                        {s.entryCode}
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => markAttendance(s.id)}
                      disabled={marking === s.id}
                      className="btn btn-secondary w-full"
                    >
                      {marking === s.id ? (
                        <div className="spinner !w-4 !h-4" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Mark Attendance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register Staff</h2>
                  <p className="text-sm text-slate-500">Add domestic help or society staff</p>
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
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                  <input 
                    className="input" 
                    placeholder="Enter staff name" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                  <input 
                    className="input" 
                    placeholder="+91 00000 00000" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
                    <select 
                      className="select" 
                      value={form.category} 
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="maid">Maid</option>
                      <option value="cook">Cook</option>
                      <option value="driver">Driver</option>
                      <option value="nanny">Nanny</option>
                      <option value="gardener">Gardener</option>
                      <option value="watchman">Watchman</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Monthly Pay (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      placeholder="e.g. 2500"
                      value={form.agreedMonthlyPay}
                      onChange={(e) => setForm({ ...form, agreedMonthlyPay: e.target.value })}
                    />
                  </div>
                </div>

                {flats.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Link to Flats</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                      {flats.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFlatSelection(f.id)}
                          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                            form.flatIds.includes(f.id)
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                          }`}
                        >
                          {f.wing ? `${f.wing}-` : ""}{f.flatNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  {saving ? "Registering..." : "Register Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
