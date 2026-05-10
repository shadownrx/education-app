"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import {
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Bot,
  Link as LinkIcon,
  Copy,
  Check,
  Gift,
  Share2,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface SubjectSummary { _id: string; name: string; institution: string; code: string; }
interface StudentSummary  { status: "present" | "absent" | "late" | "pending"; }
interface AssignmentSummary { status: "pending" | "submitted" | "graded" | "late"; }
interface LessonSummary { title: string; week: number; status: "completed" | "current" | "upcoming"; date?: string; }

interface StatCard {
  name: string; value: string; icon: typeof Users;
  color: string; bg: string; glow: string; label: string;
}
interface ScheduleItem { time: string; title: string; status: "finished" | "ongoing" | "upcoming"; }

/* ── Skeleton pulse block ── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-white/5", className)} />
);

/* ── Stat card skeleton ── */
const StatSkeleton = () => (
  <div className="p-6 md:p-8 rounded-[28px] bg-[#0f172a] border border-white/5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-1.5 text-right">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
    <Skeleton className="h-9 w-20" />
  </div>
);

export default function TeacherDashboardClient() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [activeSubject, setActiveSubject] = useState<SubjectSummary | null>(null);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${appUrl}/invite/prof-${userName ? userName.toLowerCase().replace(/\s/g, "-") : "docente"}`;

  useEffect(() => {
    fetchDashboardData();
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setUserName(data.user.name); })
      .catch(console.error);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) { setLoading(false); return; }

      const subject = await subjectRes.json();
      setActiveSubject(subject);

      const [studentsRes, assignmentsRes, lessonsRes] = await Promise.all([
        fetch(`/api/students?subjectId=${subject._id}`),
        fetch(`/api/assignments?subjectId=${subject._id}`),
        fetch(`/api/lessons?subjectId=${subject._id}`),
      ]);

      const students    = await studentsRes.json();
      const assignments = await assignmentsRes.json();
      const lessons     = await lessonsRes.json();

      const sa = Array.isArray(students)    ? (students    as StudentSummary[])    : [];
      const aa = Array.isArray(assignments) ? (assignments as AssignmentSummary[]) : [];
      const la = Array.isArray(lessons)     ? (lessons     as LessonSummary[])     : [];

      const presentToday    = sa.filter((s) => s.status === "present").length;
      const attendancePct   = sa.length > 0 ? Math.round((presentToday / sa.length) * 100) : 0;
      const pendingTPs      = aa.filter((a) => a.status === "submitted" || a.status === "pending").length;
      const completedLessons= la.filter((l) => l.status === "completed").length;
      const planPct         = la.length > 0 ? Math.round((completedLessons / la.length) * 100) : 0;

      setStats([
        { name: "Alumnos",   value: sa.length.toString(), icon: Users,         color: "text-blue-400",    bg: "bg-blue-400/10",    glow: "hover:shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)]",    label: "Registrados" },
        { name: "Asistencia",value: `${attendancePct}%`,  icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "hover:shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]",  label: "Promedio hoy" },
        { name: "Tareas",    value: pendingTPs.toString(),icon: ClipboardList, color: "text-amber-400",   bg: "bg-amber-400/10",   glow: "hover:shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]",   label: "Por corregir" },
        { name: "Plan Anual",value: `${planPct}%`,         icon: TrendingUp,   color: "text-violet-400",  bg: "bg-violet-400/10",  glow: "hover:shadow-[0_0_24px_-4px_rgba(167,139,250,0.25)]",  label: "Completado" },
      ]);

      setSchedule(
        la.slice(0, 4).map((l) => ({
          time: l.date
            ? new Date(l.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
            : `Sem. ${l.week}`,
          title: l.title,
          status: l.status === "completed" ? "finished" : l.status === "current" ? "ongoing" : "upcoming",
        }))
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast("Link copiado. Comparte EduFlow con tus colegas.", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />

      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />

        <div className="p-6 md:p-10 max-w-7xl mx-auto">

          {/* ── Welcome Header ── */}
          <header className="mb-8 md:mb-12 relative overflow-hidden p-7 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border border-white/10 shadow-2xl shadow-indigo-900/40">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white mb-5">
                <Sparkles className="w-3 h-3" /> Dashboard Actualizado
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">
                ¡Hola de nuevo,{" "}
                <span className="text-indigo-200">
                  {loading ? "..." : userName.split(" ")[0] || "Profe"}
                </span>
                !
              </h1>
              <p className="text-indigo-100/70 text-sm md:text-base max-w-xl font-medium leading-relaxed">
                Tu aula inteligente está lista.{" "}
                <span className="text-white font-black">
                  {stats[2]?.value || 0} tareas
                </span>{" "}
                pendientes de revisión.
              </p>

              {activeSubject && (
                <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-indigo-100 hover:bg-white/15 transition-all cursor-default">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {activeSubject.name} · {activeSubject.institution}
                </div>
              )}
            </div>
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
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
                  className={cn(
                    "p-6 md:p-7 rounded-[28px] bg-[#0f172a] border border-white/5 hover:border-white/10 transition-all group cursor-default",
                    stat.glow
                  )}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{stat.label}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{stat.name}</p>
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                </motion.div>
              ))
            }
          </div>

          {/* ── Main content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* Left col: Schedule + Referral */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">

              {/* Schedule card */}
              <div className="p-7 md:p-10 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-1">Tu Agenda</h3>
                    <p className="text-xs text-slate-500 font-medium">Próximos temas según el plan de clases</p>
                  </div>
                  <Link
                    href="/teacher/lesson-plan"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"
                  >
                    Plan <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/30">
                        <Skeleton className="w-14 h-4" />
                        <Skeleton className="flex-1 h-4" />
                        <Skeleton className="w-20 h-6 rounded-xl" />
                      </div>
                    ))
                  ) : schedule.length === 0 ? (
                    <div className="py-16 text-center rounded-[24px] bg-slate-950/30 border border-dashed border-white/8">
                      <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-600 italic text-sm">No hay clases programadas.</p>
                    </div>
                  ) : (
                    schedule.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-5 p-4 md:p-5 rounded-2xl bg-slate-950/30 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-950/50 transition-all group"
                      >
                        <div className="w-14 text-[10px] font-black text-slate-600 uppercase tracking-widest shrink-0">{item.time}</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-slate-300 text-sm truncate group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                          <p className="text-[10px] text-slate-600 font-medium mt-0.5">{activeSubject?.name || "Clase"}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest flex-shrink-0",
                          item.status === "finished" ? "bg-slate-800 text-slate-500" :
                          item.status === "ongoing"  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25 animate-pulse" :
                          "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                        )}>
                          {item.status === "finished" ? "Finalizada" : item.status === "ongoing" ? "En Vivo" : "Pendiente"}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Referral card */}
              <div className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600/15 via-[#0f172a] to-[#0f172a] border border-indigo-500/15 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Programa de Colegas</h3>
                      <p className="text-xs text-slate-400 font-medium">Invita docentes y obtené beneficios Premium</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-black/30 border border-white/5 p-2 rounded-2xl">
                    <div className="px-4 py-2 flex-1 overflow-hidden">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Tu Link Personal</p>
                      <p className="text-xs font-bold text-indigo-400 truncate">{referralLink}</p>
                    </div>
                    <button
                      onClick={copyReferral}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      {copied ? "Copiado" : "Compartir"}
                    </button>
                  </div>
                </div>
                <LinkIcon className="absolute -bottom-8 -right-8 w-40 h-40 text-indigo-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              </div>
            </div>

            {/* Right col: Alerts + AI tip */}
            <div className="space-y-6 md:space-y-8">

              {/* Alerts card */}
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-black text-white">Alertas</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-xs font-black text-amber-400 mb-1">Corrección Pendiente</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Tenés{" "}
                      <span className="text-white font-black">{loading ? "..." : stats[2]?.value || 0}</span>{" "}
                      trabajos sin calificar.
                    </p>
                  </div>
                </div>
                <Link
                  href="/teacher/assignments"
                  className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 border border-white/8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/20 transition-all"
                >
                  Ir a Corregir <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* AI tip card */}
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden bg-gradient-to-br from-indigo-600/8 to-violet-600/5 border border-indigo-500/10">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tip de EduAI</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    &quot;Puedo crear un TP completo solo con que me digas el tema y el nivel del curso.&quot;
                  </p>
                </div>
                <Bot className="absolute -bottom-4 -right-4 w-20 h-20 text-indigo-500/15 rotate-12 pointer-events-none" />
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Alumnos",   href: "/teacher/students",    color: "text-blue-400",   bg: "bg-blue-500/8",   border: "border-blue-500/15",   icon: Users },
                  { label: "Notas",     href: "/teacher/grades",      color: "text-emerald-400",bg: "bg-emerald-500/8",border: "border-emerald-500/15", icon: TrendingUp },
                ].map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className={cn("p-5 rounded-2xl border flex flex-col items-start gap-3 hover:scale-105 transition-all active:scale-95", q.bg, q.border)}
                  >
                    <q.icon className={cn("w-5 h-5", q.color)} />
                    <span className={cn("text-xs font-black uppercase tracking-widest", q.color)}>{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
