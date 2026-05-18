"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { MessageSquare, Plus, Eye, MessageCircle, Pin, Search, X, Send, ArrowLeft, Clock } from "lucide-react";

interface Thread { id: string; title: string; content: string; category: string; isPinned: boolean; isLocked: boolean; views: number; lastActivityAt: string; createdAt: string; author: { name: string; role: string }; _count: { replies: number }; }
interface Reply { id: string; content: string; createdAt: string; author: { name: string; role: string }; }
interface ThreadDetail extends Thread { replies: Reply[]; }

const cats = [{ key: "all", label: "All" },{ key: "general", label: "General" },{ key: "maintenance", label: "Maintenance" },{ key: "security", label: "Security" },{ key: "events", label: "Events" },{ key: "buy-sell", label: "Buy/Sell" },{ key: "lost-found", label: "Lost & Found" }];
const catClr: Record<string,string> = { general:"bg-blue-50 text-blue-600", maintenance:"bg-amber-50 text-amber-600", security:"bg-red-50 text-red-600", events:"bg-violet-50 text-violet-600", "buy-sell":"bg-emerald-50 text-emerald-600", "lost-found":"bg-orange-50 text-orange-600" };

function timeAgo(d:string){ const m=Math.floor((Date.now()-new Date(d).getTime())/60000); if(m<1)return"just now"; if(m<60)return`${m}m`; const h=Math.floor(m/60); if(h<24)return`${h}h`; return`${Math.floor(h/24)}d`; }

