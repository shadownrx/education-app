"use client";

import {
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Loader2,
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  MousePointer2,
  LayoutDashboard,
  Bot,
  Laptop,
  AlertCircle,
  Tag,
  Mail,
  Smartphone,
  Download
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setStep(1);
      setCode("");
      setStudentName("");
      setSubjectName("");
      setError("");
    }, 300);
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/class/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setSubjectName(data.subjectName);
        setStep(2);
      } else {
        setError(data.error || "Código inválido");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/class/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, studentName: studentName.trim() }),
      });

      if (res.ok) {
        window.location.href = "/student/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Error al ingresar al aula");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">EduFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8 mr-auto ml-12">
            <a href="#features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Funciones</a>
            <a href="#roles" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Accesos</a>
            <Link href="/support" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Soporte</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/teacher/login" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-4 py-2">
              Login
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl bg-white text-black hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Entrar al Aula
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-4 h-4" /> La educación del futuro, hoy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white"
          >
            Gestiona tu clase de <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">forma inteligente</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            La plataforma integral para docentes y alumnos impulsada por IA.
            Automatiza tareas, conecta con tu aula y potencia el aprendizaje.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            <Link
              href="/teacher/register"
              className="w-full sm:w-auto px-10 py-5 rounded-[24px] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/40 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Empezar Gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-10 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm transition-all active:scale-95"
            >
              Unirse como Alumno
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-6 py-12 border-y border-white/5"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Docentes de instituciones prestigiosas ya confían en nosotros</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-20 opacity-30 grayscale invert">
              <div className="text-2xl font-black tracking-tighter">UNIVERSITY</div>
              <div className="text-2xl font-black tracking-tighter">ACADEMY</div>
              <div className="text-2xl font-black tracking-tighter">SCHOOL.PRO</div>
              <div className="text-2xl font-black tracking-tighter">INSTITUTE</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 z-10 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">Todo lo que necesitas, <br /> <span className="text-indigo-500">en un solo lugar</span></h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Diseñado para ser rápido, intuitivo y 100% responsivo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Asistente EduAI", desc: "Genera TPs, planes de clase y feedback automatizado con inteligencia artificial de vanguardia.", icon: Bot, color: "text-indigo-400", bg: "bg-indigo-400/10" },
              { title: "Gestión 360°", desc: "Control total de asistencia, calificaciones y comunicación en un panel administrativo premium.", icon: LayoutDashboard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { title: "Multi-Dispositivo", desc: "Funciona perfectamente en PC, Tablets y Smartphones. Tu aula te acompaña a todos lados.", icon: Laptop, color: "text-blue-400", bg: "bg-blue-400/10" },
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[40px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 rounded-[48px] bg-gradient-to-br from-indigo-600 to-indigo-800 border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <Users className="w-12 h-12 text-white mb-8" />
                <h3 className="text-4xl font-black text-white mb-4">Soy Docente</h3>
                <p className="text-indigo-100 text-lg font-medium mb-10 max-w-md">Lidera tu aula con herramientas avanzadas de gestión y automatización.</p>
                <Link href="/teacher/login" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-indigo-600 font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                  Entrar al Panel <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 rounded-[48px] bg-[#0f172a] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <BookOpen className="w-12 h-12 text-indigo-400 mb-8" />
                <h3 className="text-4xl font-black text-white mb-4">Soy Alumno</h3>
                <p className="text-slate-400 text-lg font-medium mb-10 max-w-md">Accede a tus clases, entrega tareas y visualiza tu progreso académico.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                  Ingresar Código <MousePointer2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Access Section - Restored Buttons */}
      <section className="relative py-20 px-6 z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-10">Empieza ahora mismo</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/teacher/register"
              className="w-full sm:w-auto inline-flex items-center gap-3 px-10 py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Crear cuenta docente <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto inline-flex items-center gap-3 px-10 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95"
            >
              Ingresar como Alumno
            </button>
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section className="relative py-24 px-6 z-10 bg-indigo-600/5">
        <div className="max-w-7xl mx-auto">
          <div className="p-12 rounded-[48px] border border-indigo-500/20 bg-slate-900/50 backdrop-blur-3xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                  <Smartphone className="w-3.5 h-3.5" /> App Optimizada
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                  Lleva tu aula en <br /> el bolsillo
                </h2>
                <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed">
                  EduFlow es una **PWA (Progressive Web App)**. Puedes instalarla en tu dispositivo sin usar la App Store y acceder de forma instantánea.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Instalación Directa</p>
                      <p className="text-slate-500 text-xs">Menú del navegador → "Instalar App"</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[40px] bg-gradient-to-br from-indigo-500 to-violet-700 opacity-20 blur-3xl absolute inset-0 animate-pulse" />
                <div className="relative p-8 rounded-[40px] bg-slate-950 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/30">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">EduFlow PWA</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">Disponible para iOS y Android</p>
                  <div className="w-full h-px bg-white/5 mb-6" />
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">Sin Descargas</div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">Acceso Offline</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="relative z-10 border-t border-white/5">


        {/* Full Footer */}
        <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

              {/* Brand */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tighter text-white">EduFlow</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                  La plataforma educativa del futuro. Conecta docentes y alumnos con herramientas de IA.
                </p>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Tag className="w-3 h-3" /> v1.0.0
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                  <a
                    href="mailto:salvadorjuars4@gmail.com?subject=Donación EduFlow"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all w-fit group"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    ¿Deseas donar? Contactame
                  </a>
                </div>
              </div>

              {/* Plataforma */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Plataforma</h4>
                <nav className="flex flex-col gap-3">
                  <a href="#features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-indigo-400 transition-all duration-300" />
                    Funciones
                  </a>
                  <a href="#roles" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-indigo-400 transition-all duration-300" />
                    Accesos
                  </a>
                  <Link href="/teacher/register" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-indigo-400 transition-all duration-300" />
                    Registro Docente
                  </Link>
                  <Link href="/teacher/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-indigo-400 transition-all duration-300" />
                    Login Docente
                  </Link>
                </nav>
              </div>

              {/* Alumnos */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Alumnos</h4>
                <nav className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-left text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-violet-400 transition-all duration-300" />
                    Ingresar al Aula
                  </button>
                  <Link href="/student/dashboard" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-violet-400 transition-all duration-300" />
                    Mi Dashboard
                  </Link>
                  <Link href="/support" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-violet-400 transition-all duration-300" />
                    Ayuda y Soporte
                  </Link>
                </nav>
              </div>

              {/* Legal & Soporte */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Información</h4>
                <nav className="flex flex-col gap-3">
                  <Link href="/support" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-blue-400 transition-all duration-300" />
                    Soporte Técnico
                  </Link>
                  <Link href="/support#faq" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-blue-400 transition-all duration-300" />
                    Preguntas Frecuentes
                  </Link>
                  <a href="mailto:salvadorjuars4@gmail.com" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-blue-400 transition-all duration-300" />
                    salvadorjuars4@gmail.com
                  </a>
                </nav>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <p className="text-slate-600 text-[11px] font-bold uppercase tracking-[0.3em]">
                  © 2026 EduFlow System — Tucumán, Argentina
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Datos seguros</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">IA potenciada</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </section>

      {/* Student Code Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[48px] p-10 md:p-12 overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)]"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[60px] rounded-full" />

              {/* Close */}
              <button
                onClick={handleCloseModal}
                className="absolute top-8 right-8 p-2.5 rounded-2xl hover:bg-white/5 text-slate-500 hover:text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500",
                    step >= 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" : "bg-white/5 text-slate-600"
                  )}>
                    {step > 1 ? <Check className="w-5 h-5" /> : "01"}
                  </div>
                  {step === 1 && <div className="absolute -inset-1 bg-indigo-500/20 blur-md rounded-2xl animate-pulse" />}
                </div>

                <div className="w-12 h-[2px] rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: step > 1 ? "0%" : "-100%" }}
                    className="w-full h-full bg-indigo-500"
                  />
                </div>

                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500",
                    step >= 2 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" : "bg-white/5 text-slate-600"
                  )}>
                    02
                  </div>
                  {step === 2 && <div className="absolute -inset-1 bg-indigo-500/20 blur-md rounded-2xl animate-pulse" />}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  >
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 rounded-[28px] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner relative group">
                        <BookOpen className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Ingresar al Aula</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Pide el código a tu profesor</p>
                    </div>

                    <form onSubmit={handleValidateCode} className="space-y-6">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" /> {error}
                        </motion.div>
                      )}

                      <div className="relative group">
                        <input
                          id="student-code-input"
                          type="text"
                          required
                          autoFocus
                          placeholder="CÓDIGO"
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          maxLength={10}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-6 text-3xl font-black tracking-[0.4em] text-center text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all placeholder:text-slate-900 placeholder:tracking-normal placeholder:font-black"
                        />
                        <div className="absolute inset-0 rounded-3xl border border-indigo-500/0 group-focus-within:border-indigo-500/20 transition-all pointer-events-none" />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || code.trim().length < 4}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-[0.2em] group active:scale-95"
                      >
                        {loading
                          ? <Loader2 className="w-5 h-5 animate-spin" />
                          : <><span>Validar Código</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        }
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  >
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Check className="w-10 h-10 text-emerald-400" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-4">
                        Aula encontrada ✓
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{subjectName}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Identifícate para entrar</p>
                    </div>

                    <form onSubmit={handleEnterClassroom} className="space-y-6">
                      {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                          {error}
                        </div>
                      )}

                      <div className="relative group">
                        <input
                          id="student-name-input"
                          type="text"
                          required
                          autoFocus
                          placeholder="Nombre y Apellido"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-6 text-center text-lg font-black text-white focus:outline-none focus:border-emerald-500/50 focus:bg-slate-950 transition-all placeholder:text-slate-800"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || studentName.trim().length < 2}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-[0.2em] group active:scale-95"
                      >
                        {loading
                          ? <Loader2 className="w-5 h-5 animate-spin" />
                          : <><span>Ingresar al Aula</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        }
                      </button>

                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(""); }}
                        className="w-full text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-slate-300 transition-colors py-2"
                      >
                        ← Cambiar código
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 flex items-center justify-center gap-4 opacity-20 group">
                <div className="h-px w-8 bg-slate-500" />
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  EDUFLOW PRO GATEWAY
                </p>
                <div className="h-px w-8 bg-slate-500" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
