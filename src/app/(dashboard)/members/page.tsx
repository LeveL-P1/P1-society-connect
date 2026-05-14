"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Plus, Upload, Search, Pencil, Trash2, 
  MessageSquare, Download, Filter, Home, 
  User, ShieldCheck, MoreVertical, ExternalLink 
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import type { FlatType } from "@/types";

export default function MembersPage() {
  const [members, setMembers] = useState<FlatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wingFilter, setWingFilter] = useState("");
  const [wings, setWings] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<FlatType | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (wingFilter) params.set("wing", wingFilter);
    params.set("page", page.toString());
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json();
      setMembers(data.members || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
      if (data.wings) setWings(data.wings);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [search, wingFilter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/members/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Flat ${deleteTarget.flatNumber} removed`);
        fetchMembers();
      } else {
        toast.error("Failed to delete member");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setDeleteTarget(null);
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(`/api/members?limit=1000`);
      const data = await res.json();
      if (!data.members || data.members.length === 0) return toast.error("No members to export");
      
      const headers = ["Flat No.", "Wing", "Owner Name", "Tenant Name", "Contact", "Email", "Vehicle Number", "Status"];
      const csvContent = [
        headers.join(","),
        ...data.members.map((m: any) => 
          [m.flatNumber, m.wing || "", m.ownerName, m.tenantName || "", m.contact, m.email || "", m.vehicleNumber || "", m.isActive ? "Active" : "Inactive"].map(v => `"${v}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `society_members_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export successful");
    } catch {
      toast.error("Failed to export");
    }
  };

  return (
    <div className="page-container max-w-6xl">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Residents & Flats</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage {total} total occupancy records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportCsv} className="btn btn-secondary !rounded-2xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link href="/members/import" className="btn btn-secondary !rounded-2xl">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Link>
          <Link href="/members/add" className="btn btn-primary !rounded-2xl shadow-xl shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add Flat
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            className="input !pl-11 !rounded-2xl !bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 font-bold text-sm"
            placeholder="Search by name or flat number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0">
          <button
            onClick={() => setWingFilter("")}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              wingFilter === "" 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
            }`}
          >
            All Wings
          </button>
          {wings.map((w) => (
            <button
              key={w}
              onClick={() => setWingFilter(w)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                wingFilter === w 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
              }`}
            >
              Wing {w}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : members.length === 0 ? (
        <div className="card text-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm px-6">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 mx-auto text-slate-300">
            <Home className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No records found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            {search ? `No matches for "${search}" in the directory.` : "Start by adding residents or importing your existing society database."}
          </p>
          {!search && (
            <div className="flex justify-center gap-3">
              <Link href="/members/add" className="btn btn-primary !rounded-xl">Add Member</Link>
              <Link href="/members/import" className="btn btn-secondary !rounded-xl">Import CSV</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-12">
          {/* Card View for Mobile/Desktop consistency */}
          <div className="grid grid-cols-1 gap-4">
            {members.map((m) => (
              <div key={m.id} className="card p-5 sm:p-6 group hover:border-primary/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/10 group-hover:scale-105 transition-transform shrink-0">
                      <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{m.wing || "Flat"}</span>
                      <span className="text-sm font-black leading-none">{m.flatNumber}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                          {m.ownerName}
                        </h3>
                        <StatusBadge status={m.isActive ? "active" : "inactive"} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {m.contact}
                        </p>
                        {m.tenantName && (
                          <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-lg border border-violet-100 dark:border-violet-800">
                            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-black uppercase">Tenant: {m.tenantName}</span>
                          </div>
                        )}
                        {m.vehicleNumber && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">· {m.vehicleNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`https://wa.me/91${m.contact}`, "_blank")}
                        className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 dark:border-emerald-800"
                        title="Message on WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <Link
                        href={`/members/${m.id}/edit`}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white transition-all border border-slate-200 dark:border-slate-700"
                        title="Edit Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-800"
                      title="Remove Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className={`btn !px-6 !py-3 !rounded-xl !text-xs font-black ${page <= 1 ? "opacity-50 cursor-not-allowed" : "btn-secondary"}`}
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className={`btn !px-6 !py-3 !rounded-xl !text-xs font-black ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "btn-primary shadow-lg shadow-primary/20"}`}
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Resident Record"
        message={`Are you sure you want to remove the record for Flat ${deleteTarget?.flatNumber}? This will archive the owner and tenant data.`}
        confirmLabel="Confirm Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
