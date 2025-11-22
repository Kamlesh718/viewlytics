import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return Response.json({ text: response.text });
}
