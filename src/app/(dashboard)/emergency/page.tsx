"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Phone, Shield, Flame, Heart, AlertTriangle, Siren, Plus, X, Clock } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  address: string | null;
}

interface Responder {
  name: string;
  phone: string;
  role: string;
}

const sosTypes = [
  { key: "fire", label: "Fire", icon: Flame, color: "bg-orange-600", ring: "ring-orange-300" },
  { key: "medical", label: "Medical", icon: Heart, color: "bg-red-600", ring: "ring-red-300" },
  { key: "security", label: "Security", icon: Shield, color: "bg-blue-600", ring: "ring-blue-300" },
  { key: "other", label: "Other", icon: AlertTriangle, color: "bg-gray-700", ring: "ring-gray-300" },
];

const helplines = [
  { name: "Police", number: "100", icon: "🚔" },
  { name: "Fire Brigade", number: "101", icon: "🚒" },
  { name: "Ambulance", number: "102", icon: "🚑" },
  { name: "Women Helpline", number: "1091", icon: "👩" },
  { name: "Disaster Mgmt", number: "108", icon: "⚠️" },
];

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [sosMessage, setSosMessage] = useState("");
  const [responders, setResponders] = useState<Responder[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", category: "security", address: "" });
  const [savingContact, setSavingContact] = useState(false);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    fetch("/api/emergency")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const triggerSOS = async (type: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: sosMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🚨 Emergency alert sent to all committee members!");
        setResponders(data.responders || []);
        setShowConfirm(null);
        setSosMessage("");
      } else {
        toast.error(data.error || "Failed to send alert");
      }
    } catch { toast.error("Network error"); }
    finally { setSending(false); }
  };

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        toast.success("Contact saved");
        setShowAddContact(false);
        setContactForm({ name: "", phone: "", category: "security", address: "" });
        fetchContacts();
      }
    } catch { toast.error("Failed"); }
    finally { setSavingContact(false); }
  };

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Emergency & SOS</h1>
          <p className="text-text-secondary font-medium mt-1">One-tap panic alerts to committee & guards</p>
        </div>
        <div className="w-16 h-16 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100 shrink-0">
          <Siren className="w-8 h-8" strokeWidth={2.5} />
        </div>
      </div>

      {/* SOS Buttons */}
      <div className="bg-surface-raised card-float rounded-[2.5rem] border border-border p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />
        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6 text-center z-10 relative">⚡ Tap to trigger society-wide emergency alert</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {sosTypes.map((sos) => (
            <button
              key={sos.key}
              onClick={() => setShowConfirm(sos.key)}
              className={`${sos.color} text-white p-6 sm:p-8 rounded-[2rem] flex flex-col items-center gap-4 shadow-xl hover:-translate-y-2 active:scale-95 transition-all ring-4 ring-transparent hover:${sos.ring} border border-white/10`}
            >
              <div className="bg-white/20 p-4 rounded-[1.5rem] backdrop-blur-md">
                <sos.icon className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
              </div>
              <span className="font-black text-sm sm:text-lg tracking-tight uppercase">{sos.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responders (after alert sent) */}
      {responders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <p className="text-sm font-bold text-emerald-800 mb-3">✅ Alert sent to {responders.length} responders:</p>
          <div className="space-y-2">
            {responders.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl p-3 border border-emerald-100">
                <div>
                  <p className="text-sm font-bold text-text-primary">{r.name}</p>
                  <p className="text-[10px] text-text-tertiary uppercase">{r.role}</p>
                </div>
                <a href={`tel:${r.phone}`} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* National Helplines */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">National Helplines</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {helplines.map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="card-float bg-surface-raised rounded-[2rem] border border-border p-5 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/20 transition-all">
              <span className="text-3xl sm:text-4xl filter drop-shadow-sm">{h.icon}</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{h.name}</p>
                <p className="text-xl font-black text-primary tracking-tight mt-1">{h.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Society Emergency Contacts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">Society Contacts</h2>
          </div>
          <button 
            onClick={() => setShowAddContact(true)} 
            className="h-10 px-5 bg-surface rounded-[1rem] font-black uppercase tracking-widest text-[10px] text-primary border border-primary/20 hover:bg-primary/5 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Add
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8"><div className="spinner !w-8 !h-8" /></div>
        ) : contacts.length === 0 ? (
          <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-dashed border-border card-float">
            <div className="w-16 h-16 bg-surface rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-border">
              <Phone className="w-8 h-8 text-text-tertiary opacity-50" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-text-secondary">No society contacts added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="card-float bg-surface-raised rounded-[2rem] border border-border p-5 flex items-center justify-between group hover:border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-surface flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                    <Shield className="w-6 h-6 text-text-tertiary group-hover:text-primary transition-colors" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-text-primary">{c.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mt-1">
                      {c.category} {c.address ? `· ${c.address}` : ""}
                    </p>
                  </div>
                </div>
                <a href={`tel:${c.phone}`} className="h-12 px-5 bg-primary/10 text-primary rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <Phone className="w-4 h-4" strokeWidth={2.5} /> Call
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOS Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay !bg-black/70 backdrop-blur-md z-[100]" onClick={() => setShowConfirm(null)}>
          <div className="bg-surface-raised w-full max-w-sm sm:rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Siren className="w-10 h-10 text-red-600 animate-pulse" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Trigger Alert?</h3>
              <p className="text-xs font-medium text-text-secondary mt-2">This will notify all committee members and guards immediately via SMS/App.</p>
            </div>
            
            <div className="space-y-2 mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Optional Details</label>
              <textarea 
                className="w-full min-h-[100px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-red-500 outline-none transition-all shadow-sm resize-none" 
                placeholder="Describe the situation briefly..." 
                value={sosMessage} 
                onChange={(e) => setSosMessage(e.target.value)} 
              />
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(null)} className="flex-1 h-14 bg-surface rounded-[1.5rem] border border-border text-text-primary hover:bg-surface-raised font-black uppercase tracking-widest text-[10px] transition-colors">
                Cancel
              </button>
              <button onClick={() => triggerSOS(showConfirm)} disabled={sending} className="flex-[2] h-14 bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/30 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Clock className="w-5 h-5 animate-spin" strokeWidth={2.5} /> : <Siren className="w-5 h-5" strokeWidth={2.5} />}
                {sending ? "Sending..." : "SEND ALERT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowAddContact(false)}>
          <div className="bg-surface-raised w-full max-w-sm sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-text-primary tracking-tight">Add Contact</h3>
              <button onClick={() => setShowAddContact(false)} className="p-2 rounded-full hover:bg-surface"><X className="w-6 h-6" strokeWidth={2.5} /></button>
            </div>
            <form onSubmit={saveContact} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Contact Name *</label>
                <input className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" placeholder="e.g. City Hospital" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Phone Number *</label>
                <input className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" placeholder="e.g. +91 00000 00000" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                <select className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm appearance-none" value={contactForm.category} onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}>
                  <option value="security">Security</option>
                  <option value="medical">Medical</option>
                  <option value="fire">Fire</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Address (Optional)</label>
                <input className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" placeholder="e.g. Near Main Gate" value={contactForm.address} onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })} />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={savingContact} className="w-full h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50">
                  {savingContact ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
