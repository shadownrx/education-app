import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateJSON(prompt: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const response = result.response;
  return JSON.parse(response.text());
}
