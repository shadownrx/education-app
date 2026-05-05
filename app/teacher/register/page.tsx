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
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const passwordRules = [
  { id: "length", label: "Mínimo 8 caracteres",   test: (p: string) => p.length >= 8 },
  { id: "upper",  label: "Al menos una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",  label: "Al menos una minúscula", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Al menos un número",     test: (p: string) => /[0-9]/.test(p) },
];

const strengthMeta = [
  { label: "Muy débil",  color: "from-red-500 to-red-400",       text: "text-red-400" },
  { label: "Débil",      color: "from-orange-500 to-orange-400", text: "text-orange-400" },
  { label: "Regular",    color: "from-yellow-500 to-yellow-400", text: "text-yellow-400" },
  { label: "Fuerte",     color: "from-emerald-500 to-emerald-400", text: "text-emerald-400" },
  { label: "Muy fuerte", color: "from-emerald-400 to-cyan-400",  text: "text-cyan-400" },
];

export default function TeacherRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const ruleResults = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const strength = strengthMeta[passedCount] ?? strengthMeta[0];
  const canSubmit = allRulesPassed && name.trim().length >= 2 && email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/teacher/login"), 1500);
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
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden relative">

      {/* ── Animated background mesh ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-indigo-700/15 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[60%] h-[60%] rounded-full bg-violet-700/15 blur-[140px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-blue-700/8 blur-[120px]" />
      </div>

      {/* ── Left panel — brand / features (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 relative z-10 p-14 border-r border-white/5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter">EduFlow</span>
        </Link>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Plataforma educativa 2026
          </div>

          <h2 className="text-5xl font-black tracking-tighter leading-[1] mb-6">
            El aula del<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              futuro, hoy
            </span>
          </h2>

          <p className="text-slate-400 text-base font-medium leading-relaxed mb-12 max-w-xs">
            Gestiona asistencia, calificaciones y comunicación con tus alumnos en una sola plataforma impulsada por IA.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Cuenta segura en segundos" },
              { icon: Sparkles,    text: "Asistente EduAI incluido" },
              { icon: GraduationCap, text: "Multi-materia e instituciones" },
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

        {/* Footer */}
        <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">
          Buenos Aires · 2026
        </p>
      </div>

      {/* ── Right panel — form ── */}
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Crear cuenta</h1>
            <p className="text-slate-500 font-medium">
              Únete a la comunidad de profesores
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-[32px] p-8 shadow-[0_0_80px_-20px_rgba(79,70,229,0.2)]">

            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center gap-4"
                >
                  <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white mb-1">¡Cuenta creada!</p>
                    <p className="text-slate-400 text-sm">Redirigiendo al login…</p>
                  </div>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name field */}
                  <Field label="Nombre Completo">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Prof. Juan Pérez"
                      className="w-full bg-slate-950/60 border border-white/6 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-indigo-500/60 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all placeholder:text-slate-700"
                    />
                  </Field>

                  {/* Email field */}
                  <Field label="Email profesional">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="profe@escuela.edu"
                      className="w-full bg-slate-950/60 border border-white/6 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-medium focus:outline-none focus:border-indigo-500/60 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all placeholder:text-slate-700"
                    />
                  </Field>

                  {/* Password field */}
                  <div className="space-y-3">
                    <Field label="Contraseña">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                        placeholder="Crear contraseña segura"
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
                    </Field>

                    {/* Strength bar + checklist */}
                    <AnimatePresence>
                      {passwordTouched && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {/* Progress bars */}
                          <div className="flex gap-1.5 mb-2">
                            {passwordRules.map((_, i) => (
                              <div key={i} className="relative h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  animate={{ scaleX: i < passedCount ? 1 : 0 }}
                                  initial={{ scaleX: 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  style={{ originX: 0 }}
                                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${strength.color}`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Strength label */}
                          {passedCount > 0 && (
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${strength.text}`}>
                              Contraseña {strength.label}
                            </p>
                          )}

                          {/* Checklist */}
                          <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-2.5">
                            {ruleResults.map((rule, i) => (
                              <motion.div
                                key={rule.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                              >
                                <motion.div
                                  animate={rule.passed ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {rule.passed
                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    : <Circle       className="w-4 h-4 text-slate-700 flex-shrink-0" />
                                  }
                                </motion.div>
                                <span className={`text-xs font-semibold transition-colors duration-300 ${rule.passed ? "text-emerald-400" : "text-slate-600"}`}>
                                  {rule.label}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    id="register-submit"
                    type="submit"
                    disabled={loading || !canSubmit}
                    whileTap={canSubmit && !loading ? { scale: 0.97 } : {}}
                    className={`w-full relative overflow-hidden py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 mt-1
                      ${canSubmit
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/25 cursor-pointer"
                        : "bg-white/5 text-slate-600 cursor-not-allowed"
                      }`}
                  >
                    {/* Shimmer on hover when active */}
                    {canSubmit && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    )}
                    {loading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <><span>Crear mi cuenta</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer link */}
          <p className="text-center text-slate-600 text-sm mt-6 font-medium">
            ¿Ya tenés cuenta?{" "}
            <Link href="/teacher/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}
