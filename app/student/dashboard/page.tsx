"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import {
  BookOpen,
  ClipboardList,
  Award,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LogOut,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StudentInfo {
  name: string;
  subjectCount: number;
  absences: number;
}

interface AssignmentStat {
  submitted: number;
  total: number;
  avg: string;
  pending: any[];
  graded: any[];
}

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assignmentStat, setAssignmentStat] = useState<AssignmentStat | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const meRes = await fetch("/api/students/me");
      
      let subjectId = null;

      if (meRes.ok) {
        const me = await meRes.json();
        setStudentInfo({
          name: me.name,
          subjectCount: 1, 
          absences: me.absences,
        });
        subjectId = me.subjectId;
      }

      if (!subjectId) {
        setLoading(false);
        return;
      }

      const assignRes = await fetch(`/api/assignments?subjectId=${subjectId}`);

      if (assignRes.ok) {
        const data = await assignRes.json();
        if (Array.isArray(data)) {
          const pending = data.filter((a) => a.status === "pending");
          const submitted = data.filter(
            (a) => a.status === "submitted" || a.status === "graded"
          ).length;
          const graded = data.filter((a) => a.status === "graded");
          const avg =
            graded.length > 0
              ? (
                  graded.reduce((acc, curr) => acc + (curr.grade || 0), 0) /
                  graded.length
                ).toFixed(1)
              : "—";

          setAssignmentStat({
            submitted,
            total: data.length,
            avg,
            pending: pending.slice(0, 2),
            graded: graded.slice(0, 3),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const stats = studentInfo && assignmentStat
    ? [
        { name: "Materia", value: "Activa", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
        { name: "Mi Promedio", value: assignmentStat.avg, icon: Award, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { name: "Entregas", value: `${assignmentStat.submitted}/${assignmentStat.total}`, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-400/10" },
        { name: "Inasistencias", value: studentInfo.absences.toString(), icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="student" />

      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="student" />

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header Card */}
          <header className="mb-8 md:mb-12 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white mb-4 md:mb-6">
                    <Sparkles className="w-3 h-3" /> Panel del Estudiante
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">
                    {loading ? "Cargando..." : studentInfo ? `¡Hola, ${studentInfo.name.split(" ")[0]}! 👋` : "¡Bienvenido!"}
                  </h1>
                  <p className="text-indigo-100/80 text-xs md:text-sm font-medium">Revisa tus tareas y mantente al día con tus calificaciones.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-fit flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-indigo-600 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Salir de Sesión
                </button>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[32px] border border-white/5">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sincronizando tus notas...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                      </div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.name}</p>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Pending Assignments */}
                <div className="lg:col-span-2 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl md:text-2xl font-black text-white">Próximas Entregas</h3>
                    <Link href="/student/assignments" className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                      Ver todo <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {!assignmentStat || assignmentStat.pending.length === 0 ? (
                      <div className="py-16 text-center bg-slate-950/30 rounded-[24px] border border-dashed border-white/10">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">¡Estás al día con tus tareas!</p>
                      </div>
                    ) : (
                      assignmentStat.pending.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-[20px] md:rounded-[24px] bg-slate-950/30 border border-white/5 hover:border-indigo-500/20 transition-all group">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-slate-200 text-sm md:text-base truncate group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Vence: {item.deadline ? new Date(item.deadline).toLocaleDateString() : "Sin fecha"}</p>
                          </div>
                          <Link href="/student/assignments" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                            Subir
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Grades */}
                <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                     <TrendingUp className="w-5 h-5 text-emerald-400" />
                     <h3 className="text-xl font-black text-white">Notas Recientes</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {!assignmentStat || assignmentStat.graded.length === 0 ? (
                      <div className="py-12 text-center opacity-30 italic text-sm text-slate-500">
                        Aún no hay calificaciones.
                      </div>
                    ) : (
                      assignmentStat.graded.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="overflow-hidden pr-2">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                               <Clock className="w-3 h-3" />
                               <span className="text-[9px] font-bold uppercase tracking-widest">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Hoy"}</span>
                            </div>
                          </div>
                          <div className="text-lg font-black text-emerald-400 shrink-0">
                            {typeof item.grade === "number" ? item.grade.toFixed(1) : item.grade}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button className="w-full mt-10 py-4 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    Ver Boletín Completo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
