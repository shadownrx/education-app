"use client";

import { useState } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/teacher/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.includes("@") && password.length >= 1;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden relative">

      {/* Animated background mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] rounded-full bg-indigo-700/15 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-violet-700/15 blur-[140px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Left panel — brand (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 relative z-10 p-14 border-r border-white/5">
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter">EduFlow</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso seguro
          </div>

          <h2 className="text-5xl font-black tracking-tighter leading-[1] mb-6">
            Bienvenido<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              de vuelta
            </span>
          </h2>

          <p className="text-slate-400 text-base font-medium leading-relaxed mb-12 max-w-xs">
            Tu aula inteligente te está esperando. Ingresa y gestiona tus materias con el poder de la IA.
          </p>

          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Sesión cifrada y segura" },
              { icon: Sparkles,    text: "Asistente EduAI disponible" },
              { icon: GraduationCap, text: "Gestión de múltiples materias" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">
          Tucumán · 2026
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">EduFlow</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
              Panel Docente
            </h1>
            <p className="text-slate-500 font-medium">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-[32px] p-8 shadow-[0_0_80px_-20px_rgba(79,70,229,0.2)]">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold text-center">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="profe@escuela.edu"
                    className="w-full bg-slate-950/60 border border-white/6 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-indigo-500/60 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full bg-slate-950/60 border border-white/6 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm font-medium focus:outline-none focus:border-indigo-500/60 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all placeholder:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                id="login-submit"
                type="submit"
                disabled={loading || !canSubmit}
                whileTap={canSubmit && !loading ? { scale: 0.97 } : {}}
                className={`w-full relative overflow-hidden py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 mt-1
                  ${canSubmit
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/25 cursor-pointer"
                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                  }`}
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><span>Ingresar al Panel</span><ArrowRight className="w-4 h-4" /></>
                }
              </motion.button>
            </form>

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-[#0f172a] px-4 text-slate-600">O continuá con</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/teacher/dashboard" })}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-black font-black text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            {/* Limpiar sesión */}
            <button
              type="button"
              onClick={() => {
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                window.location.reload();
              }}
              className="w-full mt-4 text-slate-700 text-[10px] font-bold hover:text-slate-500 transition-colors py-1"
            >
              Limpiar sesión si hay errores
            </button>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6 font-medium">
            ¿No tenés cuenta?{" "}
            <Link href="/teacher/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors hover:underline">
              Registrarse gratis
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
