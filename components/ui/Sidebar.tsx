"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  LogOut,
  GraduationCap,
  Bell,
  Search,
  ChevronRight,
  BookOpen,
  FileText,
  Menu,
  X as CloseIcon,
  BarChart3,
  MessageSquare,
  Library,
  HelpCircle,
  Zap,
  Loader2,
  AlertCircle,
  Shield,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EduAssistant } from "@/components/ai/EduAssistant";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  role: "teacher" | "student";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [savingAdmin, setSavingAdmin] = useState(false);

  useEffect(() => {
    if (role === "teacher") {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setUserName(data.user.name);
            setAvatarUrl(data.user.avatar || null);
          }
        })
        .catch(console.error);

      fetch("/api/subjects/active")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data._id) setActiveSubject(data);
        })
        .catch(console.error);
    } else {
      fetch("/api/students/me")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUserName(data.name);
            setAvatarUrl(data.avatar || null);
          }
        });

      const name = document.cookie
        .split("; ")
        .find((row) => row.startsWith("student_name="))
        ?.split("=")[1];
      if (!userName) setUserName(name ? decodeURIComponent(name) : "Alumno");
    }
  }, [role]);

  const handleUpdateSystemMessage = async () => {
    setSavingAdmin(true);
    try {
      const res = await fetch("/api/app-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: adminMessage || null }),
      });
      if (res.ok) {
        setShowAdminModal(false);
        window.location.reload(); // Refresh to see changes
      }
    } catch (error) {
      console.error("Error updating system message:", error);
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const teacherSections = [
    {
      label: "Gestión Diaria",
      links: [
        { name: "Panel Principal",    href: "/teacher/dashboard",   icon: LayoutDashboard },
        { name: "Mis Alumnos",        href: "/teacher/students",    icon: Users },
        { name: "Plan de Clases",     href: "/teacher/lesson-plan", icon: Calendar },
        { name: "Trabajos Prácticos", href: "/teacher/assignments", icon: ClipboardList },
      ],
    },
    {
      label: "Seguimiento",
      links: [
        { name: "Calificaciones", href: "/teacher/grades",    icon: BarChart3 },
        { name: "Mensajería",     href: "/teacher/messages",  icon: MessageSquare },
        { name: "Biblioteca",     href: "/teacher/library",   icon: Library },
      ],
    },
    {
      label: "Herramientas",
      links: [
        { name: "Panel de Control", href: "#", icon: Shield, onClick: () => setShowAdminModal(true) },
      ],
    },
  ];

  const studentLinks = [
    { name: "Mi Panel",      href: "/student/dashboard",   icon: LayoutDashboard },
    { name: "Mis Trabajos",  href: "/student/assignments", icon: ClipboardList },
    { name: "Recursos",      href: "/student/resources",   icon: Library },
    { name: "Calificaciones",href: "/student/grades",      icon: BarChart3 },
    { name: "Mensajes",      href: "/student/messages",    icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      window.location.href = "/";
    }
  };

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const NavLink = ({ href, icon: Icon, name, onClick }: { href: string; icon: any; name: string; onClick?: () => void }) => {
    const isActive = pathname === href;
    
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className="w-full relative flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 group overflow-hidden"
        >
          <Icon className="w-4 h-4 flex-shrink-0 transition-colors text-slate-600 group-hover:text-slate-400" />
          <span className="truncate">{name}</span>
        </button>
      );
    }

    return (
      <Link
        href={href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 group overflow-hidden",
          isActive
            ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="nav-active"
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400 rounded-r-full"
          />
        )}
        <Icon
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            isActive ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"
          )}
        />
        <span className="truncate">{name}</span>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent pointer-events-none" />
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      {/* Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Panel de Control</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Avisos Globales</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Mensaje del Sistema</label>
                  <textarea 
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Escribe un aviso (ej. Mantenimiento)..."
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 min-h-[100px] resize-none"
                  />
                  <p className="text-[10px] text-slate-600 mt-2 px-1 italic">Deja vacío para eliminar el aviso actual.</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdateSystemMessage}
                    disabled={savingAdmin}
                    className="flex-1 py-4 rounded-2xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {savingAdmin ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publicar Aviso"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-1 flex-shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-black text-xl tracking-tighter text-white block leading-tight">
            EduFlow
          </span>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            SISTEMA PRO
          </span>
        </div>
      </div>

      {/* Active subject pill (teacher only) */}
      {role === "teacher" && activeSubject && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-2xl bg-indigo-500/8 border border-indigo-500/15 cursor-pointer hover:bg-indigo-500/12 transition-all group flex-shrink-0"
          onClick={() => { router.push("/teacher/subjects"); setIsMobileOpen(false); }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
              Materia Activa
            </p>
            <ChevronRight className="w-3 h-3 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white truncate">{activeSubject.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BookOpen className="w-2.5 h-2.5 text-slate-500" />
            <p className="text-[10px] text-slate-500 truncate">{activeSubject.institution}</p>
          </div>
        </motion.div>
      )}

      {/* Nav links — this is the only scrollable zone */}
      <div className="space-y-6 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 pr-1">
        {role === "teacher" ? (
          teacherSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">
                {section.label}
              </p>
              {section.links.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {studentLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>
        )}

        {/* Support */}
        <div className="space-y-1">
          <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">
            Soporte
          </p>
          <a
            href="/MANUAL_DOCENTE.md"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all group"
          >
            <FileText className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            Manual de Usuario
          </a>
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all group"
          >
            <HelpCircle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            Ayuda Técnica
          </Link>
        </div>
      </div>

      {/* User footer */}
      <div className="mt-6 pt-5 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 mb-3">
          <label className="relative cursor-pointer group/avatar">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
              disabled={uploading}
            />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-lg shadow-indigo-600/20 overflow-hidden relative">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </label>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">
              {role === "teacher" ? "Docente" : "Alumno"}
            </p>
            <p className="text-xs font-bold text-slate-300 truncate">
              {userName || "Cargando..."}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-red-500/8 border border-red-500/10 text-red-400 hover:bg-red-500/15 hover:border-red-500/20 text-xs font-black uppercase tracking-widest transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050d1a] backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="fixed top-5 left-5 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3 rounded-2xl bg-[#0f172a] border border-white/10 text-slate-300 shadow-xl hover:border-indigo-500/30 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-[#050d1a] border-r border-white/5 z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-500 hover:text-white transition-colors z-10"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <EduAssistant />
    </>
  );
}

