"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Plus, Tag, X, Package } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  condition: string;
  status: string;
  contactPhone: string | null;
  flatNumber: string | null;
  createdAt: string;
  userId: string;
}

const CATEGORIES = [
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "appliances", label: "Appliances" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "vehicles", label: "Vehicles" },
  { value: "services", label: "Services" },
  { value: "general", label: "General" },
];

const CONDITIONS = [
  { value: "new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Needs Repair" },
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "general",
    condition: "good", contactPhone: "", flatNumber: "",
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace");
      const d = await res.json();
      if (Array.isArray(d)) setListings(d);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handlePost = async () => {
    if (!form.title) return toast.error("Title is required");
    const load = toast.loading("Posting listing...");
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Listed successfully!", { id: load });
        setShowForm(false);
        setForm({ title: "", description: "", price: "", category: "general", condition: "good", contactPhone: "", flatNumber: "" });
        fetchListings();
      } else {
        toast.error("Failed to post", { id: load });
      }
    } catch {
      toast.error("Error", { id: load });
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await fetch(`/api/marketplace/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sold" }),
      });
      toast.success("Marked as sold");
      fetchListings();
    } catch {
      toast.error("Failed to update");
    }
  };

  const filtered = filter === "all" ? listings : listings.filter(l => l.category === filter);

  return (
    <div className="page-container max-w-7xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Buy & Sell</h1>
          <p className="text-text-secondary font-medium mt-1">Community marketplace — exchange items with neighbours</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>Post Listing</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setFilter("all")} 
          className={`h-10 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
            filter === "all" ? "bg-text-primary text-surface shadow-md" : "bg-surface-raised text-text-secondary border border-border hover:bg-surface"
          }`}
        >
          All Items
        </button>
        {CATEGORIES.map(c => (
          <button 
            key={c.value} 
            onClick={() => setFilter(c.value)} 
            className={`h-10 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              filter === c.value ? "bg-text-primary text-surface shadow-md" : "bg-surface-raised text-text-secondary border border-border hover:bg-surface"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface-raised rounded-[2rem] h-64 border border-border animate-pulse card-float" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <Package className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary">No listings found</h3>
          <p className="text-text-secondary mt-2">Be the first to post something in this category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(l => (
            <div key={l.id} className="bg-surface-raised rounded-[2rem] border border-border p-6 card-float group hover:border-primary/20 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-text-primary leading-tight truncate">{l.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[9px] uppercase font-black tracking-widest text-text-tertiary bg-surface px-2.5 py-1 rounded-lg border border-border">
                      {l.category}
                    </span>
                    <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border ${
                      l.condition === "new" ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/30" : 
                      l.condition === "like_new" ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-100 dark:border-blue-900/30" : 
                      "bg-surface text-text-secondary border-border"
                    }`}>
                      {CONDITIONS.find(c => c.value === l.condition)?.label || l.condition}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Tag className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
              
              {l.description && (
                <p className="text-sm font-medium text-text-secondary mb-6 line-clamp-3 leading-relaxed">
                  {l.description}
                </p>
              )}
              
              <div className="mt-auto pt-5 border-t border-border/50 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Asking Price</p>
                  <p className="text-2xl font-black text-primary tracking-tighter">
                    {l.price ? formatCurrency(l.price) : "Free"}
                  </p>
                </div>
                {l.status !== "sold" && (
                  <button onClick={() => handleMarkSold(l.id)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:underline">
                    Mark Sold
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4 bg-surface px-4 py-3 rounded-xl border border-border">
                {l.flatNumber ? (
                  <p className="text-xs font-bold text-text-secondary">Flat {l.flatNumber}</p>
                ) : <div />}
                <p className="text-[10px] font-bold text-text-tertiary">{new Date(l.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Post Listing Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-surface-raised rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-8 border border-border shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Post a Listing</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Sell or give away items to your neighbours</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-2xl hover:bg-surface flex items-center justify-center text-text-tertiary transition-colors">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Title *</label>
                <input className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all placeholder:font-medium" placeholder="What are you selling?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Description</label>
                <textarea className="w-full bg-surface rounded-2xl px-5 py-4 font-medium text-text-primary border border-transparent focus:border-primary outline-none transition-all min-h-[100px] resize-none" placeholder="Add details about condition, age, reason for selling..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Price (₹)</label>
                  <input type="number" className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all placeholder:font-medium" placeholder="Leave empty for Free" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Category</label>
                  <select className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Condition</label>
                  <select className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Flat Number</label>
                  <input className="w-full h-14 bg-surface rounded-2xl px-5 font-bold text-text-primary border border-transparent focus:border-primary outline-none transition-all" placeholder="E.g., A-101" value={form.flatNumber} onChange={e => setForm({ ...form, flatNumber: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 rounded-2xl font-bold text-text-secondary hover:bg-surface transition-colors">Discard</button>
                <button type="button" onClick={handlePost} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Publish Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
