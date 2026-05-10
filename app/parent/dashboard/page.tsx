"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const savedData = sessionStorage.getItem("parent_query_data");
    if (!savedData) {
      router.push("/parent");
      return;
    }
    setData(JSON.parse(savedData));
  }, [router]);

  if (!data) return null;

  const { student, subject, assignments } = data;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">Progreso de {student.name}</h1>
              <p className="text-slate-400 font-medium">
                {subject.name} · {subject.institution}
              </p>
            </div>
          </div>

          <Link 
            href="/parent"
            className="w-fit flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Salir de la Consulta
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[32px] relative overflow-hidden group">
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Asistencia</span>
            </div>
            <div className="text-5xl font-black mb-2">{student.attendancePct}%</div>
            <p className="text-xs text-slate-500 font-medium">{student.absences} inasistencias registradas.</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[32px] relative overflow-hidden group">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <Award className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Nivel Actual</span>
            </div>
            <div className="text-5xl font-black mb-2">Nivel {student.level_real}</div>
            <p className="text-xs text-slate-500 font-medium">{student.xp} puntos de experiencia acumulados.</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[32px] relative overflow-hidden group">
            <div className="flex items-center gap-3 text-indigo-400 mb-4">
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Desempeño</span>
            </div>
            <div className="text-5xl font-black mb-2">
              {assignments.filter((a: any) => a.grade).length > 0 
                ? (assignments.reduce((acc: any, a: any) => acc + (a.grade || 0), 0) / assignments.filter((a: any) => a.grade).length).toFixed(1)
                : "—"}
            </div>
            <p className="text-xs text-slate-500 font-medium">Promedio en trabajos prácticos.</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>

        {/* Content Tabs (Simple List for now) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div className="bg-[#0f172a] border border-white/5 rounded-[40px] p-8 md:p-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Trabajos Recientes
            </h3>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <p className="text-slate-600 italic text-sm">No hay trabajos registrados aún.</p>
              ) : (
                assignments.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5">
                    <div className="overflow-hidden pr-4">
                      <h4 className="font-bold text-sm truncate mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Clock className="w-3 h-3" />
                        {item.status === "graded" ? "Calificado" : "Pendiente"}
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg",
                      item.grade >= 7 ? "bg-emerald-500/10 text-emerald-400" : 
                      item.grade >= 4 ? "bg-amber-500/10 text-amber-400" : 
                      item.grade ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-500"
                    )}>
                      {item.grade || "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements/Badges */}
          <div className="bg-[#0f172a] border border-white/5 rounded-[40px] p-8 md:p-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              Logros Alcanzados
            </h3>
            {student.badges.length === 0 ? (
              <div className="py-12 text-center opacity-40">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <p className="text-sm">Aún no ha ganado insignias.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {student.badges.map((badge: any, i: number) => (
                  <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 text-center group hover:scale-105 transition-all">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {badge.icon || "🏆"}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white mb-1">{badge.name}</span>
                    <span className="text-[9px] font-bold text-slate-600">Obtenido el {new Date(badge.awardedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Esta es una vista informativa. Si tienes dudas, por favor contacta al docente de la materia.
          </p>
        </div>
      </div>
    </div>
  );
}
