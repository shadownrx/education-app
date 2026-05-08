"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import {
  Library, Search, FileText, File, Download, ExternalLink,
  Clock, ImageIcon, Loader2, BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
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

function getFileCategory(type: string) {
  if (type === "application/pdf") return "pdf";
  if (type.includes("word") || type.includes("docx")) return "docx";
  if (type.startsWith("image/")) return "image";
  return "other";
}

function ResourceCard({ resource, onView }: { resource: Resource; onView: () => void }) {
  const cat = getFileCategory(resource.type);
  const iconConfig = {
    pdf:   { Icon: FileText,  bg: "bg-red-500/10",     text: "text-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20" },
    docx:  { Icon: File,      bg: "bg-blue-500/10",    text: "text-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    image: { Icon: ImageIcon, bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    other: { Icon: File,      bg: "bg-slate-500/10",   text: "text-slate-400",   badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  }[cat];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group p-6 rounded-[28px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/25 transition-all flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", iconConfig.bg)}>
          <iconConfig.Icon className={cn("w-6 h-6", iconConfig.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">{resource.title}</h4>
          {resource.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{resource.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest", iconConfig.badge)}>
          {cat.toUpperCase()}
        </span>
        <span className="text-[10px] text-slate-600 font-bold">{formatBytes(resource.size)}</span>
        <span className="text-slate-700">•</span>
        <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo(resource.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <button
          onClick={onView}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
        >
          Ver recurso
        </button>
        <a
          href={resource.url}
          download={resource.filename}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Descargar"
        >
          <Download className="w-4 h-4" />
        </a>
        <a
          href={resource.url}
          target="_blank"
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Abrir en pestaña"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => (r.ok ? r.json() : []))
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.filename.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openViewer = (resource: Resource) => {
    setSelectedFile({ url: resource.url, name: resource.filename });
    setViewerOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="student" />

      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="student" />

        <div className="p-4 md:p-10 max-w-7xl mx-auto">

          {/* Header */}
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">
              <Library className="w-3.5 h-3.5" /> Materiales de Clase
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Recursos del Docente</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? "Cargando..." : `${resources.length} material${resources.length !== 1 ? "es" : ""} disponible${resources.length !== 1 ? "s" : ""}`}
            </p>
          </header>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Buscar recursos, PDFs, guías..."
              className="w-full bg-[#0f172a] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-[28px] bg-[#0f172a] border border-white/5 space-y-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                      <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center rounded-[32px] border border-dashed border-white/8 bg-[#0f172a]/50">
              {search ? (
                <>
                  <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="font-black text-white text-lg mb-2">Sin resultados</h3>
                  <p className="text-slate-500 text-sm">No hay recursos que coincidan con &quot;{search}&quot;</p>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="font-black text-white text-lg mb-2">Aún no hay materiales</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Tu docente todavía no publicó recursos para esta materia. Volvé más tarde.
                  </p>
                </>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((resource, i) => (
                  <motion.div
                    key={resource._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ResourceCard resource={resource} onView={() => openViewer(resource)} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <FileViewer
        isOpen={viewerOpen}
        filename={selectedFile.name}
        url={selectedFile.url}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
