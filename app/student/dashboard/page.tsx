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
  Sparkles,
  TrendingUp,
  Clock,
  LogOut,
  Star,
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
  xp: number; 
  level: number; 
  badges: any[]; 
}
interface AssignmentStat { submitted: number; total: number; avg: string; pending: any[]; graded: any[]; }

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-white/5", className)} />
);

const StatSkeleton = () => (
  <div className="p-6 rounded-[24px] bg-[#0f172a] border border-white/5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="w-11 h-11 rounded-2xl" />
      <Skeleton className="h-2.5 w-16" />
    </div>
    <Skeleton className="h-8 w-16" />
  </div>
);

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assignmentStat, setAssignmentStat] = useState<AssignmentStat | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const meRes = await fetch("/api/students/me");
      let subjectId: string | null = null;

      if (meRes.ok) {
        const me = await meRes.json();
        setStudentInfo({ 
          name: me.name, 
          subjectCount: 1, 
          absences: me.absences,
          xp: me.xp,
          level: me.level,
          badges: me.badges
        });
        subjectId = me.subjectId;
      }

      if (!subjectId) { setLoading(false); return; }

      const assignRes = await fetch(`/api/assignments?subjectId=${subjectId}`);
      if (assignRes.ok) {
        const data = await assignRes.json();
        if (Array.isArray(data)) {
          const pending   = data.filter((a) => a.status === "pending");
          const submitted = data.filter((a) => a.status === "submitted" || a.status === "graded").length;
          const graded    = data.filter((a) => a.status === "graded");
          const avg       = graded.length > 0
            ? (graded.reduce((acc, curr) => acc + (curr.grade || 0), 0) / graded.length).toFixed(1)
            : "—";

          setAssignmentStat({ submitted, total: data.length, avg, pending: pending.slice(0, 2), graded: graded.slice(0, 3) });
        }
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
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
        { name: "Materia",       value: "Activa",                                      icon: BookOpen,    color: "text-blue-400",    bg: "bg-blue-400/10",    glow: "hover:shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)]" },
        { name: "Mi Promedio",   value: assignmentStat.avg,                            icon: Award,       color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]" },
        { name: "Entregas",      value: `${assignmentStat.submitted}/${assignmentStat.total}`, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-400/10", glow: "hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.25)]" },
        { name: "Inasistencias", value: studentInfo.absences.toString(),               icon: AlertCircle, color: "text-amber-400",   bg: "bg-amber-400/10",   glow: "hover:shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]" },
      ]
    : [];

  const avgNum = parseFloat(assignmentStat?.avg ?? "0");
  const avgColor = avgNum >= 7 ? "text-emerald-400" : avgNum >= 4 ? "text-amber-400" : "text-red-400";

  const xpNeeded = (studentInfo?.level || 1) * 100;
  const xpProgress = ((studentInfo?.xp || 0) % xpNeeded) / xpNeeded * 100;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="student" />

      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="student" />

        <div className="p-5 md:p-10 max-w-7xl mx-auto">

          {/* ── Welcome Header ── */}
          <header className="mb-8 md:mb-12 p-7 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border border-white/10 shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white mb-5">
                  <Sparkles className="w-3 h-3" /> Panel del Estudiante
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                  {loading ? "Cargando..." : studentInfo ? (
                    <>¡Hola, <span className="text-indigo-200">{studentInfo.name.split(" ")[0]}</span>! 👋</>
                  ) : "¡Bienvenido!"}
                </h1>
                <p className="text-indigo-100/70 text-sm font-medium mb-6">
                  Revisá tus tareas y mantente al día con tus calificaciones.
                </p>

                {/* Level Progress */}
                {!loading && studentInfo && (
                  <div className="bg-black/20 backdrop-blur-sm border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-amber-500 text-black text-[10px] font-black rounded-lg">
                          NIVEL {studentInfo.level}
                        </div>
                        <span className="text-[11px] font-bold text-white/80">
                          {studentInfo.xp} / {xpNeeded} XP
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        Siguiente nivel en {xpNeeded - studentInfo.xp} XP
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-600 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {/* Badges Preview */}
                {!loading && studentInfo && studentInfo.badges.length > 0 && (
                  <div className="flex -space-x-2">
                    {studentInfo.badges.slice(0, 3).map((badge, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-[#1e293b] border-2 border-indigo-600 flex items-center justify-center text-lg shadow-xl" title={badge.name}>
                        {badge.icon || "🏆"}
                      </div>
                    ))}
                    {studentInfo.badges.length > 3 && (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                        +{studentInfo.badges.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="w-fit flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-indigo-600 transition-all active:scale-95 flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" /> Salir
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          </header>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-12">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : stats.map((stat, i) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("p-5 md:p-7 rounded-[24px] bg-[#0f172a] border border-white/5 hover:border-white/10 transition-all group cursor-default", stat.glow)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4 md:w-5 md:h-5", stat.color)} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-right">{stat.name}</p>
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                </motion.div>
              ))
            }
          </div>

          {/* ── Main content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* Pending Assignments */}
            <div className="lg:col-span-2 p-7 md:p-10 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1">Próximas Entregas</h3>
                  <p className="text-xs text-slate-500 font-medium">Tareas pendientes de envío</p>
                </div>
                <Link
                  href="/student/assignments"
                  className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Ver todo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/30">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                      <Skeleton className="w-16 h-8 rounded-xl" />
                    </div>
                  ))
                ) : !assignmentStat || assignmentStat.pending.length === 0 ? (
                  <div className="py-16 text-center bg-slate-950/30 rounded-[24px] border border-dashed border-white/8">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">¡Estás al día!</p>
                    <p className="text-slate-600 text-xs mt-1">No tenés tareas pendientes.</p>
                  </div>
                ) : (
                  assignmentStat.pending.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-slate-950/30 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-950/50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-slate-200 text-sm truncate group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.deadline ? new Date(item.deadline).toLocaleDateString("es-AR") : "Sin fecha límite"}
                        </p>
                      </div>
                      <Link
                        href="/student/assignments"
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                      >
                        Subir
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Notas Recientes</h3>
                  {assignmentStat?.avg !== "—" && (
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", avgColor)}>
                      Promedio: {assignmentStat?.avg}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/30">
                      <div className="space-y-1.5 flex-1 mr-4">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                      <Skeleton className="w-10 h-6 rounded-lg" />
                    </div>
                  ))
                ) : !assignmentStat || assignmentStat.graded.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40 italic text-sm text-slate-500 text-center">
                    <Star className="w-8 h-8 mb-3" />
                    Aún no hay calificaciones.
                  </div>
                ) : (
                  assignmentStat.graded.map((item, i) => {
                    const g = typeof item.grade === "number" ? item.grade : 0;
                    const gc = g >= 7 ? "text-emerald-400 bg-emerald-500/10" : g >= 4 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="overflow-hidden pr-3 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                          <div className="flex items-center gap-1 mt-0.5 text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">
                              {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("es-AR") : "Hoy"}
                            </span>
                          </div>
                        </div>
                        <div className={cn("text-base font-black flex-shrink-0 px-2.5 py-1 rounded-xl", gc)}>
                          {typeof item.grade === "number" ? item.grade.toFixed(1) : item.grade}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <Link
                href="/student/grades"
                className="mt-6 w-full py-3.5 rounded-2xl border border-white/5 bg-white/4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all text-center flex items-center justify-center gap-2"
              >
                Ver Boletín Completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