export function TopBar({ role }: { role?: "teacher" | "student" }) {
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (role === "teacher") {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { 
          if (d?.user) {
            setUserName(d.user.name);
            setAvatarUrl(d.user.avatar || null);
          }
        })
        .catch(() => {});
    } else {
      fetch("/api/students/me")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUserName(data.name);
            // Students can also have avatars via their User record
            // We should ideally fetch the user avatar here too
          }
        });

      if (typeof document !== "undefined") {
        const name = document.cookie
          .split("; ")
          .find((r) => r.startsWith("student_name="))
          ?.split("=")[1];
        if (!userName) setUserName(name ? decodeURIComponent(name) : "Alumno");
      }
    }
  }, [role]);

  const [hasUpdate, setHasUpdate] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/app-version");
        if (res.ok) {
          const { version, message } = await res.json();
          setSystemMessage(message);
          
          const storedVersion = localStorage.getItem("app_version");
          
          if (!storedVersion) {
            localStorage.setItem("app_version", version);
          } else if (storedVersion !== version) {
            setHasUpdate(true);
          }
        }
      } catch (error) {
        console.error("Error checking app version:", error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 1000 * 60 * 5); // Check every 5 mins
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    localStorage.removeItem("app_version");
    window.location.reload();
  };

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  return (
    <header className="flex flex-col sticky top-0 z-30 bg-[#020617]">
      <AnimatePresence>
        {systemMessage && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-400 text-black px-6 py-2 flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-black uppercase tracking-widest text-center leading-tight">
              Aviso del Sistema: {systemMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[72px] border-b border-white/5 flex items-center justify-between px-6 md:px-10 py-4">
        {/* Search */}
        <div className="relative max-w-sm w-full ml-14 lg:ml-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input
          type="text"
          placeholder="Busca cualquier cosa..."
          className="w-full bg-slate-900 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {role === "teacher" && (
          <div className="hidden sm:block">
            {/* AI Assistant unified in Sidebar */}
          </div>
        )}

        <div className="h-6 w-px bg-white/8 mx-1" />

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={hasUpdate ? handleReload : undefined}
            className={cn(
              "w-10 h-10 rounded-2xl border flex items-center justify-center transition-all relative group",
              hasUpdate 
                ? "bg-red-500/10 border-red-500/50 hover:bg-red-500/20" 
                : "bg-slate-900/80 border-white/5 hover:bg-slate-800 hover:border-white/10"
            )}
          >
            <Bell className={cn(
              "w-4 h-4 transition-colors",
              hasUpdate ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {hasUpdate && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#020617] animate-ping" />
            )}
          </button>
          
          <AnimatePresence>
            {hasUpdate && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-3 w-64 p-4 rounded-3xl bg-[#0f172a] border border-red-500/30 shadow-2xl z-50 pointer-events-none"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Actualización</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Hay nuevas mejoras disponibles en EduFlow. <span className="text-red-400 font-bold">Haz clic en la campana</span> para recargar y aplicar los cambios.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-indigo-600/25 cursor-pointer hover:scale-105 transition-transform select-none overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
     </div>
    </header>
  );
}
