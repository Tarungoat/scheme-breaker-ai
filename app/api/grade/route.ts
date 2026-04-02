import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

// OpenRouter client using OpenAI-compatible SDK
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://schemebreaker.ai",
    "X-Title": "SchemeBreaker AI",
  },
});

const SYSTEM_PROMPT = `You are an elite A-Level Examiner. Use your OCR capabilities to read the student's answer and compare it to the official mark scheme. Identify omitted units, missing steps, or incorrect formulas.

Format your response in markdown:
## Score
State the total marks awarded vs total available (e.g. **4/6 marks**)

## ✅ Awarded Marks
List each mark point the student correctly demonstrated

## ❌ Gap Analysis — Lost Marks
Be brutally specific about every mark lost:
- What was omitted (step, unit, formula, keyword)
- Why it costs marks per the mark scheme

## 📋 Verdict
One paragraph summary. Be direct. No comfort.`;

// Model cascade: try NVIDIA first, then fallback options
const MODEL_CASCADE = [
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "google/gemma-3-27b-it:free",
  "openrouter/auto",
];

async function gradeWithModel(
  modelId: string,
  studentBase64: string,
  studentMime: string,
  schemeBase64: string,
  schemeMime: string
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model: modelId,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: SYSTEM_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${studentMime};base64,${studentBase64}` },
          },
          {
            type: "image_url",
            image_url: { url: `data:${schemeMime};base64,${schemeBase64}` },
          },
          {
            type: "text",
            text: "Grade this student's answer against the mark scheme. Apply the marking criteria ruthlessly.",
          },
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0.1,
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) throw new Error(`Model ${modelId} returned empty response`);
  return text;
}

export async function POST(req: Request) {
  try {
    // Guard: env vars
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "FATAL: Missing OPENROUTER_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const { studentImage, schemeImage } = await req.json();

    if (!studentImage || !schemeImage) {
      return NextResponse.json(
        { error: "Both student answer and mark scheme images are required." },
        { status: 400 }
      );
    }

    // Parse data URLs → base64 + mimeType
    const studentMime =
      studentImage.split(";")[0].split(":")[1] || "image/jpeg";
    const studentBase64 = studentImage.split(",")[1];
    const schemeMime = schemeImage.split(";")[0].split(":")[1] || "image/jpeg";
    const schemeBase64 = schemeImage.split(",")[1];

    // Try each model in cascade
    let breakdown: string | null = null;
    let lastError: string = "";
    let usedModel = "";

    for (const modelId of MODEL_CASCADE) {
      try {
        console.log(`[Grade] Trying model: ${modelId}`);
        breakdown = await gradeWithModel(
          modelId,
          studentBase64,
          studentMime,
          schemeBase64,
          schemeMime
        );
        usedModel = modelId;
        break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[Grade] Model ${modelId} failed: ${lastError}`);
      }
    }

    if (!breakdown) {
      return NextResponse.json(
        { error: `All models failed. Last error: ${lastError}` },
        { status: 502 }
      );
    }

    console.log(`[Grade] Success with model: ${usedModel}`);

    // Save to Supabase — non-blocking
    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase
        .from("breakdowns")
        .insert([{
          breakdown_text: breakdown,
          model_used: usedModel,
          created_at: new Date().toISOString(),
        }]);

      if (dbError) console.error("[Supabase] Insert failed:", dbError.message);
    } catch (dbErr: unknown) {
      console.error("[Supabase] Connection failed:", dbErr);
    }

    return NextResponse.json({ breakdown, model: usedModel });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Grade API] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
