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
  Loader2
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
      // First get the student's info and subjectId
      const meRes = await fetch("/api/students/me");
      if (!meRes.ok) throw new Error("Failed to fetch student info");
      
      const studentInfo = await meRes.json();
      if (!studentInfo.subjectId) {
        setLoading(false);
        return;
      }

      // Then fetch assignments with the subjectId
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
      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role="student" />
      
      <main className="flex-1 ml-64">
        <TopBar role="student" />
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-1">Mis Trabajos Prácticos</h1>
              <p className="text-slate-400">Gestiona tus entregas y revisa tus notas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="px-6 py-20 text-center glass-card rounded-3xl">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Cargando tus trabajos...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="px-6 py-20 text-center glass-card rounded-3xl">
                <p className="text-slate-400">No tienes trabajos asignados.</p>
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
                      "glass-card rounded-3xl p-6 border-l-4",
                      as.status === 'pending' ? 'border-l-amber-500' : 
                      as.status === 'submitted' ? 'border-l-indigo-500' : 'border-l-emerald-500'
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center",
                          as.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                          as.status === 'submitted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                        )}>
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{as.title}</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400 font-medium">{as.subject}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Vence: {as.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {as.status === 'pending' && (
                          <button 
                            onClick={() => handleUpload(as._id)}
                            disabled={uploading === as._id}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                          >
                            {uploading === as._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" /> Entregar Trabajo
                              </>
                            )}
                          </button>
                        )}

                        {as.status === 'submitted' && (
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Enviado</p>
                              <p className="text-sm font-semibold text-slate-300">{new Date(as.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Entregado
                            </div>
                          </div>
                        )}

                        {as.status === 'graded' && (
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Nota Final</p>
                              <p className="text-2xl font-black text-emerald-400">{as.grade?.toFixed(1)}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                              <Award className="w-4 h-4" /> Calificado
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
