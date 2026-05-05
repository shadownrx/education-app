"use client";

import { Sidebar, TopBar } from "@/components/ui/Sidebar";
import { 
  Library, 
  Search, 
  Plus, 
  Folder, 
  FileText, 
  File, 
  MoreVertical,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Clock,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileViewer } from "@/components/ui/FileViewer";

export default function LibraryPage() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });

  const files = [
    { name: "Programa 2026.pdf", type: "pdf", size: "2.4 MB", date: "Hace 2 días", url: "/docs/programa.pdf" },
    { name: "Guía de SQL.docx", type: "docx", size: "1.1 MB", date: "Hace 5 días", url: "/docs/guia_sql.docx" },
    { name: "Clase 01 - Intro.pdf", type: "pdf", size: "5.8 MB", date: "Ayer", url: "/docs/clase01.pdf" },
    { name: "Examen Modelo.docx", type: "docx", size: "800 KB", date: "Hoy", url: "/docs/examen.docx" },
  ];

  const openViewer = (name: string, url: string) => {
    setSelectedFile({ name, url });
    setViewerOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">
                  <Library className="w-3.5 h-3.5" /> Mi Biblioteca Digital
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Gestión de Recursos</h1>
             </div>
             <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-[24px] bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                <Plus className="w-5 h-5" /> Subir Archivo
             </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10">
             {/* Sidebar Navigation */}
             <div className="space-y-6">
                <div className="p-6 rounded-[32px] bg-[#0f172a] border border-white/5 space-y-2">
                   <button className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold transition-all">
                      <div className="flex items-center gap-3">
                         <Folder className="w-4 h-4" /> Todos los Archivos
                      </div>
                      <span className="text-[10px] opacity-70">24</span>
                   </button>
                   <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-400 text-xs font-bold transition-all">
                      <div className="flex items-center gap-3">
                         <FileText className="w-4 h-4" /> Documentos PDF
                      </div>
                      <span className="text-[10px] opacity-70">12</span>
                   </button>
                   <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-400 text-xs font-bold transition-all">
                      <div className="flex items-center gap-3">
                         <Folder className="w-4 h-4" /> Por Materia
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                   </button>
                </div>

                <div className="p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/10">
                   <div className="flex items-center gap-3 mb-4">
                      <HardDrive className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Almacenamiento</h4>
                   </div>
                   <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                      <div className="w-[45%] h-full bg-indigo-500" />
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">450 MB de 1 GB usados</p>
                </div>
             </div>

             {/* Files Grid */}
             <div className="lg:col-span-3 space-y-6">
                <div className="relative mb-8">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                    type="text" 
                    placeholder="Buscar en mis recursos..."
                    className="w-full bg-[#0f172a] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                   {files.map((file, i) => (
                     <div 
                      key={i} 
                      onClick={() => openViewer(file.name, file.url)}
                      className="group p-6 rounded-[32px] bg-[#0f172a] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-slate-500 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                        
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                          file.type === 'pdf' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                           {file.type === 'pdf' ? <FileText className="w-8 h-8" /> : <File className="w-8 h-8" />}
                        </div>
                        
                        <h4 className="font-bold text-white text-sm truncate mb-1 group-hover:text-indigo-400 transition-colors">{file.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           <span>{file.size}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {file.date}</span>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-2">
                           <button className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                              Ver
                           </button>
                           <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                              <Download className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
                
                {/* Promo Card */}
                <div className="p-10 rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-800 border border-white/10 shadow-2xl relative overflow-hidden mt-12 group cursor-pointer">
                   <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white mb-6">
                        <Sparkles className="w-3.5 h-3.5" /> Función Premium
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tighter">EduFlow Drive</h3>
                      <p className="text-indigo-100/80 text-sm max-w-md font-medium leading-relaxed mb-8">
                         Próximamente: Sincroniza tus recursos con Google Drive y OneDrive para tener todo en un solo lugar.
                      </p>
                      <button className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                         Notificarme
                      </button>
                   </div>
                   <Library className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                </div>
             </div>
          </div>
        </div>
      </main>

      <FileViewer 
        isOpen={viewerOpen}
        filename={selectedFile.name}
        url={selectedFile.url}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
