import { NextRequest, NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";

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
      // PGRST116 means zero rows returned, which is fine
      console.error("Usage limit error:", usageError);
      return NextResponse.json({ error: "Failed to verify usage limit" }, { status: 500 });
    }

    const currentAnalyses = usageLimit?.analyses_today || 0;

    if (currentAnalyses >= 3) {
      return NextResponse.json(
        { error: "You've hit your daily limit of 3 analyses." },
        { status: 429 }
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

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Str = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    
    // Pixtral call
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      return NextResponse.json({ error: "MISTRAL_API_KEY is missing." }, { status: 500 });
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "system",
            content: "You are an expert GCSE English examiner. The student will upload a handwritten essay answer. Apply the official AQA/relevant board level descriptor grid. Return ONLY valid JSON with these fields: current_level (number 1-4), level_descriptor_hit (string), level_descriptor_missing (string), three_edits (array of 3 strings). No other text."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Please analyse this answer. Board: ${board}, Paper: ${paper}, Question: ${question}` },
              { type: "image_url", image_url: `data:${mimeType};base64,${base64Str}` }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Mistral API error:", err);
      // fallback if pixtral-12b-2409 or mistral-pixtral-latest lacks format/url support
      return NextResponse.json({ error: "Failed to analyze image via Mistral Pixtral AI." }, { status: 500 });
    }

    const data = await response.json();
    let contentStr = data.choices[0].message.content;

    // Clean markdown code blocks if any
    if (contentStr.startsWith('```json')) {
      contentStr = contentStr.replace(/```json\n?/, '').replace(/```\n?/, '');
    }
    
    const analysisResult = JSON.parse(contentStr);

    // 3. Save result
    const { error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        exam_board: board,
        paper: paper,
        question: question,
        result: analysisResult,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Failed saving analysis:", insertError);
    }

    // Increment usage _after_ everything is successful
    if (!usageLimit) {
      await supabase.from('usage_limits').insert({ user_id: userId, analyses_today: 1 });
    } else {
      await supabase.from('usage_limits')
        .update({ analyses_today: currentAnalyses + 1 })
        .eq('user_id', userId);
    }

    return NextResponse.json({ result: analysisResult });

  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
