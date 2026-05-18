"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FolderOpen, Plus, FileText, Download, Trash2, Shield, Settings, File } from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  uploadedBy: string;
  createdAt: string;
}

const categoryConfig: Record<string, { icon: React.ComponentType<{className?: string; strokeWidth?: number}>; color: string; label: string }> = {
  bylaws: { icon: Shield, color: "text-blue-700 bg-blue-100", label: "Bylaws & Rules" },
  noc: { icon: FileText, color: "text-green-700 bg-green-100", label: "NOCs" },
  minutes: { icon: File, color: "text-purple-700 bg-purple-100", label: "Meeting Minutes" },
  financial: { icon: Settings, color: "text-orange-700 bg-orange-100", label: "Financial" },
  general: { icon: FolderOpen, color: "text-gray-700 bg-gray-100", label: "General" }
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "general", fileName: "", fileUrl: "", fileSize: 0 });

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Mock file upload - in a real app this would upload to Supabase/S3 first
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(f => ({
        ...f,
        fileName: file.name,
        fileSize: file.size,
        // Using a fake URL for now until real storage is integrated
        fileUrl: `https://example.com/docs/${encodeURIComponent(file.name)}` 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileUrl) {
      toast.error("Please select a file first");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Document uploaded");
        setShowForm(false);
        setForm({ title: "", category: "general", fileName: "", fileUrl: "", fileSize: 0 });
        fetchDocuments();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    toast.success("Document deleted");
    fetchDocuments();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Group by category
  const grouped = documents.reduce<Record<string, Document[]>>((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {});

  return (
    <div className="page-container max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
            <FolderOpen className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Document Repository</h1>
            <p className="text-text-secondary font-medium mt-1">{documents.length} secure documents stored</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="h-14 px-8 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> Upload Document
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner !w-10 !h-10" /></div>
      ) : documents.length === 0 ? (
        <div className="bg-surface-raised rounded-[2.5rem] p-16 text-center border border-dashed border-border card-float">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-text-tertiary border border-border">
            <FileText className="w-10 h-10 opacity-50" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-text-primary tracking-tight">No documents uploaded</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">Keep your society rules, NOCs, and meeting minutes here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => {
            const config = categoryConfig[category] || categoryConfig.general;
            const Icon = config.icon;
            return (
              <div key={category} className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-[1rem] shadow-sm ${config.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-lg font-black text-text-primary uppercase tracking-widest">{config.label}</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-surface px-2 py-1 rounded-md border border-border">
                    {items.length} Files
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((doc) => (
                    <div key={doc.id} className="card-float bg-surface-raised rounded-[2rem_1.5rem_2rem_1.5rem] border border-border p-6 flex flex-col justify-between group hover:border-primary/30 transition-all">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 shrink-0 rounded-[1.25rem] bg-surface flex items-center justify-center border border-border group-hover:scale-105 transition-transform shadow-sm group-hover:bg-primary/5">
                          <FileText className="w-6 h-6 text-text-tertiary group-hover:text-primary transition-colors" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-text-primary text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={doc.title}>{doc.title}</h3>
                          <p className="text-[10px] font-bold text-text-secondary truncate mt-1.5" title={doc.fileName}>{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{formatSize(doc.fileSize)}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" strokeWidth={2.5} />
                          </a>
                          <button 
                            onClick={() => handleDelete(doc.id)} 
                            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showForm && (
        <div className="modal-overlay !bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowForm(false)}>
          <div className="bg-surface-raised w-full max-w-lg sm:rounded-[2.5rem] h-full sm:h-auto overflow-y-auto !p-6 sm:!p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-text-primary tracking-tight mb-8">Upload Document</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Title *</label>
                <input 
                  className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm" 
                  placeholder="e.g. Society Bylaws 2024" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Category *</label>
                <select 
                  className="w-full h-14 bg-surface border border-border rounded-[1.5rem] px-5 font-bold text-text-primary focus:border-primary outline-none transition-all shadow-sm appearance-none" 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.entries(categoryConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">File *</label>
                <div className="w-full bg-surface border border-dashed border-border rounded-[1.5rem] p-6 text-center hover:border-primary/50 transition-colors">
                  <input 
                    type="file" 
                    className="block w-full text-sm font-bold text-text-secondary file:mr-4 file:py-2.5 file:px-6 file:rounded-[1rem] file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer" 
                    onChange={handleFileChange} 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-14 bg-surface rounded-[1.5rem] border border-border text-text-primary hover:bg-surface-raised font-black uppercase tracking-widest text-[10px] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-[2] h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50">
                  {saving ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
