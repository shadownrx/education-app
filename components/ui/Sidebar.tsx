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
  UserCircle,
  HelpCircle
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
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (role === "teacher") {
      fetch("/api/auth/me")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.user) setUserName(data.user.name);
        })
        .catch(console.error);

      fetch("/api/subjects/active")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data._id) setActiveSubject(data);
        })
        .catch(console.error);
    } else {
      const name = document.cookie
        .split("; ")
        .find(row => row.startsWith("student_name="))
        ?.split("=")[1];
      setUserName(name ? decodeURIComponent(name) : "Alumno");
    }
  }, [role]);

  const teacherSections = [
    {
      label: "Gestión Diaria",
      links: [
        { name: "Panel Principal", href: "/teacher/dashboard", icon: LayoutDashboard },
        { name: "Mis Alumnos", href: "/teacher/students", icon: Users },
        { name: "Plan de Clases", href: "/teacher/lesson-plan", icon: Calendar },
        { name: "Trabajos Prácticos", href: "/teacher/assignments", icon: ClipboardList },
      ]
    },
    {
      label: "Seguimiento",
      links: [
        { name: "Calificaciones", href: "/teacher/grades", icon: BarChart3 },
        { name: "Mensajería", href: "/teacher/messages", icon: MessageSquare },
        { name: "Biblioteca", href: "/teacher/library", icon: Library },
      ]
    }
  ];

  const studentLinks = [
    { name: "Mi Panel", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Mis Trabajos", href: "/student/assignments", icon: ClipboardList },
    { name: "Calificaciones", href: "/student/grades", icon: BarChart3 },
    { name: "Mensajes", href: "/student/messages", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      window.location.href = "/";
    }
  };

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-10 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-black text-2xl tracking-tighter text-slate-950 block leading-tight">EduFlow</span>
          <span className="text-[9px] font-black text-teal-700 uppercase tracking-[0.2em]">SISTEMA PRO</span>
        </div>
      </div>

      {role === "teacher" && activeSubject && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-[20px] bg-teal-50 border border-teal-100 group cursor-pointer hover:bg-teal-100/70 transition-all shrink-0" 
          onClick={() => {
            router.push("/teacher/subjects");
            setIsMobileOpen(false);
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-teal-700">Materia Activa</p>
            <ChevronRight className="w-3 h-3 text-teal-700 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-slate-950 truncate">{activeSubject.name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BookOpen className="w-2.5 h-2.5 text-slate-500" />
            <p className="text-[10px] text-slate-500 truncate">{activeSubject.institution}</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-8 flex-1">
        {role === "teacher" ? (
          teacherSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all group",
                        isActive 
                          ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10" 
                          : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
                      )}
                    >
                      <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {studentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all group",
                    isActive 
                      ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10" 
                      : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}

        <div className="space-y-2 pt-4">
           <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Soporte</p>
           <a 
            href="/MANUAL_DOCENTE.md" 
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all group"
           >
             <FileText className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700" />
             Manual de Usuario
           </a>
           <Link 
            href="/support"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all group"
           >
             <HelpCircle className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-700" />
             Ayuda Técnica
           </Link>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-teal-700 shrink-0">
            {userName ? userName.substring(0, 2).toUpperCase() : "??"}
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
              {role === "teacher" ? "Docente" : "Alumno"}
            </p>
            <p className="text-[12px] font-black text-slate-900 truncate">{userName || "Cargando..."}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <UserCircle className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 hidden lg:flex flex-col z-40">
        <SidebarContent />
      </aside>

      <div className="fixed top-5 left-5 z-50 lg:hidden">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-500 hover:text-slate-950 z-10"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function TopBar({ role }: { role?: "teacher" | "student" }) {
  return (
    <header className="h-20 bg-white/85 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 md:px-10">
      <div className="relative max-w-md w-full ml-14 lg:ml-0 transition-all duration-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Busca cualquier cosa..." 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:border-teal-600/50 transition-all placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        {role === "teacher" && (
          <div className="hidden sm:block">
            <EduAssistant variant="header" />
          </div>
        )}
        
        <div className="h-8 w-px bg-slate-200 mx-1 md:mx-2" />
        
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-800 transition-all relative group">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        </button>
        
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-teal-700 p-[1px] shadow-lg shadow-indigo-600/20">
          <div className="w-full h-full rounded-[23px] bg-teal-700 flex items-center justify-center font-black text-sm text-white uppercase">
            PG
          </div>
        </div>
      </div>
    </header>
  );
}

