"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Users, Search, Phone, Mail, Car, Home, ChevronDown, ChevronUp, User, ShieldCheck } from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface DirectoryEntry {
  flatNumber: string;
  wing: string | null;
  floor: number | null;
  ownerName: string;
  tenantName: string | null;
  currentOccupant: string | null;
  flatType: string | null;
  vehicleNumber: string | null;
  contact: string | null;
  email: string | null;
  members: Array<{ name: string; role: string; phone: string | null; email: string | null }>;
}

export default function DirectoryPage() {
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [wings, setWings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWing, setSelectedWing] = useState("all");
  const [expandedFlat, setExpandedFlat] = useState<string | null>(null);

  const fetchDirectory = useCallback(() => {
    setLoading(true);
    fetch("/api/directory")
      .then((r) => r.json())
      .then((d) => {
        setDirectory(d.directory || []);
        setWings(d.wings || []);
      })
      .catch(() => toast.error("Failed to load directory"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDirectory(); }, [fetchDirectory]);

  const filtered = directory.filter((d) => {
    if (selectedWing !== "all" && (d.wing || "General") !== selectedWing) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.flatNumber.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        (d.tenantName || "").toLowerCase().includes(q) ||
        (d.contact || "").includes(q);
    }
    return true;
  });

  return (
    <div className="page-container max-w-5xl">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Resident Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Connect with your neighbours and community</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Privacy Verified</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            className="input !pl-11 !rounded-2xl !bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 font-bold text-sm h-12" 
            placeholder="Search by name, flat, or contact..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
          <button 
            onClick={() => setSelectedWing("all")} 
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              selectedWing === "all" 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
            }`}
          >
            All Wings
          </button>
          {wings.map((w) => (
            <button 
              key={w} 
              onClick={() => setSelectedWing(w)} 
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedWing === w 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
              }`}
            >
              Wing {w}
            </button>
          ))}
        </div>
      </div>

      {/* Directory List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No results found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-12">
          {filtered.map((entry) => {
            const key = `${entry.wing}-${entry.flatNumber}`;
            const isExpanded = expandedFlat === key;
            return (
              <div key={key} className="card p-0 overflow-hidden group">
                <button 
                  onClick={() => setExpandedFlat(isExpanded ? null : key)} 
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 shadow-sm border border-primary/10 group-hover:scale-105 transition-transform">
                      {entry.wing ? `${entry.wing}-` : ""}{entry.flatNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {entry.ownerName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.currentOccupant === "tenant" && entry.tenantName ? (
                          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-lg border border-violet-100 dark:border-violet-800">
                            Occupied by: {entry.tenantName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            Owner Resident
                          </span>
                        )}
                        {entry.flatType && <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">· {entry.flatType}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {entry.contact && (
                      <a 
                        href={`tel:${entry.contact}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Phone className="w-4.5 h-4.5" />
                      </a>
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                      {entry.contact && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-primary" /> {entry.contact}
                          </p>
                        </div>
                      )}
                      {entry.email && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-primary" /> {entry.email}
                          </p>
                        </div>
                      )}
                      {entry.vehicleNumber && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Vehicle</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Car className="w-3.5 h-3.5 text-primary" /> {entry.vehicleNumber}
                          </p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-primary" /> Floor {entry.floor || "N/A"} · Wing {entry.wing || "N/A"}
                        </p>
                      </div>
                    </div>

                    {entry.members.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Family & Members</p>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {entry.members.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{m.role}</p>
                                </div>
                              </div>
                              {m.phone && (
                                <a href={`tel:${m.phone}`} className="text-[10px] font-black text-primary hover:underline bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  {m.phone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
