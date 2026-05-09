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
  Paperclip,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.conversationId);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const [showNewChat, setShowNewChat] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const activeSubjectId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("active_subject_id="))
        ?.split("=")[1];
      
      if (!activeSubjectId) return;

      const res = await fetch(`/api/students?subjectId=${activeSubjectId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const startNewChat = (student: any) => {
    // Generate a unique conversationId (senderId-recipientId)
    // For consistency with existing conversations, we can just use a unique string or find if exists
    // But since the API handles creation, we can just set it as a "pre-conversation"
    const conversationId = [student.userId, student._id].sort().join("-"); // Temporary placeholder logic
    
    // Check if conversation already exists in our list
    const existing = conversations.find(c => c.participant._id === student.userId);
    if (existing) {
      setActiveChat(existing);
    } else {
      setActiveChat({
        conversationId: `new-${student.userId}`, // Mark as new to handle specially in API
        participant: { _id: student.userId, name: student.name },
        isNew: true,
        subjectId: student.subjectId
      });
      setMessages([]);
    }
    setShowNewChat(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      // For new chats, we need the subjectId from the activeChat object we created in startNewChat
      const subjectId = activeChat.isNew 
        ? activeChat.subjectId 
        : messages[0]?.subjectId || activeChat.lastMessage?.subjectId;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: activeChat.participant._id,
          subjectId: subjectId,
          content: newMessage,
          conversationId: activeChat.isNew ? `conv-${Date.now()}` : activeChat.conversationId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data]);
        setNewMessage("");
        
        if (activeChat.isNew) {
           // If it was a new chat, we need to refresh the list and set the real active chat
           const convs = await fetch("/api/messages/conversations");
           if (convs.ok) {
             const data = await convs.json();
             setConversations(data);
             const updatedChat = data.find((c: any) => c.participant._id === activeChat.participant._id);
             if (updatedChat) setActiveChat(updatedChat);
           }
        } else {
           fetchConversations();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <Sidebar role="teacher" />
      
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <TopBar role="teacher" />
        
        <div className="h-[calc(100vh-80px)] flex relative">
          {/* New Chat Modal */}
          <AnimatePresence>
            {showNewChat && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNewChat(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
                >
                  <h3 className="text-xl font-black text-white mb-6">Nuevo Mensaje</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {loadingStudents ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : students.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm py-10 italic">No hay alumnos en esta materia</p>
                    ) : (
                      students.map(s => (
                        <button
                          key={s._id}
                          onClick={() => startNewChat(s)}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-xs">
                            {s.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{s.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.email.split('@')[0]}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Contacts Sidebar */}
          <div className="hidden md:flex w-80 border-r border-white/5 bg-[#0f172a]/50 flex-col">
             <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-black text-white tracking-tight">Mensajes</h2>
                   <button 
                    onClick={() => {
                      setShowNewChat(true);
                      fetchStudents();
                    }}
                    className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                   >
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
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-xs text-slate-600 font-medium italic">No hay conversaciones activas</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <button 
                      key={c.conversationId}
                      onClick={() => setActiveChat(c)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-2xl transition-all group",
                        activeChat?.conversationId === c.conversationId ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm",
                        activeChat?.conversationId === c.conversationId ? "bg-white/20 text-white" : "bg-slate-900 border border-white/10 text-indigo-400"
                      )}>
                        {c.participant.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                         <div className="flex items-center justify-between mb-0.5">
                            <p className={cn("text-sm font-bold truncate", activeChat?.conversationId === c.conversationId ? "text-white" : "text-slate-200")}>
                              {c.participant.name}
                            </p>
                            <span className={cn("text-[9px] font-medium shrink-0", activeChat?.conversationId === c.conversationId ? "text-indigo-200" : "text-slate-500")}>
                              {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <p className={cn("text-xs truncate", activeChat?.conversationId === c.conversationId ? "text-indigo-100/70" : "text-slate-500")}>
                           {c.lastMessage.content}
                         </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                          {c.unreadCount}
                        </div>
                      )}
                    </button>
                  ))
                )}
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
                        {activeChat.participant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{activeChat.participant.name}</h3>
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
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar">
                   {loadingMessages ? (
                     <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                     </div>
                   ) : messages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-40 italic text-sm text-slate-500 py-20">
                         No hay mensajes en esta conversación
                      </div>
                   ) : (
                     <div className="flex flex-col gap-6">
                        {messages.map((m, i) => {
                          const isMe = m.senderId?._id 
                            ? m.senderId._id !== activeChat.participant._id
                            : m.senderId !== activeChat.participant._id;
                          
                          return (
                            <motion.div 
                              key={m._id || i}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={cn(
                                "flex flex-col max-w-[80%] gap-1",
                                isMe ? "self-end items-end" : "self-start items-start"
                              )}
                            >
                              <div className={cn(
                                "p-4 rounded-[24px] text-sm leading-relaxed shadow-xl",
                                isMe 
                                  ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-600/10" 
                                  : "bg-[#0f172a] text-slate-300 border border-white/5 rounded-bl-none"
                              )}>
                                {m.content}
                              </div>
                              <span className="text-[9px] text-slate-500 font-bold px-2">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                     </div>
                   )}
                </div>

                {/* Chat Input */}
                <div className="p-6 md:p-8 bg-[#0f172a]/50 border-t border-white/5">
                   <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                      <button type="button" className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-indigo-400 transition-all">
                         <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                         <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          disabled={sending}
                          className="w-full bg-slate-950 border border-white/10 rounded-[20px] py-4 px-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                         />
                         <button 
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                         >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                         </button>
                      </div>
                   </form>
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

