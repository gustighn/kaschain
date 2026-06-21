import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-pro";

let genAI;
let model;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: modelName });
  }
} catch (error) {
  console.warn("Gemini API not properly initialized. Check VITE_GEMINI_API_KEY in .env");
}

export const extractTransactionData = async (userInput) => {
  if (!model) throw new Error("Gemini AI is not initialized. Please set VITE_GEMINI_API_KEY.");
  
  const SYSTEM_PROMPT = `
  Extract financial transaction from this message to JSON:
  { "flow": "income|expense", "amount": number, "description": string, "category": string }
  Return ONLY JSON without markdown format.
  `;
  
  try {
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nPesan: ${userInput}`);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error extracting transaction:", error);
    throw new Error(`AI Error: ${error.message || "Failed to extract transaction data"}`);
  }
};
