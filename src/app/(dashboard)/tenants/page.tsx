"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { 
  Plus, UserPlus, Search, Phone, Calendar, 
  Home, CheckCircle, Clock, AlertTriangle, 
  X, KeyRound, Copy, Pencil, LogOut, 
  User, ShieldCheck, Mail, IndianRupee, Info
} from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import StatusBadge from "@/components/ui/StatusBadge";

interface TenantEntry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  leaseStart: string;
  leaseEnd: string | null;
  monthlyRent: number | null;
  status: string;
  hasLogin?: boolean;
  billingResponsibility?: string;
  flat: {
    flatNumber: string;
    wing: string | null;
    ownerName: string;
    ownerPhone?: string | null;
    ownerEmail?: string | null;
    ownerLinked?: boolean;
  };
}

interface Flat {
  id: string;
  flatNumber: string;
  wing: string | null;
  ownerName: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string; border: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending", border: "border-amber-100" },
  active: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Active", border: "border-emerald-100" },
  expired: { bg: "bg-rose-50", text: "text-rose-600", label: "Expired", border: "border-rose-100" },
  terminated: { bg: "bg-slate-50", text: "text-slate-600", label: "Archived", border: "border-slate-100" },
};

const getStatus = (status: string) => status.toLowerCase();

const formatFlatLabel = (flat?: { flatNumber?: string | null; wing?: string | null }) => {
  if (!flat?.flatNumber) return "-";
  const wing = flat.wing?.trim();
  if (!wing) return flat.flatNumber;
  return flat.flatNumber.toUpperCase().startsWith(`${wing.toUpperCase()}-`)
    ? flat.flatNumber
    : `${wing}-${flat.flatNumber}`;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantEntry[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingLoginFor, setCreatingLoginFor] = useState<string | null>(null);
  const [updatingPayerFor, setUpdatingPayerFor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string; note?: string } | null>(null);

  const [form, setForm] = useState({
    flatId: "", name: "", phone: "", email: "", idProofType: "aadhaar",
    leaseStart: "", leaseEnd: "", monthlyRent: "", password: "", billingResponsibility: "OWNER",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRent: "",
    billingResponsibility: "OWNER",
  });

  const fetchTenants = useCallback(() => {
    setLoading(true);
    fetch("/api/tenants")
      .then((r) => r.json())
      .then((d) => setTenants(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load tenants"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTenants();
    fetch("/api/members?flatsOnly=true")
      .then((r) => r.json())
      .then((d) => {
        const rawFlats = Array.isArray(d) ? d : Array.isArray(d.flats) ? d.flats : Array.isArray(d.members) ? d.members : [];
        setFlats(rawFlats);
      })
      .catch(() => {});
  }, [fetchTenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.loginCredentials) {
          setLastCredentials(data.loginCredentials);
          toast.success("Tenant registered successfully");
        } else {
          toast.success("Tenant record created");
        }
        setShowForm(false);
        setForm({ flatId: "", name: "", phone: "", email: "", idProofType: "aadhaar", leaseStart: "", leaseEnd: "", monthlyRent: "", password: "", billingResponsibility: "OWNER" });
        fetchTenants();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to register");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const createTenantLogin = async (tenant: TenantEntry) => {
    const email = window.prompt("Enter tenant login email", tenant.email || "");
    if (!email) return;
    setCreatingLoginFor(tenant.id);
    try {
      const res = await fetch("/api/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create login");
        return;
      }
      setLastCredentials(data.loginCredentials);
      toast.success("Login created");
      fetchTenants();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreatingLoginFor(null);
    }
  };

  const copyCredentials = () => {
    if (!lastCredentials) return;
    navigator.clipboard.writeText(`Email: ${lastCredentials.email}\nPassword: ${lastCredentials.password}`);
    toast.success("Copied to clipboard!");
  };

  const updateMaintenancePayer = async (tenant: TenantEntry, billingResponsibility: string) => {
    setUpdatingPayerFor(tenant.id);
    try {
      const res = await fetch("/api/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_billing_responsibility",
          tenantId: tenant.id,
          billingResponsibility,
        }),
      });
      if (res.ok) {
        toast.success("Billing preference updated");
        fetchTenants();
      }
    } catch {
      toast.error("Failed to update preference");
    } finally {
      setUpdatingPayerFor(null);
    }
  };

  const openEditTenant = (tenant: TenantEntry) => {
    setEditingTenant(tenant);
    setEditForm({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email || "",
      leaseStart: new Date(tenant.leaseStart).toISOString().split("T")[0],
      leaseEnd: tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split("T")[0] : "",
      monthlyRent: tenant.monthlyRent?.toString() || "",
      billingResponsibility: tenant.billingResponsibility || "OWNER",
    });
  };

  const saveTenantEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_tenant", tenantId: editingTenant.id, ...editForm }),
      });
      if (res.ok) {
        toast.success("Tenant updated");
        setEditingTenant(null);
        fetchTenants();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const terminateTenant = async (tenant: TenantEntry) => {
    if (!confirm(`Move out ${tenant.name}? This will mark the flat as self-occupied by owner.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "terminate_tenant", tenantId: tenant.id }),
      });
      if (res.ok) {
        toast.success("Tenant moved out");
        fetchTenants();
      }
    } catch {
      toast.error("Failed to move out tenant");
    } finally {
      setSaving(false);
    }
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search) ||
    (t.flat?.flatNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => getStatus(t.status) === "active").length,
    expiring: tenants.filter(t => {
      if (!t.leaseEnd || getStatus(t.status) !== "active") return false;
      const days = (new Date(t.leaseEnd).getTime() - Date.now()) / 86400000;
      return days > 0 && days <= 30;
    }).length,
    expired: tenants.filter(t => getStatus(t.status) === "expired").length
  };

  return (
    <div className="page-container max-w-6xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tenant Lifecycle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track occupancy, lease periods and billing preferences
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary !rounded-2xl shadow-xl shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" />
          Register Tenant
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "On Roll", val: stats.total, color: "text-slate-600", bg: "bg-slate-50", icon: User, border: "border-slate-100" },
          { label: "Active", val: stats.active, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, border: "border-emerald-100" },
          { label: "Expiring", val: stats.expiring, color: "text-amber-600", bg: "bg-amber-50", icon: Clock, border: "border-amber-100" },
          { label: "Expired", val: stats.expired, color: "text-rose-600", bg: "bg-rose-50", icon: AlertTriangle, border: "border-rose-100" },
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

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          className="input !pl-11 !rounded-2xl !bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 font-bold text-sm h-12" 
          placeholder="Search by tenant name, phone or flat..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {lastCredentials && (
        <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900 dark:text-emerald-400">Tenant Login Ready</p>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">{lastCredentials.email} · Password: {lastCredentials.password}</p>
            </div>
          </div>
          <button onClick={copyCredentials} className="btn btn-secondary !rounded-xl !py-2 !text-xs font-black">
            <Copy className="w-4 h-4 mr-2" /> Copy Credentials
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 mx-auto text-slate-300">
            <UserPlus className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No tenants found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All flats are currently marked as self-occupied. Use 'Register Tenant' to record a new occupancy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {filtered.map((t) => {
            const status = getStatus(t.status);
            const style = statusStyles[status] || statusStyles.pending;
            const daysLeft = t.leaseEnd ? Math.ceil((new Date(t.leaseEnd).getTime() - Date.now()) / 86400000) : null;
            
            return (
              <div key={t.id} className="card p-0 overflow-hidden group hover:border-primary/30 transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${style.bg} dark:bg-slate-900/50 flex items-center justify-center ${style.text} border ${style.border} dark:border-slate-800 group-hover:scale-110 transition-transform`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{t.name}</h4>
                        <p className="text-xs font-bold text-primary mt-0.5">Flat {formatFlatLabel(t.flat)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text} border ${style.border}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lease Duration</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(t.leaseStart).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} → {t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Open"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.phone}
                        </p>
                      </div>
                    </div>

                    {daysLeft !== null && daysLeft <= 30 && status === "active" && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${daysLeft <= 0 ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p className="text-[10px] font-black uppercase">
                          {daysLeft <= 0 ? "Lease Expired" : `Expires in ${daysLeft} Days`}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Preference</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.billingResponsibility === "TENANT" ? "Tenant pays society maintenance" : "Owner pays society maintenance"}
                          </p>
                        </div>
                        <button 
                          onClick={() => updateMaintenancePayer(t, t.billingResponsibility === "TENANT" ? "OWNER" : "TENANT")}
                          disabled={updatingPayerFor === t.id}
                          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-primary transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Link</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{t.flat.ownerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.flat.ownerLinked ? "active" : "inactive"} />
                          <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {!t.hasLogin && (
                        <button
                          onClick={() => createTenantLogin(t)}
                          disabled={creatingLoginFor === t.id}
                          className="flex-1 btn btn-secondary !py-2.5 !rounded-xl text-[10px] font-black"
                        >
                          <KeyRound className="w-3.5 h-3.5 mr-2" /> Invite
                        </button>
                      )}
                      <button onClick={() => openEditTenant(t)} className="flex-1 btn btn-secondary !py-2.5 !rounded-xl text-[10px] font-black">
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                      </button>
                      {status === "active" && (
                        <button onClick={() => terminateTenant(t)} disabled={saving} className="flex-1 btn btn-danger !py-2.5 !rounded-xl text-[10px] font-black">
                          <LogOut className="w-3.5 h-3.5 mr-2" /> Exit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Tenant Modal */}
      {showForm && (
        <div className="modal-overlay z-[100]" onClick={() => setShowForm(false)}>
          <div className="modal-content !max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">New Occupancy</h2>
                  <p className="text-xs text-slate-500 font-bold">Register a new tenant for a flat</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Flat</label>
                <select className="select !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.flatId} onChange={(e) => setForm({ ...form, flatId: e.target.value })} required>
                  <option value="">Choose available flat...</option>
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>{formatFlatLabel(f)} · {f.ownerName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="As per ID proof" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mobile Number</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="+91" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Lease Start</label>
                  <input type="date" className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.leaseStart} onChange={(e) => setForm({ ...form, leaseStart: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Lease End (Optional)</label>
                  <input type="date" className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.leaseEnd} onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Monthly Rent</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" className="input !pl-10 !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="0.00" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Billing Payer</label>
                  <select className="select !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.billingResponsibility} onChange={(e) => setForm({ ...form, billingResponsibility: e.target.value })}>
                    <option value="OWNER">Owner pays society</option>
                    <option value="TENANT">Tenant pays society</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email (For Portal Access)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" className="input !pl-10 !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="tenant@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn btn-secondary h-14 !rounded-2xl">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] btn btn-primary h-14 !rounded-2xl shadow-xl shadow-primary/20">
                  {saving ? "Registering..." : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTenant && (
        <div className="modal-overlay z-[100]" onClick={() => setEditingTenant(null)}>
          <div className="modal-content !max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Occupancy</h2>
                <p className="text-xs text-slate-500 font-bold">Flat {formatFlatLabel(editingTenant.flat)}</p>
              </div>
              <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={saveTenantEdit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                  <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lease Start</label>
                  <input type="date" className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={editForm.leaseStart} onChange={(e) => setEditForm({ ...editForm, leaseStart: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lease End</label>
                  <input type="date" className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={editForm.leaseEnd} onChange={(e) => setEditForm({ ...editForm, leaseEnd: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingTenant(null)} className="flex-1 btn btn-secondary h-12">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] btn btn-primary h-12">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
