"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD-uPkVm9WV0GlR5wwNCR2Wnq8lLGk9qo4";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function explainMarkPoints(question: string, markScheme: string) {
  if (!question || !markScheme) {
    throw new Error("Missing question or mark scheme.");
  }

  const prompt = `
    You are an expert A-Level examiner and tutor. 
    Analyze the following exam question and its mark scheme. 
    Break down每一个 (every) mark point into simple, plain language that a student would understand.
    Explain *exactly* what the student needs to write to gain that mark, avoiding technical jargon and highlighting common pitfalls.
    
    Question:
    ${question}
    
    Mark Scheme:
    ${markScheme}
    
    Output Format:
    Return your response as a JSON array of objects. Each object should have two fields: "point" (the mark point title or number) and "explanation" (your simplified breakdown).
    
    Example:
    [
      { "point": "Mark 1", "explanation": "Explain that the temperature increases because kinetic energy of particles increases." },
      ...
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON from the response text (handling potential markdown formatting)
    const jsonStr = responseText.substring(
      responseText.indexOf('['),
      responseText.lastIndexOf(']') + 1
    );
    
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("AI Error:", err);
    throw new Error("Decoding failed. Please try again.");
  }
}
