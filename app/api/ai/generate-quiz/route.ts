import { NextResponse, NextRequest } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { requireAuthRole } from "@/lib/apiAuth";
import { handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    await requireAuthRole(request, "teacher");

    const { topic, level, numQuestions } = await request.json();

    const prompt = `Genera un cuestionario de opción múltiple sobre el tema: "${topic}".
    Nivel académico: ${level}.
    Cantidad de preguntas: ${numQuestions}.
    
    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "questions": [
        {
          "question": "Texto de la pregunta",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctAnswer": 0
        }
      ]
    }
    
    Asegúrate de que las preguntas sean pedagógicas y variadas. La respuesta debe ser un JSON válido.`;

    const result = await generateJSON(prompt);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
