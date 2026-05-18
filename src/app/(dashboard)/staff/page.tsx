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
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Staff & Daily Help</h1>
          <p className="text-text-secondary font-medium mt-1">
            Manage and track domestic help attendance
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
          Register Staff
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="relative w-full">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Search by name, phone or category..."
          className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-14 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      `{/* Staff Grid */}
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
              <Users className="w-10 h-10 opacity-50" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-text-primary tracking-tight">No staff found</h3>
            <p className="text-text-secondary mt-2 max-w-sm mx-auto">
              {search ? "No staff matches your search criteria." : "Register your domestic help to track their entry and attendance."}
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="mt-6 text-primary font-black uppercase tracking-widest text-[10px]"
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
                <div key={s.id} className="card-float bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border border-border overflow-hidden flex flex-col group hover:border-primary/20 transition-all">
                  <div className="p-5 sm:p-6 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                          <CategoryIcon className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-text-primary text-lg sm:text-xl tracking-tight truncate leading-tight">
                            {s.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                            {s.isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" title="Currently inside" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Mobile Contact</p>
                          <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                             <Phone className="w-4 h-4 text-primary" strokeWidth={2.5} /> {s.phone}
                          </p>
                       </div>
                       
                       {s.entryCode && (
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Gate Access Code</p>
                            <p className="text-sm font-black text-text-primary flex items-center gap-2 tracking-widest font-mono text-primary">
                               <Clock className="w-4 h-4 text-primary" strokeWidth={2.5} /> {s.entryCode}
                            </p>
                         </div>
                       )}
                    </div>

                    {s.flatLinks.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                           <MapPin className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Linked Units</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {s.flatLinks.map((link, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-[1rem] border border-border hover:border-primary/20 transition-colors"
                            >
                              <span className="text-sm font-bold text-text-secondary">
                                {link.flat.wing ? `${link.flat.wing}-` : ""}{link.flat.flatNumber}
                              </span>
                              {link.agreedMonthlyPay && (
                                <span className="text-[10px] font-black text-primary ml-1 bg-primary/10 px-2 py-0.5 rounded-md">
                                  {formatCurrency(link.agreedMonthlyPay)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-surface border-t border-border mt-auto">
                    <button
                      onClick={() => markAttendance(s.id)}
                      disabled={marking === s.id}
                      className="w-full h-12 rounded-xl bg-surface-raised border border-border text-text-primary hover:text-primary hover:border-primary/30 font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                    >
                      {marking === s.id ? (
                        <div className="spinner !w-4 !h-4 border-text-tertiary border-t-primary" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5} />
                          Toggle Attendance
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
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowForm(false)}>
          <div className="bg-surface-raised w-full max-w-lg sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">Register Staff</h3>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">Add domestic help or society staff</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-text-tertiary" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Full Name</label>
                  <input 
                    className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="Enter staff name" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Phone Number</label>
                  <input 
                    className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="+91 00000 00000" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                    <select 
                      className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm appearance-none"
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Monthly Pay (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm"
                      placeholder="e.g. 2500"
                      value={form.agreedMonthlyPay}
                      onChange={(e) => setForm({ ...form, agreedMonthlyPay: e.target.value })}
                    />
                  </div>
                </div>

                {flats.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Link to Flats</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-surface rounded-2xl border border-border/50">
                      {flats.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFlatSelection(f.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            form.flatIds.includes(f.id)
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-surface-raised text-text-secondary border-border hover:border-primary/30"
                          }`}
                        >
                          {f.wing ? `${f.wing}-` : ""}{f.flatNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
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
