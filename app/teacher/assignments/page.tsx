"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Loader2,
  Plus,
  X,
  Calendar as CalendarIcon,
  RefreshCw,
  Trash2,
  Paperclip,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import ReactMarkdown from "react-markdown";
import { FileViewer } from "@/components/ui/FileViewer";

export default function TeacherAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [newTP, setNewTP] = useState({ title: "", deadline: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // File Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });

  useEffect(() => {
    fetchSubjectAndAssignments();
  }, []);

  const fetchSubjectAndAssignments = async () => {
    try {
      setLoading(true);
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) throw new Error("No active subject");

      const subjectData = await subjectRes.json();
      setActiveSubject(subjectData);

      const assignRes = await fetch(`/api/assignments?subjectId=${subjectData._id}`);
      const data = await assignRes.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!activeSubject) return;
    try {
      const res = await fetch(`/api/assignments?subjectId=${activeSubject._id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleCreateTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return;
    setCreating(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newTP, 
          broadcast: true, 
          subject: activeSubject.name,
          subjectId: activeSubject._id
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      
      toast("Trabajo Práctico publicado con éxito", "success");
      setShowCreateModal(false);
      setNewTP({ title: "", deadline: "", description: "" });
      fetchAssignments();
    } catch (error) {
      toast("Error al crear el TP", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajo práctico?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/assignments?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      
      toast("Trabajo eliminado correctamente", "success");
      setAssignments(prev => prev.filter(as => as._id !== id));
      if (selectedAssignment?._id === id) setSelectedAssignment(null);
    } catch (error) {
      toast("Error al eliminar", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openViewer = (name: string, url: string) => {
    setSelectedFile({ name, url });
    setViewerOpen(true);
  };

  const stats = {
    pending: assignments.filter(a => a.status === 'pending' || a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    late: assignments.filter(a => a.status === 'late').length,
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Trabajos Prácticos</h1>
                <button 
                  onClick={fetchAssignments}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 transition-colors"
                  title="Refrescar lista"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium italic">
                {activeSubject ? `Materia: ${activeSubject.name}` : "Cargando materia..."}
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[24px] bg-indigo-600 hover:bg-indigo-500 transition-all text-[10px] md:text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
            >
              <Plus className="w-5 h-5" /> Nuevo TP
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10">
            <div className="space-y-6">
              <div className="p-6 md:p-8 rounded-[32px] bg-[#0f172a] border border-white/5 shadow-2xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Estado del Aula</h3>
                <div className="space-y-4">
                  {[
                    { label: "Pendientes", count: stats.pending, icon: Clock, color: "text-amber-400" },
                    { label: "Calificados", count: stats.graded, icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Atrasados", count: stats.late, icon: AlertCircle, color: "text-red-400" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                      <div className="flex items-center gap-3">
                        <s.icon className={cn("w-4 h-4", s.color)} />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                      </div>
                      <span className="text-lg font-black text-white">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick AI Tip */}
              <div className="p-6 md:p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/10 hidden lg:block">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tip de EduAI</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pídele a EduAI que redacte el feedback de las entregas pendientes para ahorrar tiempo.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {loading ? (
                <div className="px-6 py-20 md:py-32 text-center rounded-[32px] bg-[#0f172a] border border-white/5">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando entregas...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="px-6 py-20 text-center rounded-[32px] bg-[#0f172a] border border-white/5 border-dashed">
                  <p className="text-slate-500 font-medium">No hay trabajos prácticos para esta materia.</p>
                </div>
              ) : (
                assignments.map((as, i) => (
                  <motion.div
                    key={as._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAssignment(as)}
                    className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#0f172a] group hover:border-indigo-500/40 transition-all cursor-pointer border border-white/5 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5 overflow-hidden">
                        <div className={cn(
                          "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center shrink-0",
                          as.status === 'graded' ? 'bg-emerald-500/10' : as.status === 'submitted' ? 'bg-indigo-500/10' : 'bg-amber-500/10'
                        )}>
                          <FileText className={cn(
                            "w-6 h-6 md:w-8 md:h-8",
                            as.status === 'graded' ? 'text-emerald-400' : as.status === 'submitted' ? 'text-indigo-400' : 'text-amber-400'
                          )} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-100 text-sm md:text-lg truncate group-hover:text-indigo-400 transition-colors">{as.title}</h4>
                          </div>
                          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                             Asignado: {as.student === 'Todos' ? 'Todo el curso' : as.student} • <span className="text-indigo-500/80">Límite: {as.deadline}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        {as.status === 'graded' ? (
                          <div className="text-right sm:mr-4">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Nota</p>
                            <p className="text-xl md:text-2xl font-black text-emerald-400 leading-none">{as.grade?.toFixed(1)}</p>
                          </div>
                        ) : (
                          <div className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                            as.status === 'submitted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                          )}>
                            {as.status === 'submitted' ? 'Entregado' : 'Pendiente'}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={(e) => handleDelete(e, as._id)}
                            disabled={deletingId === as._id}
                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:flex"
                          >
                            {deletingId === as._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                          <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAssignment(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] rounded-[32px] md:rounded-[48px] p-6 md:p-10 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 md:mb-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">{selectedAssignment.title}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-[10px] md:text-xs font-bold text-slate-400">
                      <CalendarIcon className="w-3.5 h-3.5" /> Límite: {selectedAssignment.deadline}
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border",
                      selectedAssignment.status === 'graded' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                    )}>
                      {selectedAssignment.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 ml-1">Consigna del Trabajo</h4>
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-slate-950/50 border border-white/5 min-h-[160px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {selectedAssignment.description ? (
                      <div className="prose prose-invert prose-indigo prose-sm max-w-none leading-relaxed text-slate-300">
                        <ReactMarkdown>
                          {selectedAssignment.description}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p className="text-sm italic">Sin descripción disponible.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Adjuntos Section */}
                <div>
                   <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 ml-1">Adjuntos y Recursos</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: "Guía_Practica.pdf", url: "/docs/guia.pdf" },
                        { name: "Plantilla_Entrega.docx", url: "/docs/plantilla.docx" },
                      ].map((file, idx) => (
                        <div 
                          key={idx}
                          onClick={() => openViewer(file.name, file.url)}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{file.name}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Destinatario</p>
                    <p className="text-xs md:text-sm font-bold text-slate-200">{selectedAssignment.student === 'Todos' ? 'Todo el curso' : selectedAssignment.student}</p>
                  </div>
                  <div className="p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Materia</p>
                      <p className="text-xs md:text-sm font-bold text-slate-200 truncate max-w-[100px] md:max-w-none">{selectedAssignment.subject}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, selectedAssignment._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="Eliminar TP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-white/10"
            >
              <h3 className="text-xl md:text-2xl font-black mb-8">Nuevo Trabajo Práctico</h3>
              <form onSubmit={handleCreateTP} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Título</label>
                  <input 
                    type="text" placeholder="Ej: TP de Algoritmos" required
                    value={newTP.title} onChange={(e) => setNewTP({...newTP, title: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-5 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Consigna</label>
                  <textarea 
                    placeholder="Escribe la consigna..." rows={5}
                    value={newTP.description} onChange={(e) => setNewTP({...newTP, description: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-5 focus:outline-none focus:border-indigo-500 resize-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha Límite</label>
                  <input 
                    type="date" required
                    value={newTP.deadline} onChange={(e) => setNewTP({...newTP, deadline: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-5 focus:outline-none focus:border-indigo-500 transition-all text-slate-400 text-sm"
                  />
                </div>
                <button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 mt-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50">
                  {creating ? "Publicando..." : "Publicar TP"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FileViewer 
        isOpen={viewerOpen}
        filename={selectedFile.name}
        url={selectedFile.url}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
