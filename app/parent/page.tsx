"use client";

import { useState } from "react";
import { 
  Search, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  Heart,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ParentLoginPage() {
  const [subjectCode, setSubjectCode] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parent/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectCode, studentEmail })
      });

      if (res.ok) {
        const data = await res.json();
        // Store in session storage to pass to dashboard
        sessionStorage.setItem("parent_query_data", JSON.stringify(data));
        router.push("/parent/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "No se encontró información con estos datos.");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/40">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-3">Portal para Padres</h1>
          <p className="text-slate-400 text-sm font-medium">Consulta el progreso de tu hijo de forma segura.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Código de Materia</label>
              <input 
                type="text" 
                required
                placeholder="Ej: AB1234"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email del Alumno</label>
              <input 
                type="email" 
                required
                placeholder="alumno@ejemplo.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl text-center font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Consultar Progreso
            </button>
          </form>
        </motion.div>

        <div className="mt-12 flex items-center justify-center gap-8 text-slate-600">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Seguro</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Instantáneo</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Educativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
