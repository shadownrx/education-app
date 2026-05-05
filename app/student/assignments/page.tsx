"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Plus,
  Award,
  Loader2,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/students/me");
      if (!meRes.ok) throw new Error("Failed to fetch student info");
      
      const studentInfo = await meRes.json();
      if (!studentInfo.subjectId) {
        setLoading(false);
        return;
      }

      const assignRes = await fetch(`/api/assignments?subjectId=${studentInfo.subjectId}`);
      if (!assignRes.ok) throw new Error("Failed to fetch assignments");
      
      const data = await assignRes.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (id: string) => {
    setUploading(id);
    
    try {
      await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          status: "submitted", 
          submittedAt: new Date().toISOString() 
        }),
      });
      fetchStudentData(); // Correct function name
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="student" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="student" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10 relative overflow-hidden">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                  <ClipboardList className="w-3.5 h-3.5" /> Entregas Academicas
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">Mis Trabajos Prácticos</h1>
                <p className="text-slate-400 text-xs md:text-sm font-medium">Gestiona tus entregas y revisa el feedback de tus profesores.</p>
             </div>
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <FileText className="w-48 h-48 text-indigo-500" />
             </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="py-32 text-center bg-[#0f172a] rounded-[32px] border border-white/5">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sincronizando trabajos...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-32 text-center bg-[#0f172a] rounded-[32px] border border-white/5">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                <p className="text-slate-500 italic">No tienes trabajos asignados en esta materia.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {assignments.map((as, i) => (
                  <motion.div
                    key={as._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-6 md:p-8 rounded-[32px] bg-[#0f172a] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden",
                      as.status === 'pending' ? 'border-l-4 border-l-amber-500/50' : 
                      as.status === 'submitted' ? 'border-l-4 border-l-indigo-500/50' : 'border-l-4 border-l-emerald-500/50'
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          as.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                          as.status === 'submitted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                        )}>
                          <FileText className="w-7 h-7 md:w-8 md:h-8" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-black text-white mb-1 tracking-tight">{as.title}</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{as.subject}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                              <Clock className="w-3 h-3" /> Vence: {as.deadline || "Sin fecha"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {as.status === 'pending' && (
                          <button 
                            onClick={() => handleUpload(as._id)}
                            disabled={uploading === as._id}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                          >
                            {uploading === as._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {uploading === as._id ? "Subiendo..." : "Entregar"}
                          </button>
                        )}

                        {as.status === 'submitted' && (
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Enviado</p>
                              <p className="text-xs font-bold text-slate-300">{as.submittedAt ? new Date(as.submittedAt).toLocaleDateString() : "-"}</p>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 className="w-4 h-4" /> Entregado
                            </div>
                          </div>
                        )}

                        {as.status === 'graded' && (
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Calificación</p>
                              <p className="text-3xl font-black text-emerald-400 tracking-tighter">{as.grade?.toFixed(1)}</p>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                              <Award className="w-4 h-4" /> Finalizado
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Background decoration for group hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Dummy import to satisfy type check if ClipboardList is missing in lucide-react in this environment
import { ClipboardList } from "lucide-react";
