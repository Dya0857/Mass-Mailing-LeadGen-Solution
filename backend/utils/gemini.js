import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateWithGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
