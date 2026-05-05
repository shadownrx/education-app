import Groq from "groq-sdk";
import { ENV } from "./env";

if (!ENV.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not set in environment variables.");
}

export const groq = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});
