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
    const token = await requireAuthRole(request, "teacher");
    const { prompt } = validateInput(aiPromptSchema, await request.json());
    const activeSubjectId = request.cookies.get("active_subject_id")?.value;

    if (!activeSubjectId) {
      throw new ValidationError("No active subject selected");
    }

    await dbConnect();
    const subject = await requireTeacherSubject(token.userId, activeSubjectId);

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

    const systemPrompt = `Eres un asistente inteligente integrado en la plataforma educativa "EduFlow".
Tu objetivo es ayudar al docente con insights precisos sobre su clase.

MATERIA ACTUAL: ${subject.name}
INSTITUCION: ${subject.institution}

ESTADO DE LOS ESTUDIANTES:
${studentsContext || "No hay estudiantes registrados aun."}

PLANIFICACION DE CLASES:
${lessonsContext || "No hay planes de clase registrados."}

INSTRUCCIONES DE FORMATO:
1. Se especifico y utiliza los nombres de los alumnos si es relevante.
2. Utiliza Markdown para legibilidad.

3. ACCIONES ESTRUCTURADAS (MUY IMPORTANTE):
   Si sugieres crear un Trabajo Practico (TP), DEBES incluir la consigna completa en el campo "description".
   Formato exacto al final de tu respuesta:
   @@ACTION:{"type": "CREATE_ASSIGNMENT", "data": {"title": "Titulo corto", "deadline": "YYYY-MM-DD", "description": "CONSIGNA DETALLADA AQUI (incluye objetivos, tareas y criterios)"}}@@

   Si sugieres un Plan de Clase:
   @@ACTION:{"type": "CREATE_LESSON_PLAN", "data": {"title": "Titulo", "week": 1, "topics": ["Tema 1", "Tema 2"], "date": "YYYY-MM-DD"}}@@

   Si das feedback:
   @@ACTION:{"type": "FEEDBACK", "data": {"studentName": "Nombre", "text": "Mensaje de feedback"}}@@

IMPORTANTE: El campo "description" en CREATE_ASSIGNMENT es obligatorio y debe contener el contenido pedagogico del trabajo.`;

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
