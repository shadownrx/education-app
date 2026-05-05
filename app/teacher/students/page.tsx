"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Clock,
  UserPlus,
  Download,
  Loader2,
  School,
  Copy,
  Hash,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Mail,
  User,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchSubjectAndStudents();
  }, []);

  const fetchSubjectAndStudents = async () => {
    try {
      const subjectRes = await fetch("/api/subjects/active");
      if (!subjectRes.ok) {
        setLoading(false);
        return;
      }

      const subjectData = await subjectRes.json();
      setActiveSubject(subjectData);

      const studentsRes = await fetch(`/api/students?subjectId=${subjectData._id}`);
      const studentsData = await studentsRes.json();
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentStatusForDate = (student: any, dateStr: string) => {
    if (!student.attendanceHistory) return "pending";
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    const entry = student.attendanceHistory.find((h: any) => {
      const hDate = new Date(h.date);
      hDate.setHours(0, 0, 0, 0);
      return hDate.getTime() === targetDate.getTime();
    });
    
    return entry ? entry.status : "pending";
  };

  const updateStatus = async (id: string, status: string) => {
    setStudents(students.map((s) => {
      if (s._id === id) {
        const history = [...(s.attendanceHistory || [])];
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const idx = history.findIndex(h => {
          const hDate = new Date(h.date);
          hDate.setHours(0, 0, 0, 0);
          return hDate.getTime() === targetDate.getTime();
        });
        
        if (idx > -1) history[idx].status = status;
        else history.push({ date: targetDate, status });
        
        return { ...s, attendanceHistory: history };
      }
      return s;
    }));

    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, date: selectedDate }),
      });
      toast(`Asistencia actualizada`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      fetchSubjectAndStudents();
    }
  };

  const copyCode = () => {
    if (!activeSubject?.code) return;
    navigator.clipboard.writeText(activeSubject.code);
    setCopied(true);
    toast("Código copiado", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "present": return "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30";
      case "absent":  return "bg-red-500/20 text-red-400 ring-1 ring-red-500/30";
      case "late":    return "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30";
      default:        return "bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present": return "Presente";
      case "absent":  return "Ausente";
      case "late":    return "Tarde";
      default:        return "Pendiente";
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount  = students.filter((s) => getStudentStatusForDate(s, selectedDate) === "present").length;
  const absentCount   = students.filter((s) => getStudentStatusForDate(s, selectedDate) === "absent").length;
  
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />

      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header Card */}
          <header className="mb-6 md:mb-12 p-6 md:p-10 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-slate-900 to-[#0f172a] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 md:mb-6">
                  <Users className="w-3 h-3" /> Gestión de Alumnos
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">Mi Listado de Clase</h1>
                {activeSubject && (
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-slate-400">
                    <span className="flex items-center gap-2 font-bold text-indigo-400 text-sm md:text-base">
                      <School className="w-4 h-4" /> {activeSubject.name}
                    </span>
                    <span className="hidden md:inline text-slate-700">|</span>
                    <span className="text-xs md:text-sm font-medium">{activeSubject.institution}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row md:items-end gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/40 border border-white/5 flex-1 sm:flex-none">
                   <div className="px-4 py-2 text-right flex-1 sm:flex-none">
                     <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Código</p>
                     <p className="text-sm md:text-lg font-black text-white tracking-widest font-mono uppercase">{activeSubject?.code || "---"}</p>
                   </div>
                   <button 
                    onClick={copyCode}
                    className="p-3 md:p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg"
                   >
                     {copied ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                   </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                     <Download className="w-4 h-4" /> <span className="sm:hidden lg:inline">Exportar</span>
                   </button>
                   <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                     <UserPlus className="w-4 h-4" /> <span className="sm:hidden lg:inline">Nuevo</span>
                   </button>
                </div>
              </div>
            </div>
          </header>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-10">
            <div className="md:col-span-1 lg:col-span-2 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500 transition-colors" />
              <input
                type="text"
                placeholder="Busca alumnos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/5 rounded-[20px] md:rounded-[24px] py-3 md:py-4 pl-12 md:pl-14 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all shadow-lg"
              />
            </div>
            
            <div className="relative group">
              <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/5 rounded-[20px] md:rounded-[24px] py-3 md:py-4 pl-12 md:pl-14 pr-6 text-sm text-slate-300 focus:outline-none appearance-none shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-[20px] md:rounded-[24px] bg-[#0f172a] border border-white/5 shadow-lg">
              <div className="flex-1 text-center py-2 border-r border-white/5">
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Presentes</p>
                <p className="text-lg md:text-xl font-black text-emerald-400">{presentCount}</p>
              </div>
              <div className="flex-1 text-center py-2">
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Ausentes</p>
                <p className="text-lg md:text-xl font-black text-red-400">{absentCount}</p>
              </div>
            </div>
          </div>

          {/* Students Table/Grid */}
          <div className="bg-[#0f172a] rounded-[24px] md:rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-5 md:p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="font-black text-lg md:text-xl text-white tracking-tight">Registro</h3>
              <div className="px-3 py-1.5 rounded-lg md:rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                {formattedDate}
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-white/5">
                    <th className="px-6 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Alumno</th>
                    <th className="px-6 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hidden sm:table-cell">Contacto</th>
                    <th className="px-6 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Estado</th>
                    <th className="px-6 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Marcación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 md:py-32 text-center">
                          <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 text-center text-slate-500 font-medium">No hay alumnos.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, i) => {
                        const currentStatus = getStudentStatusForDate(student, selectedDate);
                        return (
                          <motion.tr
                            key={student._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group hover:bg-white/[0.01] transition-colors cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <td className="px-6 md:px-10 py-4 md:py-6">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-indigo-400 text-sm md:text-lg">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-100 text-sm md:text-base group-hover:text-indigo-400 transition-colors">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 md:px-10 py-4 md:py-6 hidden sm:table-cell">
                              <span className="text-xs md:text-sm font-medium text-slate-500">{student.email || "Sin email"}</span>
                            </td>
                            <td className="px-6 md:px-10 py-4 md:py-6">
                              <div className="flex justify-center">
                                <span className={cn(
                                  "px-3 md:px-4 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                                  getStatusStyle(currentStatus)
                                )}>
                                  {getStatusLabel(currentStatus)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 md:px-10 py-4 md:py-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2 md:gap-3">
                                {[
                                  { s: "present", icon: Check, color: "hover:bg-emerald-500/20 hover:text-emerald-400", active: "bg-emerald-500 text-white" },
                                  { s: "absent", icon: X, color: "hover:bg-red-500/20 hover:text-red-400", active: "bg-red-500 text-white" },
                                ].map((btn) => (
                                  <button
                                    key={btn.s}
                                    onClick={() => updateStatus(student._id, btn.s)}
                                    className={cn(
                                      "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all",
                                      currentStatus === btn.s ? btn.active : "bg-slate-900/50 text-slate-600 " + btn.color
                                    )}
                                  >
                                    <btn.icon className="w-4 h-4 md:w-5 md:h-5" />
                                  </button>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-[#0f172a] rounded-[32px] md:rounded-[48px] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] border border-white/10 shadow-2xl"
            >
              <div className="w-full md:w-72 bg-slate-950/40 p-6 md:p-10 border-b md:border-r md:border-b-0 border-white/5 flex flex-col shrink-0">
                <button onClick={() => setSelectedStudent(null)} className="mb-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500"><ChevronLeft /></button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white mb-4">{selectedStudent.name.charAt(0).toUpperCase()}</div>
                  <h3 className="text-xl md:text-2xl font-black text-white">{selectedStudent.name}</h3>
                </div>
              </div>
              <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
                <h4 className="text-lg md:text-xl font-black text-white mb-6">Actividad Reciente</h4>
                <div className="space-y-4">
                  {selectedStudent.attendanceHistory?.slice().reverse().map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg", getStatusStyle(h.status))}>{h.status === 'present' ? <Check size={16}/> : <X size={16}/>}</div>
                        <div>
                          <p className="font-bold text-white text-sm capitalize">{getStatusLabel(h.status)}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
