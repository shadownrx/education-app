"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Loader2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const meRes = await fetch("/api/students/me");
      if (!meRes.ok) throw new Error("Failed to fetch student info");
      const studentInfo = await meRes.json();

      const assignRes = await fetch(`/api/assignments?subjectId=${studentInfo.subjectId}`);
      if (assignRes.ok) {
        const data = await assignRes.json();
        if (Array.isArray(data)) {
          // Only show graded assignments
          setGrades(data.filter(a => a.status === 'graded'));
        }
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const gpa = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / grades.length).toFixed(1)
    : "—";

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="student" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="student" />
        
        <div className="p-4 md:p-10 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10 relative overflow-hidden">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                  <BarChart3 className="w-3.5 h-3.5" /> Mi Rendimiento
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">Calificaciones y Feedback</h1>
                <p className="text-slate-400 text-xs md:text-sm font-medium">Sigue tu progreso académico y las observaciones de tus docentes.</p>
             </div>
             <BarChart3 className="absolute top-0 right-0 p-10 opacity-5 w-48 h-48 text-indigo-500" />
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
             <div className="p-8 rounded-[32px] bg-[#0f172a] border border-white/5 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Promedio General</p>
                  <p className="text-4xl font-black text-white tracking-tighter">{gpa}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                   <TrendingUp className="w-8 h-8" />
                </div>
             </div>
             <div className="p-8 rounded-[32px] bg-[#0f172a] border border-white/5 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Trabajos Calificados</p>
                  <p className="text-4xl font-black text-white tracking-tighter">{grades.length}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
             </div>
          </div>

          {/* Grades List */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
              </div>
            ) : grades.length === 0 ? (
              <div className="py-20 text-center bg-[#0f172a] rounded-[32px] border border-white/5">
                 <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500 italic">Aún no tienes trabajos calificados.</p>
              </div>
            ) : (
              grades.map((grade, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 md:p-8 rounded-[32px] bg-[#0f172a] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 font-black text-xs">
                         TP
                      </div>
                      <div>
                         <h4 className="font-bold text-white text-lg tracking-tight mb-1">{grade.title}</h4>
                         <p className="text-xs text-slate-500 font-medium">Calificado el: {grade.updatedAt ? new Date(grade.updatedAt).toLocaleDateString() : "-"}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nota</p>
                         <p className={cn(
                           "text-3xl font-black tracking-tighter",
                           grade.grade >= 7 ? "text-emerald-400" : grade.grade >= 4 ? "text-amber-400" : "text-red-400"
                         )}>{grade.grade.toFixed(1)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-700 hidden md:block" />
                   </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
