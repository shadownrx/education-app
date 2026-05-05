"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  ChevronRight, 
  Plus, 
  FileText, 
  Layers,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileViewer } from "@/components/ui/FileViewer";

export default function LessonPlanPage() {
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  
  // File Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });

  useEffect(() => {
    fetchSubjectAndLessons();
  }, []);

  const fetchSubjectAndLessons = async () => {
    try {
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) {
        setLoading(false);
        return;
      }

      const subjectData = await subjectRes.json();
      setActiveSubject(subjectData);

      const lessonRes = await fetch(`/api/lessons?subjectId=${subjectData._id}`);
      const data = await lessonRes.json();
      if (Array.isArray(data)) {
        setLessonPlans(data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (name: string, url: string) => {
    setSelectedFile({ name, url });
    setViewerOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header Card */}
          <header className="mb-8 md:mb-12 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-slate-900 to-[#0f172a] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 md:mb-6">
                  <Calendar className="w-3 h-3" /> Currículo Académico
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">Planificación de Clases</h1>
                {activeSubject && (
                  <p className="text-xs md:text-sm text-slate-400 font-medium">
                    Ciclo Lectivo 2026 <span className="mx-2 text-slate-700 hidden sm:inline">|</span> <span className="text-indigo-400 font-bold block sm:inline mt-1 sm:mt-0">{activeSubject.name}</span>
                  </p>
                )}
              </div>

              <button className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[24px] bg-indigo-600 hover:bg-indigo-500 transition-all text-[10px] md:text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 group">
                <Plus className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" /> Nueva Unidad
              </button>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Timeline View */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8 relative">
              {/* Vertical Line */}
              <div className="absolute left-6 md:left-10 top-10 bottom-10 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent hidden sm:block" />

              {loading ? (
                <div className="px-6 py-20 md:py-32 text-center rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                  <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                </div>
              ) : lessonPlans.length === 0 ? (
                <div className="px-6 py-20 text-center rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                  <p className="text-slate-500 font-medium">No hay planes registrados.</p>
                </div>
              ) : (
                lessonPlans.map((unit, i) => (
                  <motion.div
                    key={unit._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative pl-0 sm:pl-16 md:pl-24 group",
                      unit.status === 'current' ? 'z-10' : 'z-0'
                    )}
                  >
                    {/* Circle on timeline */}
                    <div className={cn(
                      "absolute left-[20px] md:left-[34px] top-10 w-3 h-3 rounded-full border-2 bg-[#020617] hidden sm:block transition-all",
                      unit.status === 'completed' ? 'border-emerald-500 bg-emerald-500' :
                      unit.status === 'current' ? 'border-indigo-500 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' :
                      'border-slate-700'
                    )} />
                    
                    <div className={cn(
                      "p-6 md:p-8 rounded-[24px] md:rounded-[40px] border transition-all cursor-pointer",
                      unit.status === 'current' 
                        ? 'bg-[#0f172a] border-indigo-500/50 shadow-2xl shadow-indigo-600/10' 
                        : 'bg-[#0f172a]/40 border-white/5 hover:border-white/20'
                    )}>
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="flex gap-4 md:gap-8 w-full">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={cn(
                              "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center font-black text-lg md:text-2xl shadow-lg",
                              unit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              unit.status === 'current' ? 'bg-indigo-600 text-white' :
                              'bg-slate-800 text-slate-500'
                            )}>
                              {unit.week}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3">
                              <h3 className="text-lg md:text-2xl font-black text-white tracking-tight">{unit.title}</h3>
                              {unit.status === 'current' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest ring-1 ring-indigo-500/30">
                                  En Curso
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4 md:mb-6">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5 text-indigo-500/50" />
                                {unit.date}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Layers className="w-3.5 h-3.5 text-indigo-500/50" />
                                {unit.topics.length} Temas
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {unit.topics.map((topic: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] md:text-xs font-bold text-slate-300">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:block self-center">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Sidebar Resources */}
            <div className="space-y-6 md:space-y-8">
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                <h3 className="text-lg md:text-xl font-black text-white mb-6 md:mb-8 tracking-tight flex items-center justify-between">
                  Biblioteca
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { name: "Programa 2026.pdf", icon: FileText, url: "/docs/programa.pdf" },
                    { name: "Guía de SQL.docx", icon: FileText, url: "/docs/guia_sql.docx" },
                  ].map((res, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => openViewer(res.name, res.url)}
                      className="flex items-center gap-4 p-3 md:p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <res.icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                      </div>
                      <p className="text-xs md:text-sm font-black text-slate-200 truncate">{res.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base md:text-lg font-black text-white">Progreso</h3>
                </div>
                <div className="w-full h-2 md:h-3 bg-slate-950 rounded-full overflow-hidden mb-3">
                  <div className="w-1/3 h-full bg-gradient-to-r from-indigo-600 to-violet-600" />
                </div>
                <div className="flex justify-between text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Semana 12/36</span>
                  <span className="text-indigo-400">33%</span>
                </div>
              </div>
            </div>
          </div>
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
