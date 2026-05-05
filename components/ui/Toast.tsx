"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto min-w-[300px] glass-card rounded-2xl p-4 flex items-center gap-3 shadow-2xl border-white/10"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                t.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                t.type === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-indigo-500/20 text-indigo-400'
              }`}>
                {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                 t.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>
              <p className="text-sm font-medium text-slate-200 flex-1">{t.message}</p>
              <button 
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
