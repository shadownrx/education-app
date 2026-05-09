import type { NextRequest } from "next/server";
import { groq } from "@/lib/groq";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import LessonPlan from "@/models/LessonPlan";
import { requireAuthRole, requireTeacherSubject } from "@/lib/apiAuth";
import { handleApiError, ValidationError } from "@/lib/errors";
import { aiPromptSchema, validateInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuthRole(request, "teacher", "student");
    const { prompt } = validateInput(aiPromptSchema, await request.json());
    const activeSubjectId = request.cookies.get("active_subject_id")?.value;

    if (!activeSubjectId) {
      throw new ValidationError("No active subject selected");
    }

    await dbConnect();
    const Subject = (await import("@/models/Subject")).default;
    const subject = await Subject.findById(activeSubjectId);
    if (!subject) throw new ValidationError("Subject not found");

    let contextData = "";
    if (token.role === "teacher") {
      await requireTeacherSubject(token.userId, activeSubjectId);
      const [students, lessons] = await Promise.all([
        Student.find({ subjectId: subject._id }),
        LessonPlan.find({ subjectId: subject._id }).sort({ week: 1 }),
      ]);
      const studentsContext = students
        .map((student) => `- ${student.name}: ${student.status}`)
        .join("\n");
      const lessonsContext = lessons
        .map((lesson) => `- Semana ${lesson.week}: ${lesson.title} (${lesson.status})`)
        .join("\n");
      
      contextData = `
ESTADO DE LOS ESTUDIANTES:
${studentsContext || "No hay estudiantes registrados aun."}

PLANIFICACION DE CLASES:
${lessonsContext || "No hay planes de clase registrados."}
      `;
    }

    const systemPrompt = `Eres un asistente inteligente integrado en la plataforma educativa "EduFlow".
Tu objetivo es ayudar al ${token.role === "teacher" ? "docente" : "alumno"} con insights precisos sobre su materia.

MATERIA ACTUAL: ${subject.name}
INSTITUCION: ${subject.institution}
${contextData}

INSTRUCCIONES PARA ${token.role === "teacher" ? "DOCENTE" : "ALUMNO"}:
${token.role === "teacher" 
  ? `1. Sé específico y utiliza los nombres de los alumnos si es relevante.
2. Ayuda a planificar clases y generar trabajos prácticos.
3. ACCIONES ESTRUCTURADAS (MUY IMPORTANTE):
   @@ACTION:{"type": "CREATE_ASSIGNMENT", "data": {...}}@@
   @@ACTION:{"type": "CREATE_LESSON_PLAN", "data": {...}}@@`
  : `1. Actúa como un tutor pedagógico.
2. Ayuda con dudas sobre la materia "${subject.name}".
3. Sé motivador y claro en tus explicaciones.`
}
5. Utiliza Markdown para legibilidad.`;

    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1536,
      top_p: 1,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
