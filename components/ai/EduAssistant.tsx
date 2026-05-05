import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, Loader2, Maximize2, Minimize2, Trash2, Check, Clipboard, SendHorizonal, PlusCircle, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface EduAssistantProps {
  variant?: "floating" | "header";
}

interface AIAction {
  type: "CREATE_ASSIGNMENT" | "CREATE_LESSON_PLAN" | "FEEDBACK";
  data: any;
}

export function EduAssistant({ variant = "floating" }: EduAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, action?: AIAction, successData?: any }[]>([
    { role: 'assistant', content: '¡Hola! Soy **EduAI**. ¿En qué puedo ayudarte hoy? \n\nPuedo ayudarte con:\n- 📝 Crear planes de clase\n- 💡 Ideas para trabajos prácticos\n- 📊 Analizar el rendimiento del aula' }
  ]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    if (!textOverride) setInput("");
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          
          // Improved Regex to support newlines in JSON
          const actionMatch = assistantMessage.match(/@@ACTION:([\s\S]*?)@@/);
          let cleanContent = assistantMessage;
          let action: AIAction | undefined;

          if (actionMatch) {
            try {
              const jsonStr = actionMatch[1].trim();
              action = JSON.parse(jsonStr);
              cleanContent = assistantMessage.replace(/@@ACTION:[\s\S]*?@@/, "");
            } catch (e) {
              console.error("Failed to parse action JSON:", e);
            }
          }

          lastMsg.content = cleanContent;
          lastMsg.action = action;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al procesar tu solicitud." }]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: AIAction, index: number) => {
    setActionLoading(index);
    try {
      const res = await fetch("/api/ai/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[index].successData = data.result;
          newMessages[index].action = undefined; 
          return newMessages;
        });
      }
    } catch (error) {
      alert("Error al ejecutar la acción");
    } finally {
      setActionLoading(null);
    }
  };

  const ActionButtons = ({ action, index }: { action: AIAction, index: number }) => {
    const isThisLoading = actionLoading === index;

    if (action.type === "CREATE_ASSIGNMENT") {
      return (
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Propuesta de TP
          </div>
          <div className="text-slate-400 text-xs line-clamp-2 italic">
            {action.data.description || "Sin descripción"}
          </div>
          <button
            onClick={() => executeAction(action, index)}
            disabled={isThisLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            {isThisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Confirmar y Crear TP
          </button>
        </div>
      );
    }

    if (action.type === "CREATE_LESSON_PLAN") {
      return (
        <button
          onClick={() => executeAction(action, index)}
          disabled={isThisLoading}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
        >
          {isThisLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Guardar Plan de Clase
        </button>
      );
    }

    if (action.type === "FEEDBACK") {
      return (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(action.data.text); alert("Copiado"); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Clipboard className="w-3 h-3" />
            Copiar Feedback
          </button>
        </div>
      );
    }

    return null;
  };

  const SuccessCard = ({ data, type }: { data: any, type: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3"
    >
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
        <Check className="w-4 h-4" />
        {type === "CREATE_ASSIGNMENT" ? "TP Creado" : "Plan Guardado"}
      </div>
      <div className="text-slate-200">
        <p className="font-bold text-sm">{data.title}</p>
        <p className="text-[11px] text-slate-400">{data.deadline || data.date}</p>
      </div>
      <Link 
        href={type === "CREATE_ASSIGNMENT" ? "/teacher/assignments" : "/teacher/lesson-plan"}
        className="flex items-center gap-2 text-emerald-400 text-xs font-bold hover:underline"
      >
        Ver en la sección correspondiente
        <ExternalLink className="w-3 h-3" />
      </Link>
    </motion.div>
  );

  const ChatWindow = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={cn(
        "fixed bg-[#0f172a] rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5",
        variant === "header" ? "top-20 right-8" : "bottom-24 right-8",
        isExpanded ? "w-[650px] h-[750px]" : "w-96 h-[550px]"
      )}
    >
      <div className="p-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight">EduAI Assistant</h3>
            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Modo Gestión Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Maximize2 className="w-4 h-4" /></button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", m.role === 'user' ? "bg-indigo-600" : "bg-slate-800 border border-white/5")}>
                {m.role === 'user' ? <span className="text-[10px] font-bold">YO</span> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.action && <ActionButtons action={m.action} index={i} />}
                {m.successData && <SuccessCard data={m.successData} type={m.successData.week ? "CREATE_LESSON_PLAN" : "CREATE_ASSIGNMENT"} />}
              </div>
            </motion.div>
          ))}
          {loading && messages[messages.length-1].role === 'user' && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /></div>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-white/10">
        <div className="relative">
          <textarea
            rows={1}
            placeholder="Pregúntale a EduAI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="w-full bg-slate-800 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-[10px] w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {variant === "floating" && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-2xl z-50 group"
        >
          <Sparkles className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>
      )}
      {variant === "header" && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all text-sm font-medium text-slate-300 hover:text-indigo-400 group"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">EduAI</span>
        </button>
      )}
      <AnimatePresence>{isOpen && ChatWindow}</AnimatePresence>
    </>
  );
}
