"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Download, 
  Search, 
  MoreVertical,
  ChevronRight,
  Loader2,
  Award,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GradesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) throw new Error("No active subject");
      const subjectData = await subjectRes.json();
      setActiveSubject(subjectData);

      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/students?subjectId=${subjectData._id}`),
        fetch(`/api/assignments?subjectId=${subjectData._id}`)
      ]);

      const studentsData = await studentsRes.json();
      const assignmentsData = await assignmentsRes.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentGrade = (studentName: string, assignmentTitle: string) => {
    // In a real app, we would search by studentId and assignmentId
    // For now, let's simulate or look in the assignments data if it has student info
    const assignment = assignments.find(a => 
      a.title === assignmentTitle && 
      (a.student === studentName || a.student === 'Todos')
    );
    return assignment?.grade || null;
  };

  const calculateAverage = (studentName: string) => {
    const grades = assignments
      .map(a => getStudentGrade(studentName, a.title))
      .filter(g => g !== null) as number[];
    
    if (grades.length === 0) return 0;
    return grades.reduce((a, b) => a + b, 0) / grades.length;
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10 relative overflow-hidden">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                  <BarChart3 className="w-3.5 h-3.5" /> Libro de Calificaciones
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">Rendimiento Académico</h1>
                <p className="text-slate-400 text-xs md:text-sm font-medium">
                  {activeSubject ? `${activeSubject.name} • ${activeSubject.institution}` : "Cargando materia..."}
                </p>
             </div>
             
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <BarChart3 className="w-48 h-48 text-indigo-500" />
             </div>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             {[
               { label: "Promedio General", value: "8.4", icon: TrendingUp, color: "text-emerald-400" },
               { label: "Alumnos en Riesgo", value: "3", icon: AlertCircle, color: "text-amber-400" },
               { label: "TPs Finalizados", value: assignments.length.toString(), icon: CheckCircle2, color: "text-indigo-400" },
             ].map((s, i) => (
               <div key={i} className="p-6 rounded-[24px] bg-[#0f172a] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
               </div>
             ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar alumno..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
             </div>
             <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all">
                <Filter className="w-4 h-4" /> Filtros
             </button>
             <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                <Download className="w-4 h-4" /> Exportar Planilla
             </button>
          </div>

          {/* Grades Table */}
          <div className="bg-[#0f172a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 sticky left-0 bg-[#0f172a] z-10">Alumno</th>
                    {assignments.map((as, i) => (
                      <th key={i} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center min-w-[120px]">
                        <div className="truncate max-w-[100px] mx-auto" title={as.title}>{as.title}</div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center sticky right-0 bg-[#0f172a] z-10">Promedio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={assignments.length + 2} className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={assignments.length + 2} className="py-20 text-center text-slate-500">No hay alumnos registrados.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, i) => {
                      const avg = calculateAverage(student.name);
                      return (
                        <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5 sticky left-0 bg-[#0f172a] z-10 group-hover:bg-[#1a2235]">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-xs text-indigo-400">
                                   {student.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-200 text-sm truncate">{student.name}</span>
                             </div>
                          </td>
                          {assignments.map((as, j) => {
                            const grade = getStudentGrade(student.name, as.title);
                            return (
                              <td key={j} className="px-6 py-5 text-center">
                                 {grade !== null ? (
                                   <span className={cn(
                                     "font-black text-sm",
                                     grade >= 7 ? "text-emerald-400" : grade >= 4 ? "text-amber-400" : "text-red-400"
                                   )}>
                                     {grade.toFixed(1)}
                                   </span>
                                 ) : (
                                   <span className="text-slate-700 text-xs">-</span>
                                 )}
                              </td>
                            );
                          })}
                          <td className="px-8 py-5 text-center sticky right-0 bg-[#0f172a] z-10 group-hover:bg-[#1a2235]">
                             <div className={cn(
                               "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm",
                               avg >= 7 ? "bg-emerald-500/10 text-emerald-400" : avg >= 4 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                             )}>
                               {avg > 0 ? avg.toFixed(1) : "-"}
                             </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="mt-10 p-8 rounded-[32px] bg-[#0f172a] border border-white/5">
             <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-400" /> Observaciones del Curso
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[24px] bg-slate-950/50 border border-white/5">
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Puntos Fuertes</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Gran participación en los TPs de lógica. La mayoría del curso ha superado el promedio esperado en la primera etapa."
                   </p>
                </div>
                <div className="p-6 rounded-[24px] bg-slate-950/50 border border-white/5">
                   <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Áreas a Reforzar</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Se observa una caída en las notas del TP de SQL. Se recomienda una clase de repaso antes del examen final."
                   </p>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
