"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { 
  Users, Search, Phone, Mail, Car, Home, ChevronDown, ChevronUp, 
  User, ShieldCheck, Filter, UserRound, ArrowRight, MessageSquare 
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function SkeletonCard() {
  return (
    <div className="bg-surface-raised rounded-[2rem] p-6 border border-border animate-pulse flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-surface shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface rounded w-1/3" />
        <div className="h-3 bg-surface rounded w-1/4" />
      </div>
    </div>
  );
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
      .catch(() => toast.error("Sync failed"))
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
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Resident Directory</h1>
          <p className="text-text-secondary font-medium mt-1">Connect with your neighbours and community</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 px-5 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <ShieldCheck className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Privacy Secured</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" strokeWidth={2.5} />
          <input 
            className="w-full h-14 bg-surface-raised border border-border rounded-[1.5rem] pl-12 pr-4 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
            placeholder="Search by name, flat, or contact..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button 
            onClick={() => setSelectedWing("all")} 
            className={cn(
              "h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
              selectedWing === "all" 
                ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
            )}
          >
            All Wings
          </button>
          {wings.map((w) => (
            <button 
              key={w} 
              onClick={() => setSelectedWing(w)} 
              className={cn(
                "h-14 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
                selectedWing === w 
                  ? "bg-text-primary text-surface border-text-primary shadow-lg shadow-text-primary/10" 
                  : "bg-surface-raised text-text-tertiary border-border hover:border-primary/30"
              )}
            >
              Wing {w}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <Users className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary">No neighbors found</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">
            Try adjusting your search filters or wing selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => {
            const key = `${entry.wing}-${entry.flatNumber}`;
            const isExpanded = expandedFlat === key;
            return (
              <div 
                key={key} 
                className={cn(
                  "bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border border-border overflow-hidden card-float transition-all",
                  isExpanded ? "md:col-span-2 border-primary/20" : "hover:border-primary/10"
                )}
              >
                <button 
                  onClick={() => setExpandedFlat(isExpanded ? null : key)} 
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary font-black text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      {entry.wing ? `${entry.wing}-` : ""}{entry.flatNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-text-primary truncate leading-tight group-hover:text-primary transition-colors">
                        {entry.ownerName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.currentOccupant === "tenant" && entry.tenantName ? (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-lg">
                            Tenant: {entry.tenantName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                            Owner Resident
                          </span>
                        )}
                        {entry.flatType && <span className="text-[10px] text-text-tertiary font-black uppercase tracking-tighter">· {entry.flatType}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {entry.contact && (
                      <a 
                        href={`tel:${entry.contact}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Phone className="w-5 h-5" strokeWidth={2.5} />
                      </a>
                    )}
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-text-tertiary transition-transform", isExpanded ? "rotate-180" : "rotate-0")}>
                      <ChevronDown className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                      {entry.contact && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Mobile Contact</p>
                          <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" strokeWidth={2.5} /> {entry.contact}
                          </p>
                        </div>
                      )}
                      {entry.email && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-text-primary flex items-center gap-2 truncate">
                            <Mail className="w-4 h-4 text-primary" strokeWidth={2.5} /> {entry.email}
                          </p>
                        </div>
                      )}
                      {entry.vehicleNumber && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Primary Vehicle</p>
                          <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" strokeWidth={2.5} /> {entry.vehicleNumber}
                          </p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Location</p>
                        <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                          <Home className="w-4 h-4 text-primary" strokeWidth={2.5} /> Floor {entry.floor || "0"} · Wing {entry.wing || "N/A"}
                        </p>
                      </div>
                    </div>

                    {entry.members.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-border/50">
                        <div className="flex items-center gap-4 mb-5">
                           <UserRound className="w-5 h-5 text-text-tertiary" />
                           <h4 className="text-xs font-black uppercase tracking-widest text-text-tertiary">Family & Flat Members</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {entry.members.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border/50 hover:border-primary/20 transition-all group/member">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-text-tertiary">
                                  <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-text-primary">{m.name}</p>
                                  <p className="text-[10px] text-text-tertiary font-black uppercase tracking-tighter">{m.role}</p>
                                </div>
                              </div>
                              {m.phone && (
                                <a href={`tel:${m.phone}`} className="p-2 bg-surface-raised rounded-xl text-text-tertiary hover:text-primary transition-colors">
                                  <Phone className="w-4 h-4" strokeWidth={2.5} />
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
