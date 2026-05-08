"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import {
  Library, Search, Plus, Folder, FileText, File, Trash2,
  Download, ExternalLink, HardDrive, Clock, Sparkles,
  X, Upload, CheckCircle2, AlertCircle, Loader2, ImageIcon,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileViewer } from "@/components/ui/FileViewer";
import { motion, AnimatePresence } from "framer-motion";

interface Resource {
  _id: string;
  title: string;
  description?: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

type FilterType = "all" | "pdf" | "docx" | "image" | "other";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)} días`;
}

function getFileCategory(type: string): FilterType {
  if (type === "application/pdf") return "pdf";
  if (type.includes("word") || type.includes("docx")) return "docx";
  if (type.startsWith("image/")) return "image";
  return "other";
}

function FileIcon({ type, size = "lg" }: { type: string; size?: "sm" | "lg" }) {
  const cat = getFileCategory(type);
  const sz = size === "lg" ? "w-8 h-8" : "w-4 h-4";
  const wrapSz = size === "lg" ? "w-14 h-14 rounded-2xl" : "w-9 h-9 rounded-xl";
  if (cat === "pdf") return <div className={cn("flex items-center justify-center bg-red-500/10", wrapSz)}><FileText className={cn("text-red-400", sz)} /></div>;
  if (cat === "docx") return <div className={cn("flex items-center justify-center bg-blue-500/10", wrapSz)}><File className={cn("text-blue-400", sz)} /></div>;
  if (cat === "image") return <div className={cn("flex items-center justify-center bg-emerald-500/10", wrapSz)}><ImageIcon className={cn("text-emerald-400", sz)} /></div>;
  return <div className={cn("flex items-center justify-center bg-slate-500/10", wrapSz)}><File className={cn("text-slate-400", sz)} /></div>;
}

/* ── Upload Modal ── */
function UploadModal({
  isOpen, onClose, subjectId, onSuccess,
}: {
  isOpen: boolean; onClose: () => void; subjectId: string; onSuccess: (r: Resource) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFile(null); setTitle(""); setDescription(""); setError(""); };

  const handleClose = () => { reset(); onClose(); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  }, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Seleccioná un archivo primero.");
    if (!title.trim()) return setError("Ingresá un título.");
    if (!subjectId) return setError("No hay materia activa.");
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) { const d = await upRes.json(); throw new Error(d.error || "Error al subir"); }
      const { file: uploaded } = await upRes.json();

      const resRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          filename: uploaded.name,
          url: uploaded.url,
          type: uploaded.type,
          size: uploaded.size,
          subjectId,
        }),
      });
      if (!resRes.ok) { const d = await resRes.json(); throw new Error(d.error || "Error al guardar"); }
      const resource = await resRes.json();
      onSuccess(resource);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f172a] rounded-[32px] border border-white/10 shadow-2xl p-8 z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white">Subir Recurso</h2>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, imágenes y más · Máx 20MB</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-6",
                dragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-indigo-500/40 hover:bg-white/3"
              )}>
              <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mp3" />
              {file ? (
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-white text-sm truncate max-w-[280px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Arrastrá un archivo o hacé click</p>
                  <p className="text-xs text-slate-600 mt-1">PDF, Word, Excel, imágenes, video…</p>
                </>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Título *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Clase 01 - Introducción a SQL"
                  className="w-full bg-slate-900 border border-white/8 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Descripción (opcional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del contenido..."
                  rows={2}
                  className="w-full bg-slate-900 border border-white/8 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-none" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={uploading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Publicar Recurso</>}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Main Page ── */
export default function LibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const subRes = await fetch("/api/subjects/active");
      if (!subRes.ok) { setLoading(false); return; }
      const subject = await subRes.json();
      setSubjectId(subject._id);

      const resRes = await fetch(`/api/resources?subjectId=${subject._id}`);
      if (resRes.ok) setResources(await resRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este recurso? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r._id !== id));
    } finally { setDeleting(null); }
  };

  const filtered = resources.filter((r) => {
    const matchFilter = filter === "all" || getFileCategory(r.type) === filter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.filename.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSize = resources.reduce((acc, r) => acc + r.size, 0);
  const usedPct = Math.min(Math.round((totalSize / (1024 * 1024 * 500)) * 100), 100);

  const filterBtns: { label: string; value: FilterType; count: number }[] = [
    { label: "Todos", value: "all", count: resources.length },
    { label: "PDF", value: "pdf", count: resources.filter((r) => getFileCategory(r.type) === "pdf").length },
    { label: "Word", value: "docx", count: resources.filter((r) => getFileCategory(r.type) === "docx").length },
    { label: "Imágenes", value: "image", count: resources.filter((r) => getFileCategory(r.type) === "image").length },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        <div className="p-4 md:p-10 max-w-7xl mx-auto">

          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">
                <Library className="w-3.5 h-3.5" /> Mi Biblioteca Digital
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Gestión de Recursos</h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? "Cargando..." : `${resources.length} archivo${resources.length !== 1 ? "s" : ""} publicado${resources.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => setUploadOpen(true)}
              disabled={!subjectId}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-[24px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
              <Plus className="w-5 h-5" /> Subir Archivo
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10">

            {/* Sidebar filters */}
            <div className="space-y-6">
              <div className="p-6 rounded-[32px] bg-[#0f172a] border border-white/5 space-y-2">
                {filterBtns.map((btn) => (
                  <button key={btn.value} onClick={() => setFilter(btn.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all",
                      filter === btn.value ? "bg-indigo-600 text-white" : "hover:bg-white/5 text-slate-400"
                    )}>
                    <div className="flex items-center gap-3">
                      <Folder className="w-4 h-4" />
                      {btn.label}
                    </div>
                    <span className="text-[10px] opacity-70">{btn.count}</span>
                  </button>
                ))}
              </div>

              <div className="p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Almacenamiento</h4>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                  <motion.div className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${usedPct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {formatBytes(totalSize)} de 500 MB usados
                </p>
              </div>

              {/* Promo */}
              <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-800 border border-white/10 shadow-xl relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white mb-3">
                    <Sparkles className="w-3 h-3" /> Próximamente
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 tracking-tighter">EduFlow Drive</h3>
                  <p className="text-indigo-100/70 text-xs leading-relaxed">Sincronización con Google Drive y OneDrive.</p>
                </div>
                <Library className="absolute -bottom-6 -right-6 w-20 h-20 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              </div>
            </div>

            {/* Files grid */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  type="text" placeholder="Buscar en mis recursos..."
                  className="w-full bg-[#0f172a] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-[32px] bg-[#0f172a] border border-white/5 space-y-4 animate-pulse">
                      <div className="w-14 h-14 rounded-2xl bg-white/5" />
                      <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                      <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-24 text-center rounded-[32px] border border-dashed border-white/8 bg-[#0f172a]/50">
                  <Library className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="font-black text-white text-lg mb-2">
                    {search || filter !== "all" ? "Sin resultados" : "Biblioteca vacía"}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {search || filter !== "all" ? "Probá con otros filtros." : "Subí tu primer recurso para que tus alumnos puedan acceder."}
                  </p>
                  {!search && filter === "all" && (
                    <button onClick={() => setUploadOpen(true)}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all">
                      <Plus className="w-4 h-4" /> Subir primer archivo
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filtered.map((resource, i) => (
                      <motion.div
                        key={resource._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04 }}
                        className="group p-6 rounded-[32px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden flex flex-col gap-4">

                        <div className="flex items-start justify-between">
                          <FileIcon type={resource.type} />
                          <button
                            onClick={() => handleDelete(resource._id)}
                            disabled={deleting === resource._id}
                            className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                            {deleting === resource._id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{resource.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                            <span>{formatBytes(resource.size)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(resource.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedFile({ url: resource.url, name: resource.filename }); setViewerOpen(true); }}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                            Ver
                          </button>
                          <a href={resource.url} download={resource.filename}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <Download className="w-4 h-4" />
                          </a>
                          <a href={resource.url} target="_blank"
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        subjectId={subjectId}
        onSuccess={(r) => setResources((prev) => [r, ...prev])}
      />

      <FileViewer
        isOpen={viewerOpen}
        filename={selectedFile.name}
        url={selectedFile.url}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
