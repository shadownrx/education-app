"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Mail, 
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
  const faqs = [
    { q: "¿Cómo cambio mi materia activa?", a: "Haz clic en el cuadro de 'Materia Activa' en la barra lateral izquierda para cambiar entre tus aulas." },
    { q: "¿Los alumnos necesitan crear cuenta?", a: "No, solo necesitan el código de 6 letras que generas para entrar y registrar su nombre." },
    { q: "¿Cómo funciona la IA para corregir?", a: "EduAI analiza la consigna y la entrega del alumno para sugerirte una nota y un feedback constructivo." },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-4 md:p-10 max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
             <div className="w-20 h-20 rounded-[32px] bg-indigo-600/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                <LifeBuoy className="w-10 h-10 text-indigo-400" />
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">Centro de Ayuda</h1>
             <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto font-medium">
                Estamos aquí para que tu experiencia con EduFlow sea impecable. Encuentra guías, preguntas frecuentes y soporte técnico.
             </p>
          </header>

          {/* Search Bar */}
          <div className="relative mb-16 max-w-2xl mx-auto">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
             <input 
              type="text" 
              placeholder="Busca una solución..."
              className="w-full bg-[#0f172a] border border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 shadow-2xl"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
             {/* Contact Card */}
             <div className="p-8 rounded-[40px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/20 transition-all">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                   <Mail className="w-5 h-5 text-indigo-400" /> Contacto Directo
                </h3>
                <div className="space-y-4">
                   <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-4">
                         <MessageSquare className="w-5 h-5 text-emerald-400" />
                         <div className="text-left">
                            <p className="text-sm font-bold text-white">Chat en Vivo</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Disponible ahora</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                   </button>
                   <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-4">
                         <Mail className="w-5 h-5 text-blue-400" />
                         <div className="text-left">
                            <p className="text-sm font-bold text-white">Soporte por Email</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Respuesta en 24hs</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                   </button>
                </div>
             </div>

             {/* Resources Card */}
             <div className="p-8 rounded-[40px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/20 transition-all">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                   <FileText className="w-5 h-5 text-indigo-400" /> Recursos Útiles
                </h3>
                <div className="space-y-4">
                   <a href="/MANUAL_DOCENTE.md" target="_blank" className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-4">
                         <FileText className="w-5 h-5 text-indigo-400" />
                         <div className="text-left">
                            <p className="text-sm font-bold text-white">Manual Docente</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Guía completa PDF</p>
                         </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-700" />
                   </a>
                   <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-4">
                         <ShieldCheck className="w-5 h-5 text-purple-400" />
                         <div className="text-left">
                            <p className="text-sm font-bold text-white">Seguridad de Datos</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nuestra política</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                   </button>
                </div>
             </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
             <h3 className="text-xl font-black text-white mb-8 ml-4">Preguntas Frecuentes</h3>
             {faqs.map((f, i) => (
               <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 rounded-[32px] bg-[#0f172a] border border-white/5"
               >
                  <h4 className="font-bold text-slate-100 mb-3">{f.q}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{f.a}</p>
               </motion.div>
             ))}
          </div>

          {/* Footer Promo */}
          <footer className="mt-20 py-10 border-t border-white/5 text-center">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">EduFlow Support Ecosystem</p>
             <p className="text-xs text-slate-500 font-medium italic">"Mejorando cada día para que enseñes mejor."</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
