"use client";

import { useState, Suspense } from "react";
import { 
  Bot, 
  Sparkles, 
  ChevronLeft, 
  Plus, 
  Save, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <QuizGeneratorContent />
    </Suspense>
  );
}

function QuizGeneratorContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Secundaria");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateQuiz = async () => {
    if (!topic) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, numQuestions })
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        alert("Error al generar el cuestionario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setGenerating(false);
    }
  };

  const saveAsAssignment = async () => {
    setSaving(true);
    try {
      const description = questions.map((q, i) => 
        `${i+1}. ${q.question}\n${q.options.map((o, j) => `   ${String.fromCharCode(97 + j)}) ${o}`).join("\n")}`
      ).join("\n\n");

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Cuestionario IA: ${topic}`,
          description,
          subjectId,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          broadcast: true // Send to all students
        })
      });

      if (response.ok) {
        alert("Cuestionario guardado como Trabajo Práctico para todos los alumnos");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href={`/teacher/dashboard?subjectId=${subjectId}`}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
              Generador de Quizzes IA
            </h1>
            <p className="text-gray-400 text-sm">Crea exámenes y trabajos prácticos en segundos con IA.</p>
          </div>
        </div>

        {/* Config Panel */}
        <div className="bg-[#111] border border-white/5 rounded-[32px] p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Tema del Examen</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Fotosíntesis, Revolución Francesa..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nivel Académico</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
              >
                <option>Primaria</option>
                <option>Secundaria</option>
                <option>Universitario</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cantidad de Preguntas: {numQuestions}</label>
              <input 
                type="range" 
                min="3" 
                max="10" 
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <button
              onClick={generateQuiz}
              disabled={generating || !topic}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generar Cuestionario
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Preguntas Generadas
                </h2>
                <button
                  onClick={saveAsAssignment}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Save className="w-4 h-4" />
                  Convertir en Tarea
                </button>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <p className="font-bold text-lg mb-4">{i + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((option, j) => (
                      <div 
                        key={j}
                        className={`p-3 rounded-xl border ${
                          j === q.correctAnswer 
                            ? "bg-green-500/10 border-green-500/30 text-green-400" 
                            : "bg-white/5 border-white/5 text-gray-400"
                        }`}
                      >
                        <span className="font-black mr-2">{String.fromCharCode(65 + j)}.</span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {generating && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Bot className="w-12 h-12 text-indigo-500 animate-bounce mb-4" />
            <p className="text-xl font-bold">Pensando las preguntas...</p>
            <p className="text-gray-500 text-sm mt-2">Nuestra IA está diseñando un examen pedagógico para vos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
