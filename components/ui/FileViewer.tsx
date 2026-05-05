"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  X as CloseIcon, 
  ExternalLink as LinkIcon, 
  Download as DownloadIcon, 
  FileText as PDFIcon, 
  File as GenericFileIcon, 
  Loader2 as SpinnerIcon, 
  AlertCircle as WarningIcon 
} from "lucide-react";

interface FileViewerProps {
  url: string;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FileViewer({ url, filename, isOpen, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [fullUrl, setFullUrl] = useState(url);
  const fileExtension = filename.split('.').pop()?.toLowerCase();

  const isPDF = fileExtension === 'pdf';
  const isDocx = fileExtension === 'docx' || fileExtension === 'doc';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
      
      // Construct full URL if it's relative
      if (!url.startsWith('http')) {
        setFullUrl(window.location.origin + url);
      } else {
        setFullUrl(url);
      }
    }
  }, [url, isOpen]);

  // Google Docs viewer URL (only used if not PDF and not on localhost)
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl h-full bg-[#0f172a] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Toolbar */}
            <div className="p-4 md:p-6 bg-slate-900 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  {isPDF ? <PDFIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" /> : <GenericFileIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base truncate max-w-[200px] md:max-w-md">{filename}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{fileExtension?.toUpperCase()} Document</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={url} 
                  download 
                  className="p-2 md:p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Descargar"
                >
                  <DownloadIcon className="w-5 h-5" />
                </a>
                <a 
                  href={url} 
                  target="_blank" 
                  className="p-2 md:p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Abrir en pestaña nueva"
                >
                  <LinkIcon className="w-5 h-5" />
                </a>
                <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />
                <button 
                  onClick={onClose}
                  className="p-2 md:p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden">
              {isDocx && isLocalhost ? (
                /* Localhost DOCX Warning */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <WarningIcon className="w-10 h-10 text-amber-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Vista previa no disponible en Localhost</h4>
                  <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                    El visor de documentos requiere que el archivo sea accesible públicamente en internet. 
                    En producción funcionará correctamente, pero por ahora puedes descargar el archivo para verlo.
                  </p>
                  <a 
                    href={url} 
                    download
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Descargar Archivo
                  </a>
                </div>
              ) : (
                <>
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
                      <SpinnerIcon className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando visualizador...</p>
                    </div>
                  )}
                  
                  {isPDF ? (
                    <embed
                      src={url}
                      type="application/pdf"
                      className="w-full h-full border-none"
                      onLoad={() => setLoading(false)}
                    />
                  ) : (
                    <iframe
                      src={viewerUrl}
                      className="w-full h-full border-none"
                      onLoad={() => setLoading(false)}
                      title={filename}
                    />
                  )}
                </>
              )}
            </div>
            
            {/* Footer / Mobile Hint */}
            <div className="p-3 bg-slate-900 border-t border-white/5 text-center hidden md:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {isPDF ? "Visualización Nativa" : "Visualización vía Google Docs Service"}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
