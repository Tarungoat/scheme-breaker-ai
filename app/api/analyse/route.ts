import { NextRequest, NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    // 1. Check usage limits
    const { data: usageLimit, error: usageError } = await supabase
      .from('usage_limits')
      .select('analyses_today')
      .eq('user_id', userId)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error("Usage limit error:", usageError);
    }

    const currentAnalyses = usageLimit?.analyses_today || 0;

    if (currentAnalyses >= 10) { // Increased limit for testing, or keep at 3
      return NextResponse.json(
        { error: "You've hit your daily limit of 10 analyses." },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const board = formData.get('board') as string;
    const paper = formData.get('paper') as string;
    const question = formData.get('question') as string;

    if (!file || !board || !paper || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // 4. Prepare Mark Scheme context
    const schemeKey = `${board}-${paper}-${question}`;
    const specificScheme = MARK_SCHEMES[schemeKey] || "Apply standard GCSE grading criteria for this exam board and question.";

    // 5. Call Gemini Vision
    try {
      // Use gemini-2.0-flash which supports image input
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        You are an expert GCSE examiner for ${board}. 
        Analyze the student's handwritten answer for ${paper}, ${question}.
        
        MARK SCHEME CONTEXT:
        ${specificScheme}
        
        TASK:
        1. Read the handwriting precisely.
        2. Evaluate the answer against the mark scheme.
        3. Provide specific, actionable feedback.
        
        OUTPUT FORMAT (Strict JSON):
        {
          "current_level": <number, 1-9 for GCSE grades or 1-4 for AQA levels depending on question marks>,
          "missing_elements": "A concise paragraph explaining what was missing or what could be better",
          "3_specific_fixes": ["Fix 1...", "Fix 2...", "Fix 3..."]
        }
        
        Return ONLY the JSON object.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown formatting
      text = text.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
      
      const analysisResult = JSON.parse(text);

      // 6. Upload to Supabase Storage (Optional but good for history)
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

      // 7. Save to DB
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

      // 8. Update usage
      if (!usageLimit) {
        await supabase.from('usage_limits').insert({ user_id: userId, analyses_today: 1 });
      } else {
        await supabase.from('usage_limits')
          .update({ analyses_today: currentAnalyses + 1 })
          .eq('user_id', userId);
      }

      return NextResponse.json({ result: analysisResult, image_url: publicUrl });

    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      return NextResponse.json({ error: "AI Analysis failed. Please try a clearer image." }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("Detailed server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

