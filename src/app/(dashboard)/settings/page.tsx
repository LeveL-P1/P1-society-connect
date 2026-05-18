"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  Settings as SettingsIcon, Save, Shield, Building2, 
  Home, Copy, Plus, RefreshCw, UserCheck, Mail, 
  Phone, X, CreditCard, Landmark, ShieldCheck,
  User, CheckCircle2, AlertTriangle, KeyRound, ArrowRight
} from "lucide-react";

interface FlatLinkedUser {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string | null;
}

interface FlatSetupItem {
  id: string;
  flatNumber: string;
  wing: string | null;
  floor: number | null;
  ownerName: string | null;
  contact: string | null;
  isActive: boolean;
  hasAccount: boolean;
  tenantName?: string | null;
  users: FlatLinkedUser[];
}

interface GuardItem {
  id: string;
  name: string;
  phone: string;
  gateAssignment: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  isActive: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flatsLoading, setFlatsLoading] = useState(false);
  const [flatsSaving, setFlatsSaving] = useState(false);
  const [tab, setTab] = useState<"profile" | "flats" | "guards" | "roles">("profile");
  const [joinCode, setJoinCode] = useState("");
  const [flats, setFlats] = useState<FlatSetupItem[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<FlatSetupItem | null>(null);
  const [guards, setGuards] = useState<GuardItem[]>([]);
  const [guardsLoading, setGuardsLoading] = useState(false);
  const [guardSaving, setGuardSaving] = useState(false);
  
  const [flatSetup, setFlatSetup] = useState({
    wings: "A",
    floors: "1,2,3,4",
    flatsPerFloor: "4",
  });
  const [guardForm, setGuardForm] = useState({
    name: "",
    phone: "",
    pin: "",
    gateAssignment: "",
    shiftStart: "",
    shiftEnd: "",
  });
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    upiId: "",
    bankDetails: "",
    maintenanceAmt: "",
    dueDayOfMonth: "10",
    lateFee: "",
    legalAdviserName: "",
    legalAdviserPhone: "",
  });

  useEffect(() => {
    fetch("/api/maintenance/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.society) {
          setJoinCode(d.society.joinCode || "");
          setForm({
            name: d.society.name || "",
            address: d.society.address || "",
            city: d.society.city || "",
            pincode: d.society.pincode || "",
            upiId: d.society.upiId || "",
            bankDetails: d.society.bankDetails || "",
            maintenanceAmt: d.society.maintenanceAmt?.toString() || "",
            dueDayOfMonth: d.society.dueDayOfMonth?.toString() || "10",
            lateFee: d.society.lateFee?.toString() || "",
            legalAdviserName: d.society.legalAdviserName || "",
            legalAdviserPhone: d.society.legalAdviserPhone || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchFlats = () => {
    setFlatsLoading(true);
    fetch("/api/settings/flats")
      .then((r) => r.json())
      .then((d) => setFlats(d.flats || []))
      .catch(() => toast.error("Failed to load flats"))
      .finally(() => setFlatsLoading(false));
  };

  const fetchGuards = () => {
    setGuardsLoading(true);
    fetch("/api/guard")
      .then((r) => r.json())
      .then((d) => setGuards(d.guards || []))
      .catch(() => toast.error("Failed to load guards"))
      .finally(() => setGuardsLoading(false));
  };

  useEffect(() => {
    fetchFlats();
    fetchGuards();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/maintenance/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const copyJoinCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied to clipboard!");
  };

  const createFlats = async () => {
    setFlatsSaving(true);
    try {
      const res = await fetch("/api/settings/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatSetup),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Generated ${data.created} units`);
        fetchFlats();
      } else {
        toast.error(data.error || "Generation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setFlatsSaving(false);
    }
  };

  const createGuard = async () => {
    setGuardSaving(true);
    try {
      const res = await fetch("/api/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Security staff record created");
        setGuardForm({ name: "", phone: "", pin: "", gateAssignment: "", shiftStart: "", shiftEnd: "" });
        fetchGuards();
      } else {
        toast.error(data.error || "Failed to create staff record");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGuardSaving(false);
    }
  };

  const updateGuard = async (guardId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/guard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardId, isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Access granted" : "Access revoked");
        fetchGuards();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <div className="page-container flex flex-col items-center justify-center py-24 gap-4"><div className="spinner !w-8 !h-8" /><p className="text-xs font-black uppercase text-slate-400">Syncing Settings...</p></div>;
  }

  return (
    <div className="page-container max-w-4xl pb-24">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-200 dark:border-slate-800">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Society Console</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Core configuration and infrastructure setup</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="btn btn-primary !rounded-2xl shadow-xl shadow-primary/20"
        >
          {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Commit Changes</>}
        </button>
      </div>

      {/* Modern Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8 border-b border-slate-100 dark:border-slate-800">
        {[
          { id: "profile" as const, label: "Society Identity", icon: Building2 },
          { id: "flats" as const, label: "Inventory Setup", icon: Home },
          { id: "guards" as const, label: "Security Staff", icon: UserCheck },
          { id: "roles" as const, label: "Access Policy", icon: Shield },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${
              tab === t.id 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div>
          {tab === "profile" && (
            <div className="space-y-8">
              {joinCode && (
                <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 group">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                      Society Key
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Share this with residents to let them join your society portal.</p>
                  </div>
                  <button 
                    onClick={copyJoinCode} 
                    className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-primary/20 shadow-sm flex items-center gap-6 group-hover:shadow-xl transition-all"
                  >
                    <span className="text-3xl font-black font-mono tracking-[0.2em] text-primary">{joinCode}</span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Copy className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              )}

              <div className="card !p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Registration Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Official Name</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registered Address</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">City</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pincode</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Finance Hub</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Society UPI ID</label>
                      <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="society@upi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
                      <p className="text-[9px] font-bold text-slate-400 ml-1">Printed on receipts and used for My Bills QR payments.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Bank Settlement Details</label>
                      <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" placeholder="A/C No. & IFSC" value={form.bankDetails} onChange={(e) => setForm({ ...form, bankDetails: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "flats" && (
            <div className="space-y-8">
              <div className="card !p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Unit Inventory</h3>
                      <p className="text-xs font-bold text-slate-400">Generate the master list of all units</p>
                    </div>
                  </div>
                  <button onClick={fetchFlats} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${flatsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Wings</label>
                    <input className="input !bg-white dark:!bg-slate-800 font-bold" placeholder="A,B,C" value={flatSetup.wings} onChange={(e) => setFlatSetup({ ...flatSetup, wings: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Floors</label>
                    <input className="input !bg-white dark:!bg-slate-800 font-bold" placeholder="1,2,3" value={flatSetup.floors} onChange={(e) => setFlatSetup({ ...flatSetup, floors: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Units/Floor</label>
                    <input type="number" className="input !bg-white dark:!bg-slate-800 font-bold" value={flatSetup.flatsPerFloor} onChange={(e) => setFlatSetup({ ...flatSetup, flatsPerFloor: e.target.value })} />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {flatSetup.wings.split(',').slice(0, 2).map((w, i) => (
                      <span key={i} className="text-[10px] font-black text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">Preview {w.trim()}-101</span>
                    ))}
                  </div>
                  <button onClick={createFlats} disabled={flatsSaving} className="btn btn-primary !rounded-2xl shadow-lg shadow-primary/20">
                    {flatsSaving ? "Generating..." : "Generate Master List"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {flats.map((flat) => (
                  <button
                    key={flat.id}
                    onClick={() => flat.hasAccount && setSelectedFlat(flat)}
                    className={`p-4 rounded-[2rem] border text-left transition-all ${
                      flat.hasAccount 
                        ? "bg-emerald-50 border-emerald-100 hover:shadow-lg hover:-translate-y-1" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60"
                    }`}
                  >
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${flat.hasAccount ? "text-emerald-600" : "text-slate-400"}`}>
                      {flat.wing || "Unit"}
                    </p>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-3">{flat.flatNumber}</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${flat.hasAccount ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                      <span className="text-[9px] font-black uppercase text-slate-500">{flat.hasAccount ? "Occupied" : "Vacant"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "guards" && (
            <div className="space-y-8">
              <div className="card !p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">New Security Guard</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={guardForm.name} onChange={(e) => setGuardForm({ ...guardForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone (10 Digits)</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" maxLength={10} value={guardForm.phone} onChange={(e) => setGuardForm({ ...guardForm, phone: e.target.value.replace(/\D/g, "") })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shift Start</label>
                    <input type="time" className="input !bg-slate-50 dark:!bg-slate-900 font-bold" value={guardForm.shiftStart} onChange={(e) => setGuardForm({ ...guardForm, shiftStart: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">4-Digit Access PIN</label>
                    <input className="input !bg-slate-50 dark:!bg-slate-900 font-bold" maxLength={4} value={guardForm.pin} onChange={(e) => setGuardForm({ ...guardForm, pin: e.target.value.replace(/\D/g, "") })} />
                  </div>
                </div>

                <button onClick={createGuard} disabled={guardSaving} className="btn btn-primary h-14 w-full !rounded-2xl shadow-lg shadow-primary/20">
                  {guardSaving ? "Creating Account..." : "Register Security Staff"}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Active On-Duty Staff</h4>
                {guards.map((guard) => (
                  <div key={guard.id} className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all border border-slate-100 dark:border-slate-800">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{guard.name}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{guard.phone} · Gate: {guard.gateAssignment || "Not Set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${guard.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                        {guard.isActive ? "Approved" : "Hold"}
                      </div>
                      <button 
                        onClick={() => updateGuard(guard.id, !guard.isActive)} 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${guard.isActive ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                      >
                        {guard.isActive ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "roles" && (
            <div className="card !p-0 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Access Matrix</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Role-based permission architecture for the platform</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Application Module</th>
                      {["CHAIRMAN", "SECRETARY", "TREASURER", "MEMBER"].map(r => (
                        <th key={r} className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { module: "Dashboard & Core", c: true, s: true, t: true, m: true },
                      { module: "Flat Inventory", c: true, s: true, t: true, m: false },
                      { module: "Society Billing", c: true, s: true, t: true, m: true },
                      { module: "Expense Ledger", c: true, s: false, t: true, m: false },
                      { module: "Society Board", c: true, s: true, t: true, m: true },
                      { module: "Resident Helpdesk", c: true, s: true, t: true, m: true },
                      { module: "System Console", c: true, s: false, t: false, m: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">{row.module}</td>
                        {[row.c, row.s, row.t, row.m].map((has, j) => (
                          <td key={j} className="px-4 py-5 text-center">
                            <div className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center ${has ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-300 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
                              {has ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3 h-3 opacity-20" />}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* Flat Details Modal */}
      {selectedFlat && (
        <div className="modal-overlay z-[120]" onClick={() => setSelectedFlat(null)}>
          <div className="modal-content !max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedFlat.flatNumber}</h2>
                  <p className="text-xs font-bold text-slate-500">Linked Account Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <div className="space-y-4">
              {selectedFlat.users.map((res) => (
                <div key={res.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{res.name}</p>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5">{res.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4 opacity-50" /> {res.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 opacity-50" /> {res.phone || "No phone added"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
