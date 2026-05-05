import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { groq } from "@/lib/groq";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Subject from "@/models/Subject";
import LessonPlan from "@/models/LessonPlan";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const cookieStore = await cookies();
    const activeSubjectId = cookieStore.get("active_subject_id")?.value;

    if (!activeSubjectId) {
      return NextResponse.json(
        { response: "No tengo contexto de qué materia estamos hablando. Por favor, selecciona una materia primero." },
        { status: 400 }
      );
    }

    await dbConnect();

    const [subject, students, lessons] = await Promise.all([
      Subject.findById(activeSubjectId),
      Student.find({ subjectId: activeSubjectId }),
      LessonPlan.find({ subjectId: activeSubjectId }).sort({ week: 1 })
    ]);

    if (!subject) {
      return NextResponse.json({ response: "La materia seleccionada no existe." }, { status: 404 });
    }

    const studentsContext = students.map(s => `- ${s.name}: ${s.status}`).join("\n");
    const lessonsContext = lessons.map(l => `- Semana ${l.week}: ${l.title} (${l.status})`).join("\n");

    const systemPrompt = `Eres un asistente inteligente integrado en la plataforma educativa "EduFlow".
Tu objetivo es ayudar al docente con insights precisos sobre su clase.

MATERIA ACTUAL: ${subject.name}
INSTITUCIÓN: ${subject.institution}

ESTADO DE LOS ESTUDIANTES:
${studentsContext || "No hay estudiantes registrados aún."}

PLANIFICACIÓN DE CLASES:
${lessonsContext || "No hay planes de clase registrados."}

INSTRUCCIONES DE FORMATO:
1. Sé específico y utiliza los nombres de los alumnos si es relevante.
2. Utiliza Markdown para legibilidad.

3. ACCIONES ESTRUCTURADAS (MUY IMPORTANTE):
   Si sugieres crear un Trabajo Práctico (TP), DEBES incluir la consigna completa en el campo "description".
   Formato exacto al final de tu respuesta:
   @@ACTION:{"type": "CREATE_ASSIGNMENT", "data": {"title": "Título corto", "deadline": "YYYY-MM-DD", "description": "CONSIGNA DETALLADA AQUÍ (incluye objetivos, tareas y criterios)"}}@@

   Si sugieres un Plan de Clase:
   @@ACTION:{"type": "CREATE_LESSON_PLAN", "data": {"title": "Título", "week": 1, "topics": ["Tema 1", "Tema 2"], "date": "YYYY-MM-DD"}}@@

   Si das feedback:
   @@ACTION:{"type": "FEEDBACK", "data": {"studentName": "Nombre", "text": "Mensaje de feedback"}}@@

IMPORTANTE: El campo "description" en CREATE_ASSIGNMENT es obligatorio y debe contener el contenido pedagógico del trabajo.`;

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
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("GROQ_AI_STREAM_ERROR:", error.message || error);
    return NextResponse.json(
      { response: `Error de la IA: ${error.message || "Error desconocido"}.` },
      { status: 500 }
    );
  }
}
