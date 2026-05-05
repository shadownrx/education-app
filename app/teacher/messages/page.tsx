"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search, 
  MoreVertical,
  Plus,
  Circle,
  FileText,
  Paperclip
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState<any>(null);
  
  const contacts = [
    { id: 1, name: "Todo el Curso", type: "broadcast", lastMsg: "Recuerden el TP de mañana...", time: "10:30 AM", unread: 2 },
    { id: 2, name: "Martin Gomez", type: "student", lastMsg: "Profe, no entiendo el punto 3", time: "Ayer", unread: 0 },
    { id: 3, name: "Lucia Perez", type: "student", lastMsg: "Gracias por la corrección!", time: "Lun", unread: 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="h-[calc(100vh-80px)] flex">
          {/* Contacts Sidebar */}
          <div className="w-full md:w-80 border-r border-white/5 bg-[#0f172a]/50 flex flex-col">
             <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-black text-white tracking-tight">Mensajes</h2>
                   <button className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                   </button>
                </div>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                    type="text" 
                    placeholder="Buscar chat..."
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
                   />
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6 space-y-1">
                {contacts.map((c) => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl transition-all group",
                      activeChat?.id === c.id ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm",
                      activeChat?.id === c.id ? "bg-white/20 text-white" : "bg-slate-900 border border-white/10 text-indigo-400"
                    )}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                       <div className="flex items-center justify-between mb-0.5">
                          <p className={cn("text-sm font-bold truncate", activeChat?.id === c.id ? "text-white" : "text-slate-200")}>{c.name}</p>
                          <span className={cn("text-[9px] font-medium shrink-0", activeChat?.id === c.id ? "text-indigo-200" : "text-slate-500")}>{c.time}</span>
                       </div>
                       <p className={cn("text-xs truncate", activeChat?.id === c.id ? "text-indigo-100/70" : "text-slate-500")}>{c.lastMsg}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-950/30">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 bg-[#0f172a]/30 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                        {activeChat.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{activeChat.name}</h3>
                        <div className="flex items-center gap-1.5">
                           <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">En línea</span>
                        </div>
                      </div>
                   </div>
                   <button className="p-2 text-slate-500 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                   <div className="flex justify-center">
                      <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hoy</span>
                   </div>
                   
                   <div className="flex flex-col gap-6">
                      {/* Received */}
                      <div className="flex items-end gap-3 max-w-[80%]">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">MG</div>
                         <div className="p-4 rounded-[20px] rounded-bl-none bg-[#0f172a] border border-white/5 text-sm text-slate-300 leading-relaxed shadow-xl">
                            Hola Profe, ¿el TP se puede entregar en PDF?
                            <p className="text-[9px] text-slate-500 mt-2 text-right">10:15 AM</p>
                         </div>
                      </div>

                      {/* Sent */}
                      <div className="flex flex-col items-end gap-2 max-w-[80%] self-end">
                         <div className="p-4 rounded-[20px] rounded-br-none bg-indigo-600 text-sm text-white leading-relaxed shadow-xl shadow-indigo-600/10">
                            ¡Hola Martin! Sí, de hecho es el formato preferido.
                            <p className="text-[9px] text-indigo-200 mt-2 text-right">10:18 AM</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Chat Input */}
                <div className="p-6 md:p-8 bg-[#0f172a]/50 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <button className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-indigo-400 transition-all">
                         <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                         <input 
                          type="text" 
                          placeholder="Escribe un mensaje..."
                          className="w-full bg-slate-950 border border-white/10 rounded-[20px] py-4 px-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                         />
                         <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">
                            <Send className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                 <div className="w-24 h-24 rounded-[40px] bg-indigo-600/10 flex items-center justify-center mb-8">
                    <MessageSquare className="w-10 h-10 text-indigo-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-2">Tu Centro de Comunicación</h3>
                 <p className="text-slate-500 text-sm max-w-sm">Selecciona un chat para comenzar a hablar con tus alumnos o enviar anuncios a todo el curso.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
