import { NextRequest, NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://schemebreaker.ai",
    "X-Title": "SchemeBreaker AI",
  },
});

const MARK_SCHEMES: Record<string, string> = {
  "AQA-English Language Paper 1-Q1": "4 marks. Identify and interpret explicit and implicit information and ideas. Students should list four distinct things they learn from the specified part of the source.",
  "AQA-English Language Paper 1-Q2": "8 marks. Explain, comment on and analyse how writers use language to achieve effects and influence readers, using relevant subject terminology. Focus on words, phrases, language features, and sentence forms.",
  "AQA-English Language Paper 1-Q3": "8 marks. Explain, comment on and analyse how writers use structure to achieve effects and influence readers, using relevant subject terminology. Focus on structural features like paragraphing, shifts in focus, and introduction/conclusion.",
  "AQA-English Language Paper 1-Q4": "20 marks. Evaluate texts critically and support this with appropriate textual references. Evaluate how far the student agrees with a statement, exploring the writer's methods.",
  "AQA-English Language Paper 1-Q5": "40 marks. Communicate clearly, effectively and imaginatively, selecting and adapting tone, style and register for different forms, purposes and audiences. Organise information and ideas, using structural and grammatical features to support coherence and cohesion of texts. (24 marks for content/organisation, 16 marks for technical accuracy).",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const { data: usageLimit, error: usageError } = await supabase
      .from('usage_limits')
      .select('analyses_today')
      .eq('user_id', userId)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error("Usage limit error:", usageError);
    }

    const currentAnalyses = usageLimit?.analyses_today || 0;

    if (currentAnalyses >= 10) {
      return NextResponse.json(
        { error: "You've hit your daily limit of 10 analyses." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const board = formData.get('board') as string;
    const paper = formData.get('paper') as string;
    const question = formData.get('question') as string;

    if (!file || !board || !paper || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const schemeKey = `${board}-${paper}-${question}`;
    const specificScheme = MARK_SCHEMES[schemeKey] || "Apply standard GCSE grading criteria for this exam board and question.";

    try {
      const response = await openrouter.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct-miro FREE",
        messages: [
          {
            role: "system",
            content: `You are an expert ${board} examiner. Analyze the student's handwritten answer for ${paper}, ${question}.
            
MARK SCHEME CONTEXT:
${specificScheme}

Respond ONLY with valid JSON in this exact format:
{"current_level": 3, "missing_elements": "what was missing", "3_specific_fixes": ["fix1", "fix2", "fix3"]}`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Grade this handwritten essay and respond with only JSON." },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Data}` }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      let text = response.choices?.[0]?.message?.content || "";
      
      text = text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
      
      const analysisResult = JSON.parse(text);

      let publicUrl = "";
      try {
        const fileName = `${userId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('essay_uploads')
          .upload(fileName, arrayBuffer, {
            contentType: mimeType,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('essay_uploads')
            .getPublicUrl(fileName);
          publicUrl = publicUrlData.publicUrl;
        }
      } catch (uploadErr) {
        console.error("Storage upload failed (non-critical):", uploadErr);
      }

      const { error: insertError } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          exam_board: board,
          paper: paper,
          question: question,
          ai_feedback: analysisResult,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Failed saving analysis:", insertError);
      }

      if (!usageLimit) {
        await supabase.from('usage_limits').insert({ user_id: userId, analyses_today: 1 });
      } else {
        await supabase.from('usage_limits')
          .update({ analyses_today: currentAnalyses + 1 })
          .eq('user_id', userId);
      }

      return NextResponse.json({ result: analysisResult, image_url: publicUrl });

    } catch (apiError) {
      console.error("AI API Error:", apiError);
      return NextResponse.json({ error: "AI Analysis failed. Please try a clearer image." }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Detailed server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
