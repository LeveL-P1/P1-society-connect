"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, FileText, Calendar } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  meetingType: string;
  attendees: string | null;
  agenda: string;
  minutes: string;
  decisions: string | null;
  recordedBy: string;
  createdAt: string;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  agm: { label: "AGM", color: "bg-red-100 text-red-700" },
  sgm: { label: "SGM", color: "bg-orange-100 text-orange-700" },
  committee: { label: "Committee", color: "bg-blue-100 text-blue-700" },
  general: { label: "General", color: "bg-gray-100 text-gray-700" },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    meetingType: "general",
    attendees: "",
    agenda: "",
    minutes: "",
    decisions: "",
  });

  const fetchMeetings = useCallback(() => {
    setLoading(true);
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((d) => setMeetings(d.meetings || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Meeting minutes recorded");
        setShowForm(false);
        setForm({ title: "", date: new Date().toISOString().split("T")[0], meetingType: "general", attendees: "", agenda: "", minutes: "", decisions: "" });
        fetchMeetings();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
            <FileText className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Meeting Minutes</h1>
            <p className="text-text-secondary font-medium mt-1">{meetings.length} recorded meetings</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> Record Meeting
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner !w-10 !h-10" /></div>
      ) : meetings.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-dashed border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <FileText className="w-10 h-10 opacity-50" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary tracking-tight">No meetings recorded</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">Click "Record Meeting" to add minutes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => {
            const config = typeConfig[m.meetingType] || typeConfig.general;
            const isExpanded = expanded === m.id;
            return (
              <div 
                key={m.id} 
                className={`card-float bg-surface-raised border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? "rounded-[2.5rem] border-primary/30 shadow-xl" : "rounded-[2rem_1.5rem_2rem_1.5rem] border-border hover:border-primary/20"
                }`}
                onClick={() => setExpanded(isExpanded ? null : m.id)}
              >
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-text-primary truncate leading-tight group-hover:text-primary transition-colors">{m.title}</h3>
                      <span className={`px-3 py-1.5 rounded-[1rem] text-[9px] font-black uppercase tracking-widest shadow-sm ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-[1rem] border border-border">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> 
                        {new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">Recorded by <span className="text-primary">{m.recordedBy.split(" ")[0]}</span></span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    {isExpanded ? (
                      <span className="flex items-center gap-1 bg-surface px-4 py-2 rounded-[1.25rem] border border-border">Less <div className="border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current ml-1" /></span>
                    ) : (
                      <span className="flex items-center gap-1 bg-surface px-4 py-2 rounded-[1.25rem] border border-border group-hover:bg-primary/5 group-hover:text-primary transition-colors">More <div className="border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-current ml-1" /></span>
                    )}
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-border/50 space-y-6" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-surface rounded-[1.5rem] p-5 border border-border/50">
                        <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Agenda
                        </h4>
                        <p className="text-sm font-medium text-text-secondary whitespace-pre-wrap pl-3">{m.agenda}</p>
                      </div>
                      <div className="bg-surface rounded-[1.5rem] p-5 border border-border/50">
                        <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Minutes
                        </h4>
                        <p className="text-sm font-medium text-text-primary whitespace-pre-wrap pl-3">{m.minutes}</p>
                      </div>
                      {m.decisions && (
                        <div className="bg-primary/5 rounded-[1.5rem] p-5 border border-primary/10">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Decisions
                          </h4>
                          <p className="text-sm font-bold text-text-primary whitespace-pre-wrap pl-3">{m.decisions}</p>
                        </div>
                      )}
                      {m.attendees && (
                        <div className="bg-surface rounded-[1.5rem] p-5 border border-border/50">
                          <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Attendees
                          </h4>
                          <p className="text-sm font-bold text-text-secondary pl-3">{m.attendees}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Meeting Modal */}
      {showForm && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowForm(false)}>
          <div className="bg-surface-raised w-full max-w-2xl sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-text-primary tracking-tight mb-8">Record Meeting Minutes</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Title *</label>
                  <input className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm mt-2" placeholder="Meeting subject" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Type</label>
                  <select className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm appearance-none mt-2" value={form.meetingType} onChange={(e) => setForm({ ...form, meetingType: e.target.value })}>
                    <option value="general">General</option>
                    <option value="agm">AGM</option>
                    <option value="sgm">SGM</option>
                    <option value="committee">Committee</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Date *</label>
                  <input type="date" className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm mt-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Attendees</label>
                  <input className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm mt-2" placeholder="Names..." value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Agenda *</label>
                <textarea className="w-full min-h-[100px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none mt-2" placeholder="Meeting agenda points..." value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Minutes *</label>
                <textarea className="w-full min-h-[120px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none mt-2" placeholder="What was discussed..." value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Decisions Made</label>
                <textarea className="w-full min-h-[80px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none mt-2" placeholder="Key decisions taken..." value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 bg-surface rounded-[1.5rem] border border-border text-text-primary hover:bg-surface-raised font-black uppercase tracking-widest text-[10px] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Minutes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
