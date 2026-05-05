"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  GraduationCap, 
  ArrowRight, 
  School, 
  BookOpen, 
  Loader2,
  X,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubjectSelection() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", institution: "" });
  const [copying, setCopying] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });
      if (res.ok) {
        // Full page reload to ensure the middleware picks up the new cookie
        window.location.href = "/teacher/dashboard";
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}\nDetalles: ${data.details || 'No especificados'}`);
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const selectSubject = (id: string) => {
    // Store in cookie or localStorage for the session
    document.cookie = `active_subject_id=${id}; path=/; max-age=86400`;
    router.push("/teacher/dashboard");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopying(code);
    setTimeout(() => setCopying(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EduFlow</h1>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" /> Nueva Materia
          </button>
        </header>

        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Mis Materias</h2>
          <p className="text-slate-400 text-lg">Selecciona un aula para comenzar a gestionar</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400">Cargando tus aulas...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass-card rounded-[40px] p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8">
              <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Aún no tienes aulas creadas</h3>
            <p className="text-slate-400 max-w-md mb-10">
              Crea tu primera materia e institución para empezar a registrar alumnos, tomar asistencia y recibir trabajos prácticos.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-10 py-4 rounded-2xl bg-white text-black font-bold hover:bg-slate-200 transition-all"
            >
              Comenzar Ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card rounded-[32px] p-8 hover:border-indigo-500/50 transition-all flex flex-col h-full cursor-pointer"
                onClick={() => selectSubject(subject._id)}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Código de Aula</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(subject.code);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-sm font-mono font-bold text-indigo-400"
                    >
                      {copying === subject.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {subject.code}
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{subject.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <School className="w-4 h-4" />
                    {subject.institution}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">0 Alumnos</span>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:gap-4 transition-all">
                    Gestionar Aula <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-[32px] p-10"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-2">Nueva Aula</h3>
              <p className="text-slate-400 mb-8">Completa los datos para crear tu materia</p>

              <form onSubmit={handleCreateSubject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Nombre de la Materia</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Programación Fullstack"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">Institución</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Instituto Tecnológico Superior"
                    value={newSubject.institution}
                    onChange={(e) => setNewSubject({...newSubject, institution: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-5 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Aula"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
