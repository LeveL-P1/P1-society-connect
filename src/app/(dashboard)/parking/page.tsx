"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Car, Trash2, Share2, User, Home, ShieldAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

interface ParkingSlot {
  id: string;
  slotNumber: string;
  slotType: string;
  level?: string | null;
  wing: string | null;
  isAssigned: boolean;
  vehicleNo: string | null;
  flat?: { flatNumber: string; ownerName: string } | null;
  currentAssignment?: {
    unitOccupancy?: { person?: { name: string }, unit?: { flatNumber: string } };
    vehicle?: { registrationNumber: string } | null;
  } | null;
}

interface AssignableOccupancy {
  occupancyId: string;
  flatNumber: string;
  wing: string | null;
  name: string;
  phone: string | null;
  relationshipType: string;
  ownerName: string | null;
  tenantName: string | null;
  occupancyStatus: string;
  label: string;
}

const typeIcons: Record<string, string> = {
  car: "🚗",
  CAR: "🚗",
  bike: "🏍️",
  BIKE: "🏍️",
  ev: "⚡",
  EV: "⚡",
  VISITOR: "🅿️",
  STAFF: "🛡️",
};

export default function ParkingPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [assignableOccupancies, setAssignableOccupancies] = useState<AssignableOccupancy[]>([]);
  const [nextSlotNumber, setNextSlotNumber] = useState("P-001");
  const [stats, setStats] = useState({ total: 0, assigned: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState<ParkingSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slotNumber: "", slotType: "CAR", wing: "", level: "", occupancyId: "", vehicleNo: "" });
  const [assignForm, setAssignForm] = useState({ occupancyId: "", vehicleNo: "" });
  const { user } = useUser();

  const isAdmin = user?.role === "chairman" || user?.role === "secretary" || user?.role === "treasurer";
  const requiresResidentAssignment = ["CAR", "BIKE", "EV"].includes(form.slotType);
  const selectedFormOccupancy = assignableOccupancies.find((item) => item.occupancyId === form.occupancyId);
  const selectedAssignOccupancy = assignableOccupancies.find((item) => item.occupancyId === assignForm.occupancyId);

  const fetchSlots = useCallback(() => {
    setLoading(true);
    fetch("/api/parking")
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || []);
        setAssignableOccupancies(d.assignableOccupancies || []);
        setNextSlotNumber(d.nextSlotNumber || "P-001");
        setStats(d.stats || { total: 0, assigned: 0, available: 0 });
      })
      .catch(() => toast.error("Failed to load parking data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresResidentAssignment && !form.occupancyId) {
      toast.error("Select an active resident/tenant for this resident parking slot");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/parking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slotNumber: form.slotNumber || nextSlotNumber }),
      });
      if (res.ok) {
        toast.success("Slot created successfully");
        setShowForm(false);
        setForm({ slotNumber: "", slotType: "CAR", wing: "", level: "", occupancyId: "", vehicleNo: "" });
        fetchSlots();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create slot");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!showAssign) return;
    try {
      const res = await fetch(`/api/parking/${showAssign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assignForm, isAssigned: true }),
      });
      if (res.ok) {
        toast.success("Parking slot assigned");
        fetchSlots();
      }
    } catch { toast.error("Failed to assign slot"); }
    setShowAssign(null);
  };

  const handleUnassign = async (id: string) => {
    if (!confirm("Are you sure you want to free this slot?")) return;
    try {
      await fetch(`/api/parking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAssigned: false }),
      });
      toast.success("Slot is now available");
      fetchSlots();
    } catch { toast.error("Failed to unassign slot"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this physical parking slot from records?")) return;
    await fetch(`/api/parking/${id}`, { method: "DELETE" });
    toast.success("Slot deleted");
    fetchSlots();
  };

  // Filter for members
  const mySlots = slots.filter(s => s.flat?.flatNumber === user?.flatNumber || s.currentAssignment?.unitOccupancy?.unit?.flatNumber === user?.flatNumber);

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header - Synchronized Clean Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
            <Car className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight leading-none sm:leading-normal">Parking Registry</h1>
            <p className="text-sm font-medium text-text-secondary mt-1">
              {isAdmin ? "Oversee society allocations" : "Manage your parking space"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
          <button onClick={() => router.push("/parking/marketplace")} className="h-14 px-6 bg-surface hover:bg-surface-raised border border-border text-text-primary rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-sm transition-colors flex items-center shrink-0">
            <Share2 className="w-4 h-4 mr-2" strokeWidth={2.5} /> <span>Exchange</span>
          </button>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0">
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> <span>Add New Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: "Total", val: stats.total, color: "text-primary", bg: "bg-primary/5", icon: Home },
          { label: "Occupied", val: stats.assigned, color: "text-indigo-600", bg: "bg-indigo-50", icon: User },
          { label: "Available", val: stats.available, color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldAlert },
        ].map((s) => (
          <div key={s.label} className="card-float bg-surface-raised p-5 sm:p-6 rounded-[2rem] border border-border/50 group transition-all">
            <div className="flex items-center justify-between">
               <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[1.25rem] ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:scale-110`}>
                  <s.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
               </div>
               <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.val}</p>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-text-tertiary mt-5 tracking-widest uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Member's Personal Section */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-surface-raised p-6 sm:p-8 rounded-[2rem] border border-indigo-100/50 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">My Allocations</h2>
           </div>
           
           {mySlots.length === 0 ? (
             <div className="text-center py-10 sm:py-16 bg-surface/50 rounded-[1.5rem] border-2 border-dashed border-border/60">
                <p className="text-sm font-bold text-text-secondary">No assigned parking slots at the moment.</p>
                <p className="text-xs text-text-tertiary mt-1">Visit management to register your vehicle.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               {mySlots.map(slot => (
                 <div key={slot.id} className="card-float bg-surface-raised rounded-[1.5rem] border border-primary/20 overflow-hidden transition-transform group">
                    <div className="bg-gradient-to-r from-primary to-primary-light text-white p-4 flex justify-between items-center shadow-inner">
                       <span className="font-bold tracking-widest uppercase text-[10px] opacity-90">{slot.slotType} slot</span>
                       <span className="text-xl font-black">{slot.slotNumber}</span>
                    </div>
                    <div className="p-5 sm:p-6">
                       <div className="flex justify-between items-center mb-5">
                          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">{typeIcons[slot.slotType] || "🅿️"}</span>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Vehicle</p>
                             <p className="text-sm sm:text-base font-black text-text-primary uppercase bg-surface px-3 py-1 rounded-lg border border-border">{slot.vehicleNo || slot.currentAssignment?.vehicle?.registrationNumber || "N/A"}</p>
                          </div>
                       </div>
                       <button onClick={() => router.push("/parking/marketplace")} className="w-full btn btn-secondary !rounded-[1rem] py-3 font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all">
                          <Share2 className="w-4 h-4" strokeWidth={2.5} /> Share My Space
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      {/* Main Grid View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
             {isAdmin ? "Global Inventory" : "Occupancy Map"}
          </h3>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 text-[9px] font-bold text-text-tertiary uppercase bg-white border border-border/50 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Free
             </div>
             <div className="flex items-center gap-2 text-[9px] font-bold text-text-tertiary uppercase bg-white border border-border/50 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Full
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="spinner !w-10 !h-10" />
            <p className="text-[10px] font-black text-text-secondary tracking-widest uppercase">Grid syncing...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20 px-10 bg-surface/30 rounded-[2rem] border-2 border-dashed border-border/60">
            <div className="w-16 h-16 bg-surface rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
              <Car className="w-8 h-8 text-text-tertiary opacity-50" strokeWidth={2.5} />
            </div>
            <p className="text-text-primary font-bold text-lg tracking-tight">No slots recorded yet.</p>
            <p className="text-sm font-medium text-text-secondary mt-1">Start by adding a new parking slot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {slots.map((slot) => {
              const isMine = slot.flat?.flatNumber === user?.flatNumber;
              return (
                <div
                  key={slot.id}
                  className={`bg-surface-raised rounded-2xl border p-4 sm:p-5 transition-all duration-300 relative group overflow-hidden ${
                    slot.isAssigned 
                      ? isMine 
                        ? "border-primary bg-primary/5 card-float scale-105 z-10" 
                        : "border-border/50 opacity-80" 
                      : "border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 card-float"
                  }`}
                >
                  <div className="absolute top-2 right-2 opacity-40 group-hover:opacity-100 transition-opacity">
                     <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform inline-block">{typeIcons[slot.slotType] || "🅿️"}</span>
                  </div>
                  
                  <p className="text-lg sm:text-xl font-black text-text-primary leading-none uppercase">{slot.slotNumber}</p>
                  {slot.wing && <p className="text-[9px] font-black text-text-tertiary uppercase mt-1.5 tracking-widest">{slot.wing} Wing</p>}
                  
                  {slot.isAssigned ? (
                    <div className="mt-5 pt-4 border-t border-border/40">
                      <p className="text-xs font-bold text-text-primary leading-tight">
                        Flat {slot.flat?.flatNumber || slot.currentAssignment?.unitOccupancy?.unit?.flatNumber || "???"}
                      </p>
                      {slot.currentAssignment?.unitOccupancy?.person?.name && (
                        <p className="text-[10px] font-medium text-text-secondary mt-1 truncate">{slot.currentAssignment.unitOccupancy.person.name}</p>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleUnassign(slot.id)} className="mt-3 w-full py-1.5 text-[10px] font-black uppercase tracking-widest text-danger hover:bg-danger/5 rounded-lg transition-colors">
                          Retract
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 pt-4 border-t border-emerald-100">
                      <p className="text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-3">Available</p>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => { setShowAssign(slot); setAssignForm({ occupancyId: "", vehicleNo: "" }); }} className="flex-1 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20">Assign</button>
                          <button onClick={() => handleDelete(slot.id)} className="p-1.5 text-danger hover:bg-danger/10 rounded-xl border border-transparent hover:border-danger/20 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={2.5} /></button>
                        </div>
                      )}
                    </div>
                  )}
                  {isMine && (
                    <div className="absolute top-0 left-0 bg-primary text-white text-[9px] px-2.5 py-1 rounded-br-xl font-black shadow-md uppercase tracking-widest">My Box</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Slot Modal - Mobile Optimized */}
      {showForm && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowForm(false)}>
          <div className="bg-surface-raised w-full max-w-lg sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                     <Plus className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-text-primary tracking-tight">Expand Registry</h3>
                     <p className="text-xs font-medium text-text-secondary mt-0.5">Define physical parking units</p>
                  </div>
               </div>
               <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-surface text-text-tertiary transition-colors"><X className="w-6 h-6" strokeWidth={2.5} /></button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Slot Name *</label>
                 <input className="input !rounded-xl !bg-surface font-bold text-sm px-4 py-3.5" placeholder={nextSlotNumber} value={form.slotNumber || nextSlotNumber} onChange={(e) => setForm({ ...form, slotNumber: e.target.value.toUpperCase() })} required />
                 <p className="text-[10px] text-text-secondary ml-1">Suggested automatically from existing active slots. You can still edit it.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Type</label>
                  <select className="select !rounded-xl !bg-surface font-bold py-3.5 px-4" value={form.slotType} onChange={(e) => setForm({ ...form, slotType: e.target.value })}>
                    <option value="CAR">4-Wheeler</option>
                    <option value="BIKE">2-Wheeler</option>
                    <option value="EV">EV Point</option>
                    <option value="VISITOR">Visitor</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Location / Wing</label>
                   <input className="input !rounded-xl !bg-surface font-bold text-sm px-4 py-3.5" placeholder="A, LG-1..." value={form.wing} onChange={(e) => setForm({ ...form, wing: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Level / Zone</label>
                   <input className="input !rounded-xl !bg-surface font-bold text-sm px-4 py-3.5" placeholder="Basement 1, Podium, Open..." value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface/40 p-4 space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">
                    Assign To Active Resident {requiresResidentAssignment ? "*" : "(optional)"}
                  </label>
                  <select
                    className="select !rounded-xl !bg-white font-bold text-sm px-4 py-3.5 mt-2"
                    value={form.occupancyId}
                    onChange={(e) => setForm({ ...form, occupancyId: e.target.value })}
                    required={requiresResidentAssignment}
                  >
                    <option value="">{requiresResidentAssignment ? "Choose active linked flat" : "Keep unassigned"}</option>
                    {assignableOccupancies.map((item) => (
                      <option key={item.occupancyId} value={item.occupancyId}>{item.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-text-secondary mt-2">
                    Only active owner/co-owner/tenant occupancies are shown here. Vacant or unlinked flats cannot receive resident parking.
                  </p>
                </div>

                {selectedFormOccupancy && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border bg-white p-3">
                    <div>
                      <p className="text-[9px] font-bold text-text-tertiary uppercase">Flat</p>
                      <p className="text-xs font-black text-text-primary">{selectedFormOccupancy.flatNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-text-tertiary uppercase">Occupant</p>
                      <p className="text-xs font-black text-text-primary">{selectedFormOccupancy.name}</p>
                      <p className="text-[10px] text-text-secondary">{selectedFormOccupancy.relationshipType.replaceAll("_", " ")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-text-tertiary uppercase">Owner</p>
                      <p className="text-xs font-black text-text-primary">{selectedFormOccupancy.ownerName || "Not linked"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Vehicle Number</label>
                  <input
                    className="input !rounded-xl !bg-white font-bold text-sm px-4 py-3.5 uppercase tracking-wide font-mono mt-2"
                    placeholder="MH-XX-XX-0000"
                    value={form.vehicleNo}
                    onChange={(e) => setForm({ ...form, vehicleNo: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn btn-secondary !rounded-xl py-4 font-bold text-sm">Cancel</button>
                <button type="submit" disabled={saving || (requiresResidentAssignment && !form.occupancyId)} className="flex-[2] btn btn-primary !rounded-xl py-4 font-bold text-sm shadow-xl shadow-primary/20">
                   {saving ? "Creating..." : "Confirm Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal - Mobile Optimized */}
      {showAssign && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowAssign(null)}>
          <div className="bg-surface-raised w-full max-w-lg sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in slide-in-from-bottom-6 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <User className="w-6 h-6" strokeWidth={2.5} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">Assign Slot {showAssign.slotNumber}</h3>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">Link a member and their vehicle</p>
                 </div>
               </div>
               <button onClick={() => setShowAssign(null)} className="p-2 rounded-full hover:bg-surface text-text-tertiary transition-colors"><X className="w-6 h-6" strokeWidth={2.5} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Active Resident / Occupancy *</label>
                 <select className="select !rounded-xl !bg-surface font-bold text-sm px-4 py-3.5" value={assignForm.occupancyId} onChange={(e) => setAssignForm({ ...assignForm, occupancyId: e.target.value })}>
                   <option value="">Choose active flat owner / tenant</option>
                   {assignableOccupancies.map((item) => (
                     <option key={item.occupancyId} value={item.occupancyId}>{item.label}</option>
                   ))}
                 </select>
                 {assignableOccupancies.length === 0 && (
                   <p className="text-xs text-danger-text mt-2">Create/link residents first. Parking can only be assigned to active occupancies.</p>
                 )}
              </div>
              {selectedAssignOccupancy && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border bg-surface/50 p-3">
                  <div>
                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Flat</p>
                    <p className="text-xs font-black text-text-primary">{selectedAssignOccupancy.flatNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Occupant</p>
                    <p className="text-xs font-black text-text-primary">{selectedAssignOccupancy.name}</p>
                    <p className="text-[10px] text-text-secondary">{selectedAssignOccupancy.relationshipType.replaceAll("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-text-tertiary uppercase">Owner</p>
                    <p className="text-xs font-black text-text-primary">{selectedAssignOccupancy.ownerName || "Not linked"}</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Vehicle Details</label>
                 <input className="input !rounded-xl !bg-surface font-bold text-sm px-4 py-3.5 uppercase tracking-wide font-mono" placeholder="MH-XX-XX-0000" value={assignForm.vehicleNo} onChange={(e) => setAssignForm({ ...assignForm, vehicleNo: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={() => setShowAssign(null)} className="flex-1 btn btn-secondary !rounded-xl py-4 font-bold text-sm">Back</button>
                <button onClick={handleAssign} disabled={!assignForm.occupancyId} className="flex-[2] btn btn-primary !rounded-xl py-4 font-bold text-sm shadow-xl shadow-primary/20">Finalize Link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
