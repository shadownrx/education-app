"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  TrendingUp,
  Clock,
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
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [activeSubject, setActiveSubject] = useState<any>(null);
  
  // Referral State
  const [copied, setCopied] = useState(false);
  const referralLink = "https://eduflow.app/invite/prof-" + (userName ? userName.toLowerCase().replace(/\s/g, '-') : "docente");

  useEffect(() => {
    fetchDashboardData();
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUserName(data.user.name);
      })
      .catch(console.error);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) {
        setLoading(false);
        return;
      }

      const subject = await subjectRes.json();
      setActiveSubject(subject);
      const subjectId = subject._id;

      const [studentsRes, assignmentsRes, lessonsRes] = await Promise.all([
        fetch(`/api/students?subjectId=${subjectId}`),
        fetch(`/api/assignments?subjectId=${subjectId}`),
        fetch(`/api/lessons?subjectId=${subjectId}`)
      ]);

      const students = await studentsRes.json();
      const assignments = await assignmentsRes.json();
      const lessons = await lessonsRes.json();

      const studentsArray = Array.isArray(students) ? students : [];
      const assignmentsArray = Array.isArray(assignments) ? assignments : [];
      const lessonsArray = Array.isArray(lessons) ? lessons : [];

      const attendanceToday = studentsArray.filter((s: any) => s.status === "present").length;
      const attendancePercent = studentsArray.length > 0 ? Math.round((attendanceToday / studentsArray.length) * 100) : 0;
      const pendingTPs = assignmentsArray.filter((a: any) => a.status === "submitted" || a.status === "pending").length;

      setStats([
        { name: "Alumnos", value: studentsArray.length.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", label: "Registrados" },
        { name: "Asistencia", value: `${attendancePercent}%`, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Promedio hoy" },
        { name: "Tareas", value: pendingTPs.toString(), icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-400/10", label: "Por corregir" },
        { name: "Plan Anual", value: "65%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", label: "Completado" },
      ]);

      setSchedule(lessonsArray.slice(0, 4).map((l: any) => ({
        time: "08:00 AM",
        title: l.title,
        status: l.status === 'completed' ? 'finished' : l.status === 'current' ? 'ongoing' : 'upcoming'
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast("¡Link copiado! Comparte EduFlow con otros colegas.", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <header className="mb-8 md:mb-12 relative overflow-hidden p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border border-white/10 shadow-2xl shadow-indigo-600/20">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white mb-6">
                <Sparkles className="w-3 h-3" /> Dashboard Actualizado
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">¡Hola de nuevo, {userName.split(' ')[0] || "Profe"}!</h1>
              <p className="text-indigo-100/80 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Tu aula inteligente está lista. Tienes <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">{stats[2]?.value || 0} tareas pendientes</span> de revisión para hoy.
              </p>
            </div>
            
            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-[32px] border border-white/5">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando el aula...</p>
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
                    transition={{ delay: i * 0.1 }}
                    className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400">{stat.name}</p>
                      </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                {/* Classes & Schedule */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  <div className="p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-[#0f172a] border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-1">Tu Agenda</h3>
                        <p className="text-xs md:text-sm text-slate-500 font-medium">Próximos temas según el plan de clases</p>
                      </div>
                      <Link href="/teacher/lesson-plan" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-[10px] md:text-xs font-bold text-slate-400 hover:text-white hover:bg-indigo-600 transition-all w-fit">
                        Plan Completo <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {schedule.length === 0 ? (
                        <div className="py-16 md:py-20 text-center rounded-[24px] md:rounded-[32px] bg-slate-950/30 border border-dashed border-white/10">
                          <p className="text-slate-500 italic text-sm">No hay clases programadas.</p>
                        </div>
                      ) : (
                        schedule.map((item, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 md:p-5 rounded-[20px] md:rounded-[24px] bg-slate-950/30 border border-white/5 hover:border-indigo-500/20 transition-all group">
                            <div className="w-fit sm:w-20 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">{item.time}</div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-bold text-slate-200 text-sm md:text-base truncate group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                              <p className="text-[10px] md:text-xs text-slate-500 font-medium">{activeSubject?.name || "Clase"}</p>
                            </div>
                            <div className={cn(
                              "w-fit px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                              item.status === 'finished' ? 'bg-slate-800 text-slate-500' : 
                              item.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 animate-pulse' : 
                              'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20'
                            )}>
                              {item.status === 'finished' ? 'Finalizada' : item.status === 'ongoing' ? 'En Vivo' : 'Pendiente'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Referral Link Card */}
                  <div className="p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-indigo-600/20 via-[#0f172a] to-[#0f172a] border border-indigo-500/20 relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                              <Gift className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-xl md:text-2xl font-black text-white">Programa de Colegas</h3>
                              <p className="text-xs md:text-sm text-slate-400 font-medium">Invita a otros docentes y obtén beneficios Premium</p>
                           </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/40 border border-white/5 p-2 rounded-2xl">
                           <div className="px-4 py-2 flex-1 text-center sm:text-left overflow-hidden">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Tu Link Personal</p>
                              <p className="text-xs font-bold text-indigo-400 truncate">{referralLink}</p>
                           </div>
                           <button 
                            onClick={copyReferral}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg"
                           >
                              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                              {copied ? "Copiado" : "Compartir"}
                           </button>
                        </div>
                     </div>
                     <LinkIcon className="absolute -bottom-10 -right-10 w-48 h-48 text-indigo-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  </div>
                </div>

                {/* Notifications / Right Column */}
                <div className="space-y-6 md:space-y-8">
                  <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                      </div>
                      <h3 className="text-base md:text-lg font-black text-white">Alertas</h3>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-slate-950/50 border border-white/5">
                        <h4 className="text-xs md:text-sm font-bold text-amber-500 mb-1">Corrección Pendiente</h4>
                        <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">
                          Tienes {stats[2]?.value || 0} trabajos que aún no han sido calificados.
                        </p>
                      </div>
                    </div>
                    <Link href="/teacher/assignments" className="w-full mt-6 flex items-center justify-center py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      Ir a Corregir
                    </Link>
                  </div>
                  
                  {/* Quick Tip / AI Promo */}
                  <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-indigo-600/10 border border-indigo-500/10 relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-[10px] md:text-sm font-black text-indigo-400 mb-2 uppercase tracking-widest">Tip de EduAI</h4>
                      <p className="text-[10px] md:text-xs text-slate-300 leading-relaxed italic">
                        "Puedes pedirme que cree un TP completo solo dándome el tema."
                      </p>
                    </div>
                    <Bot className="absolute -bottom-4 -right-4 w-16 md:w-24 h-16 md:h-24 text-indigo-500/20 rotate-12" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
