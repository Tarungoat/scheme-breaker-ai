import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Fail loudly if key is missing
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "FATAL: Missing GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { studentImage, schemeImage } = await req.json();

    if (!studentImage || !schemeImage) {
      return NextResponse.json(
        { error: "Both student answer and mark scheme images are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a ruthless A-Level and Entrance Exam Examiner. Compare the student's handwritten answer to the official mark scheme. Calculate the total score. Explicitly state what required step, formula, or unit they assumed or omitted to lose marks. Output a strict gap analysis.

Format your output using markdown:
- Use **bold** for key findings
- Use headings (##) for sections like "Score", "Gap Analysis", "Missing Steps"
- Prefix lost marks with ❌ and earned marks with ✅
- Be brutally specific about what was missing`;

    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: studentImage.split(",")[1],
          mimeType: studentImage.split(";")[0].split(":")[1] || "image/jpeg",
        },
      },
      {
        inlineData: {
          data: schemeImage.split(",")[1],
          mimeType: schemeImage.split(";")[0].split(":")[1] || "image/jpeg",
        },
      },
      "Grade this student's handwritten answer against the provided mark scheme. Be ruthless.",
    ]);

    const breakdown = result.response.text();

    // Save to Supabase — non-blocking, don't fail the response if DB is down
    try {
      const supabase = getSupabase();
      const { error: dbError } = await supabase
        .from("breakdowns")
        .insert([{
          breakdown_text: breakdown,
          created_at: new Date().toISOString(),
        }]);

      if (dbError) {
        console.error("[Supabase] Insert failed:", dbError.message);
      }
    } catch (dbErr: unknown) {
      console.error("[Supabase] Connection failed:", dbErr);
    }

    return NextResponse.json({ breakdown });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Grade API] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
