"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Calendar, Plus, MapPin, Users, Clock, CheckCircle, X, XCircle } from "lucide-react";

interface SEvent { id:string; title:string; description:string|null; startDate:string; endDate:string|null; venue:string|null; category:string; maxAttendees:number|null; status:string; createdAt:string; organizer:{name:string;role:string}; _count:{rsvps:number}; }

const catColors:Record<string,string> = { general:"bg-blue-50 text-blue-600", festival:"bg-amber-50 text-amber-600", meeting:"bg-violet-50 text-violet-600", sports:"bg-emerald-50 text-emerald-600", cultural:"bg-pink-50 text-pink-600", maintenance:"bg-gray-50 text-gray-600" };

export default function EventsPage() {
  const [events,setEvents]=useState<SEvent[]>([]); const [loading,setLoading]=useState(true); const [showNew,setShowNew]=useState(false); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({title:"",description:"",startDate:"",endDate:"",venue:"",category:"general",maxAttendees:""});

  const fetch_ = useCallback(()=>{ setLoading(true); fetch("/api/events?upcoming=true").then(r=>r.json()).then(d=>setEvents(Array.isArray(d)?d:[])).catch(()=>toast.error("Failed")).finally(()=>setLoading(false)); },[]);
  useEffect(()=>{fetch_()},[fetch_]);

  const create = async(e:React.FormEvent)=>{ e.preventDefault(); setSaving(true); try{ const r=await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); if(r.ok){toast.success("Event created!");setShowNew(false);setForm({title:"",description:"",startDate:"",endDate:"",venue:"",category:"general",maxAttendees:""});fetch_();}else{const d=await r.json();toast.error(d.error||"Failed")} }catch{toast.error("Error")} finally{setSaving(false)} };

  const rsvp = async(eventId:string, response:string)=>{ try{ const r=await fetch("/api/events",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventId,response})}); if(r.ok){toast.success(response==="attending"?"You're in! 🎉":"RSVP updated");fetch_();}else{const d=await r.json();toast.error(d.error||"Failed")} }catch{toast.error("Error")} };

  const fmt = (d:string) => new Date(d).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  const fmtTime = (d:string) => new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  const upcoming = events.filter(e=>new Date(e.startDate)>=new Date());
  const past = events.filter(e=>new Date(e.startDate)<new Date());

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Events & Calendar</h1>
          <p className="text-text-secondary font-medium mt-1">Community gatherings, meetings, and celebrations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNew(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-raised rounded-[2.5rem] h-48 border border-border animate-pulse card-float" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <Calendar className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary">No events scheduled</h3>
          <p className="text-text-secondary mt-2">Create your first society event to bring everyone together.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">Upcoming Events</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {upcoming.map((ev) => (
                  <div key={ev.id} className="bg-surface-raised rounded-[2.5rem] border border-border p-6 card-float group hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-6">
                    {/* Date Block */}
                    <div className="w-full sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent border border-border/50 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs font-black text-primary/70 uppercase tracking-widest">{new Date(ev.startDate).toLocaleDateString("en-IN", { month: "short" })}</span>
                      <span className="text-4xl font-black text-primary tracking-tighter leading-none my-1">{new Date(ev.startDate).getDate()}</span>
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{new Date(ev.startDate).toLocaleDateString("en-IN", { weekday: "long" })}</span>
                    </div>

                    {/* Details Block */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-2xl font-black text-text-primary tracking-tight leading-tight">{ev.title}</h3>
                          <span className={`inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-transparent ${catColors[ev.category] || "bg-surface text-text-secondary border-border"}`}>
                            {ev.category}
                          </span>
                        </div>
                      </div>

                      {ev.description && <p className="text-sm font-medium text-text-secondary mt-2 mb-4 line-clamp-2">{ev.description}</p>}

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-auto bg-surface p-4 rounded-2xl border border-border">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                          <Clock className="w-4 h-4 text-primary" strokeWidth={2.5} />
                          {fmtTime(ev.startDate)}{ev.endDate ? ` — ${fmtTime(ev.endDate)}` : ""}
                        </div>
                        {ev.venue && (
                          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <MapPin className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                            {ev.venue}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                          <Users className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                          {ev._count.rsvps}{ev.maxAttendees ? ` / ${ev.maxAttendees}` : ""} Attending
                        </div>
                      </div>

                      {/* RSVP Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button onClick={() => rsvp(ev.id, "attending")} className="h-10 px-6 rounded-xl bg-primary text-white text-xs font-black shadow-md shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-transform">
                          <CheckCircle className="w-4 h-4" strokeWidth={2.5} /> Attending
                        </button>
                        <button onClick={() => rsvp(ev.id, "maybe")} className="h-10 px-6 rounded-xl bg-surface border border-border text-text-secondary text-xs font-black hover:bg-surface-raised transition-colors">
                          Maybe
                        </button>
                        <button onClick={() => rsvp(ev.id, "declined")} className="h-10 px-6 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 text-xs font-black flex items-center gap-2 hover:bg-rose-100 transition-colors">
                          <XCircle className="w-4 h-4" strokeWidth={2.5} /> Can't Go
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-4 pt-4">
              <h2 className="text-lg font-black text-text-tertiary tracking-tight uppercase">Past Events</h2>
              <div className="bg-surface-raised rounded-[2.5rem] border border-border p-6 card-float space-y-2">
                {past.map((ev) => (
                  <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-2xl border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-text-tertiary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{ev.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mt-0.5">{fmt(ev.startDate)}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 px-4 py-1.5 bg-surface-raised rounded-lg border border-border text-xs font-bold text-text-secondary self-start sm:self-auto">
                      {ev._count.rsvps} Attended
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Premium Create Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowNew(false)} />
          <div className="relative w-full max-w-xl bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-8 border border-border shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Create Event</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Host a gathering for the society</p>
              </div>
              <button onClick={() => setShowNew(false)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={create} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Event Title *</label>
                <input className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all placeholder:font-medium" placeholder="E.g., Diwali Celebration 2024" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Description</label>
                <textarea className="w-full bg-surface rounded-2xl px-5 py-4 font-medium text-text-primary border border-transparent focus:border-primary outline-none transition-all min-h-[100px] resize-none" placeholder="Provide details about the event..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Start Time *</label>
                  <input type="datetime-local" className="w-full h-14 bg-surface rounded-2xl px-4 font-bold text-sm text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">End Time</label>
                  <input type="datetime-local" className="w-full h-14 bg-surface rounded-2xl px-4 font-bold text-sm text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Location / Venue</label>
                  <input className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" placeholder="Clubhouse, Garden..." value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                  <select className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="general">General</option>
                    <option value="festival">Festival</option>
                    <option value="meeting">Meeting</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Max Attendees (Optional)</label>
                <input type="number" className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" placeholder="Leave empty for unlimited" value={form.maxAttendees} onChange={e => setForm({...form, maxAttendees: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 h-14 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">Discard</button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  {saving ? <span className="spinner spinner-sm" /> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
                  {saving ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