export default function ForumPage() {
  const [threads,setThreads]=useState<Thread[]>([]); const [loading,setLoading]=useState(true); const [cat,setCat]=useState("all"); const [search,setSearch]=useState(""); const [showNew,setShowNew]=useState(false); const [saving,setSaving]=useState(false); const [form,setForm]=useState({title:"",content:"",category:"general"});
  const [sel,setSel]=useState<ThreadDetail|null>(null); const [loadT,setLoadT]=useState(false); const [reply,setReply]=useState(""); const [sendR,setSendR]=useState(false);

  const fetch_ = useCallback(()=>{ setLoading(true); fetch(`/api/forum?category=${cat}`).then(r=>r.json()).then(d=>setThreads(d.threads||[])).catch(()=>toast.error("Failed")).finally(()=>setLoading(false)); },[cat]);
  useEffect(()=>{fetch_();},[fetch_]);

  const openT = async(id:string)=>{ setLoadT(true); try{ const r=await fetch(`/api/forum/${id}`); const d=await r.json(); if(r.ok)setSel(d); }catch{toast.error("Failed")} finally{setLoadT(false)} };
  const createT = async(e:React.FormEvent)=>{ e.preventDefault(); setSaving(true); try{ const r=await fetch("/api/forum",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); if(r.ok){toast.success("Posted!");setShowNew(false);setForm({title:"",content:"",category:"general"});fetch_();}else{const d=await r.json();toast.error(d.error||"Failed")} }catch{toast.error("Error")} finally{setSaving(false)} };
  const postR = async()=>{ if(!sel||!reply.trim())return; setSendR(true); try{ const r=await fetch(`/api/forum/${sel.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:reply.trim()})}); if(r.ok){setReply("");openT(sel.id);toast.success("Replied")} }catch{toast.error("Failed")} finally{setSendR(false)} };

  const filtered = threads.filter(t=>!search||t.title.toLowerCase().includes(search.toLowerCase()));

  if(sel) return (
    <div className="page-container max-w-4xl mx-auto space-y-6 pb-20">
      <button onClick={() => setSel(null)} className="h-10 px-4 bg-surface rounded-[1rem] font-black uppercase tracking-widest text-[10px] text-text-secondary border border-border hover:bg-surface-raised transition-colors flex items-center shrink-0">
        <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2.5} /> Back to Discussions
      </button>

      <div className="card-float bg-surface-raised rounded-[2rem] border border-border p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0 shadow-sm">
            {sel.author.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">{sel.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-text-secondary">{sel.author.name}</span>
              <span className="text-[9px] font-black uppercase tracking-widest bg-surface text-text-tertiary px-2 py-1 rounded-md border border-border">{sel.author.role}</span>
              <span className="text-[10px] font-black text-text-tertiary flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(sel.createdAt)}</span>
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-[1rem] shadow-sm ${catClr[sel.category] || "bg-gray-100 text-gray-700"}`}>
            {sel.category}
          </span>
        </div>
        
        <p className="text-base font-medium text-text-primary whitespace-pre-wrap leading-relaxed p-6 bg-surface rounded-[1.5rem] border border-border/50">
          {sel.content}
        </p>

        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-border/50 text-xs font-bold text-text-tertiary uppercase tracking-widest">
          <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {sel.views} Views</span>
          <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {sel.replies.length} Replies</span>
        </div>
      </div>

      <div className="space-y-4">
        {sel.replies.map(r => (
          <div key={r.id} className="card-float bg-surface-raised rounded-[1.5rem] border border-border p-5 ml-4 sm:ml-12 relative before:content-[''] before:absolute before:-left-6 before:top-8 before:w-6 before:h-px before:bg-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                {r.author.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-text-primary">{r.author.name}</span>
              <span className="text-[9px] font-black uppercase tracking-widest bg-surface text-text-tertiary px-2 py-1 rounded-md border border-border">{r.author.role}</span>
              <span className="text-[10px] font-black text-text-tertiary ml-auto">{timeAgo(r.createdAt)}</span>
            </div>
            <p className="text-sm font-medium text-text-secondary whitespace-pre-wrap pl-11">{r.content}</p>
          </div>
        ))}
      </div>

      {!sel.isLocked && (
        <div className="bg-surface-raised rounded-[2rem] border border-border p-4 flex gap-4 items-end sticky bottom-6 shadow-2xl card-float">
          <textarea 
            className="flex-1 w-full bg-surface border border-border rounded-[1.5rem] px-5 py-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none min-h-[60px] max-h-32" 
            placeholder="Write a reply..." 
            value={reply} 
            onChange={e => setReply(e.target.value)} 
            rows={1} 
          />
          <button 
            onClick={postR} 
            disabled={sendR || !reply.trim()} 
            className="h-14 px-8 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50 flex items-center shrink-0"
          >
            <Send className="w-4 h-4 mr-2" strokeWidth={2.5} /> Reply
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Discussion Forum</h1>
          <p className="text-text-secondary font-medium mt-1">{threads.length} active community discussions</p>
        </div>
        <button 
          onClick={() => setShowNew(true)} 
          className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> New Discussion
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
          <input 
            className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-14 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
            placeholder="Search discussions..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {cats.map(c => (
            <button 
              key={c.key} 
              onClick={() => setCat(c.key)} 
              className={`h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
                cat === c.key 
                  ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                  : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Thread List */}
      {loading || loadT ? (
        <div className="flex items-center justify-center py-20"><div className="spinner !w-10 !h-10" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-dashed border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <MessageSquare className="w-10 h-10 opacity-50" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary tracking-tight">No discussions found</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">Try adjusting your filters or start a new topic.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <button 
              key={t.id} 
              onClick={() => openT(t.id)} 
              className="w-full card-float bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border border-border p-5 sm:p-6 text-left hover:border-primary/20 transition-all group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                {t.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {t.isPinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2.5} />}
                  <h4 className="text-lg font-black text-text-primary truncate group-hover:text-primary transition-colors">{t.title}</h4>
                </div>
                <p className="text-sm font-medium text-text-secondary line-clamp-1 mb-3">{t.content}</p>
                <div className="flex items-center flex-wrap gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{t.author.name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-[1rem] shadow-sm ${catClr[t.category] || "bg-gray-100 text-gray-700"}`}>{t.category}</span>
                  <span className="text-[10px] font-black text-text-tertiary flex items-center gap-1 uppercase tracking-widest"><Clock className="w-3 h-3" strokeWidth={2.5} /> {timeAgo(t.lastActivityAt)}</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 shrink-0 pt-4 sm:pt-0 border-t border-border sm:border-0 mt-4 sm:mt-0 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-surface px-3 py-1.5 rounded-[1rem] border border-border">
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> {t._count.replies} Replies
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-surface px-3 py-1.5 rounded-[1rem] border border-border">
                  <Eye className="w-3.5 h-3.5" strokeWidth={2.5} /> {t.views} Views
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Discussion Modal */}
      {showNew && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowNew(false)}>
          <div className="bg-surface-raised w-full max-w-2xl sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-text-primary tracking-tight">New Discussion</h3>
              <button onClick={() => setShowNew(false)} className="p-2 rounded-full hover:bg-surface text-text-tertiary"><X className="w-6 h-6" strokeWidth={2.5} /></button>
            </div>
            <form onSubmit={createT} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Title *</label>
                <input 
                  className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
                  placeholder="What is this discussion about?" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                <select 
                  className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm appearance-none" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  {cats.filter(c => c.key !== "all").map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Message *</label>
                <textarea 
                  className="w-full min-h-[160px] bg-surface border border-border rounded-[1.5rem] p-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm resize-none" 
                  placeholder="Write your message here..." 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 h-14 bg-surface rounded-[1.5rem] border border-border text-text-primary hover:bg-surface-raised font-black uppercase tracking-widest text-[10px] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50">
                  {saving ? "Posting..." : "Post Discussion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
