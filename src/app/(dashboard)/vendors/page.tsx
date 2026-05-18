"use client";

import { useEffect, useState } from "react";
import { 
  Wrench, Phone, FileSignature, Mail, 
  Plus, Settings, Calendar, IndianRupee, 
  CheckCircle, AlertTriangle, X, ShieldCheck,
  MoreVertical, ExternalLink, Globe, Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  hasAMC: boolean;
  amcAmount: number | null;
  amcStartDate: string | null;
  amcEndDate: string | null;
}

const categories = [
  { id: "lift", label: "Lift Maintenance" },
  { id: "security", label: "Security Agency" },
  { id: "cleaning", label: "Housekeeping" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "pest", label: "Pest Control" },
  { id: "fire", label: "Fire Safety" },
  { id: "other", label: "Other Services" },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "plumbing", phone: "", email: "",
    hasAMC: false, amcAmount: "", amcStartDate: "", amcEndDate: "",
  });

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors");
      const d = await res.json();
      if (d.vendors) setVendors(d.vendors);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Vendor name is required");

    const load = toast.loading("Saving vendor details...");
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Vendor registered", { id: load });
        setShowForm(false);
        setForm({ name: "", category: "plumbing", phone: "", email: "", hasAMC: false, amcAmount: "", amcStartDate: "", amcEndDate: "" });
        fetchVendors();
      } else {
        toast.error("Failed to add vendor", { id: load });
      }
    } catch {
      toast.error("Network error", { id: load });
    }
  };

  const amcStats = {
    total: vendors.length,
    activeAMC: vendors.filter(v => v.hasAMC && v.amcEndDate && new Date(v.amcEndDate) > new Date()).length,
    expiringSoon: vendors.filter(v => {
      if (!v.hasAMC || !v.amcEndDate) return false;
      const days = Math.ceil((new Date(v.amcEndDate).getTime() - Date.now()) / 86400000);
      return days > 0 && days <= 30;
    }).length,
  };

  return (
    <div className="page-container max-w-6xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Vendor Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage service providers and maintenance contracts
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary !rounded-2xl shadow-xl shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Vendors", val: amcStats.total, color: "text-slate-600", bg: "bg-slate-50", icon: Wrench, border: "border-slate-100" },
          { label: "Active AMCs", val: amcStats.activeAMC, color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck, border: "border-emerald-100" },
          { label: "Renewals Due", val: amcStats.expiringSoon, color: "text-amber-600", bg: "bg-amber-50", icon: Clock, border: "border-amber-100" },
        ].map((s) => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 p-5 rounded-[2rem] border ${s.border} dark:border-slate-700 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} dark:bg-slate-900/50 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 mx-auto text-slate-300">
            <Wrench className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No vendors yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            Add service providers to track their contacts and upcoming maintenance renewals.
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary !rounded-xl">Register First Vendor</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {vendors.map((v) => {
            const isAmcActive = v.hasAMC && v.amcEndDate && new Date(v.amcEndDate) > new Date();
            const daysToExpiry = v.hasAMC && v.amcEndDate 
              ? Math.ceil((new Date(v.amcEndDate).getTime() - Date.now()) / 86400000)
              : null;
            const category = categories.find(c => c.id === v.category)?.label || v.category;
              
            return (
              <div key={v.id} className="card p-0 overflow-hidden group hover:border-primary/30 transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">{v.name}</h3>
                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter mt-0.5">{category}</p>
                      </div>
                    </div>
                    {v.hasAMC && (
                      <div className={`p-2 rounded-xl border ${isAmcActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                        <FileSignature className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {v.phone && (
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        {v.phone}
                      </div>
                    )}
                    {v.email && (
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{v.email}</span>
                      </div>
                    )}
                  </div>
                  
                  {v.hasAMC ? (
                    <div className={`rounded-2xl p-4 border transition-colors ${
                      !isAmcActive ? "bg-rose-50 border-rose-100" : 
                      daysToExpiry && daysToExpiry < 30 ? "bg-amber-50 border-amber-100" : 
                      "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AMC Status</p>
                        {isAmcActive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(v.amcAmount || 0)} <span className="text-[10px] font-medium opacity-60">/ yr</span></p>
                          {v.amcEndDate && (
                            <p className={`text-[10px] font-bold mt-1 flex items-center gap-1.5 ${
                              !isAmcActive ? "text-rose-600" : daysToExpiry && daysToExpiry < 30 ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              <Calendar className="w-3 h-3" />
                              Exp: {new Date(v.amcEndDate).toLocaleDateString("en-IN")}
                              {daysToExpiry && daysToExpiry > 0 && daysToExpiry <= 30 && ` (${daysToExpiry}d)`}
                            </p>
                          )}
                        </div>
                        <button className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active AMC</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay z-50" onClick={() => setShowForm(false)}>
          <div className="modal-content !max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Register Vendor</h2>
                  <p className="text-xs text-slate-500 font-bold">Add a new service provider or AMC</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Company Name</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="Vendor legal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                  <select className="select !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Phone</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="+91" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" type="email" placeholder="vendor@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer group mb-6">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary transition-all"
                    checked={form.hasAMC} 
                    onChange={(e) => setForm({ ...form, hasAMC: e.target.checked })} 
                  />
                  <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Enable AMC Tracking</span>
                </label>
                
                {form.hasAMC && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Cost (₹)</label>
                      <input type="number" className="input !bg-white dark:!bg-slate-800 font-bold" placeholder="0.00" value={form.amcAmount} onChange={(e) => setForm({ ...form, amcAmount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                      <input type="date" className="input !bg-white dark:!bg-slate-800 font-bold" value={form.amcStartDate} onChange={(e) => setForm({ ...form, amcStartDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                      <input type="date" className="input !bg-white dark:!bg-slate-800 font-bold" value={form.amcEndDate} onChange={(e) => setForm({ ...form, amcEndDate: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn btn-secondary h-14 !rounded-2xl">Discard</button>
                <button type="submit" className="flex-[2] btn btn-primary h-14 !rounded-2xl shadow-xl shadow-primary/20">Save Vendor Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
