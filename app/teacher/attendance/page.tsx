"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  ChevronLeft,
  Calendar as CalendarIcon,
  Search,
  Check
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: "present" | "absent" | "late";
  name: string;
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}

function AttendanceContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late">>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (subjectId) {
      fetchStudents();
    }
  }, [subjectId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        
        // Initialize all as present by default
        const initialAttendance: Record<string, "present" | "absent" | "late"> = {};
        data.forEach((s: Student) => {
          initialAttendance[s._id] = "present";
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
        name: students.find(s => s._id === studentId)?.name || ""
      }));

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          date,
          records
        })
      });

      if (response.ok) {
        alert("Asistencia guardada con éxito");
      } else {
        alert("Error al guardar asistencia");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    present: Object.values(attendance).filter(s => s === "present").length,
    absent: Object.values(attendance).filter(s => s === "absent").length,
    late: Object.values(attendance).filter(s => s === "late").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href={`/teacher/dashboard?subjectId=${subjectId}`}
              className="flex items-center text-gray-400 hover:text-white transition-colors mb-2 group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Control de Asistencia
            </h1>
            <p className="text-gray-400 mt-1">
              {format(date, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>

          <button
            onClick={saveAttendance}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Guardar Asistencia
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Presentes</span>
            </div>
            <div className="text-2xl font-bold">{stats.present}</div>
          </div>
          <div className="bg-[#111] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Ausentes</span>
            </div>
            <div className="text-2xl font-bold">{stats.absent}</div>
          </div>
          <div className="bg-[#111] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Tardes</span>
            </div>
            <div className="text-2xl font-bold">{stats.late}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Students List */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 font-semibold text-gray-300">Alumno</th>
                  <th className="p-4 font-semibold text-gray-300 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {student.avatar ? (
                            <img src={student.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(student._id, "present")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            attendance[student._id] === "present"
                              ? "bg-green-500/20 text-green-500 ring-1 ring-green-500/50"
                              : "bg-white/5 text-gray-500 hover:bg-white/10"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          Presente
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, "absent")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            attendance[student._id] === "absent"
                              ? "bg-red-500/20 text-red-500 ring-1 ring-red-500/50"
                              : "bg-white/5 text-gray-500 hover:bg-white/10"
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          Ausente
                        </button>
                        <button
                          onClick={() => handleStatusChange(student._id, "late")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            attendance[student._id] === "late"
                              ? "bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/50"
                              : "bg-white/5 text-gray-500 hover:bg-white/10"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          Tarde
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
