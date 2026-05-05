"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Replicamos los mismos requisitos del backend (lib/validation.ts)
const passwordRules = [
  { id: "length",    label: "Mínimo 8 caracteres",      test: (p: string) => p.length >= 8 },
  { id: "upper",     label: "Al menos una mayúscula",    test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",     label: "Al menos una minúscula",    test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "Al menos un número",        test: (p: string) => /[0-9]/.test(p) },
];

export default function TeacherRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Evaluar cada regla en tiempo real
  const ruleResults = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passedCount = ruleResults.filter((r) => r.passed).length;

  // Color de la barra de progreso
  const strengthColor =
    passedCount === 0 ? "bg-slate-700"
    : passedCount === 1 ? "bg-red-500"
    : passedCount === 2 ? "bg-orange-400"
    : passedCount === 3 ? "bg-yellow-400"
    : "bg-emerald-400";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPassed) return; // Doble seguridad: nunca enviamos si la pass no es válida

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/teacher/login");
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrarse");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">EduFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-slate-400 mt-2">Únete a la comunidad de profesores</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error global */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prof. Juan Pérez"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profe@ejemplo.com"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                  placeholder="Mín. 8 caracteres"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Barra de fortaleza + checklist (aparece al escribir) */}
              <AnimatePresence>
                {passwordTouched && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {/* Barra de progreso */}
                    <div className="flex gap-1.5 mt-3 mb-3">
                      {passwordRules.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passedCount ? strengthColor : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Checklist de requisitos */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                        Tu contraseña debe tener:
                      </p>
                      {ruleResults.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-2.5">
                          {rule.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs font-medium transition-colors ${
                              rule.passed ? "text-emerald-400" : "text-slate-500"
                            }`}
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón submit — deshabilitado hasta que todo esté OK */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading || !allRulesPassed || name.trim().length < 2 || !email.includes("@")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Registrarse <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/teacher/login" className="text-indigo-400 font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
