const run = async () => {
  const query = `
-- Drop and recreate analyses table
DROP TABLE IF EXISTS analyses CASCADE;

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  exam_board TEXT,
  paper TEXT,
  question TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS logic
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analyses" 
ON analyses FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('essay_uploads', 'essay_uploads', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public access" ON storage.objects;
  DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
END $$;

CREATE POLICY "Public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'essay_uploads');

CREATE POLICY "Auth upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'essay_uploads' AND auth.role() = 'authenticated');
`;
  const res = await fetch("https://api.supabase.com/v1/projects/qeypbmdhhbvdsnjjczpn/query", {
    method: "POST",
    headers: {
      "Authorization": "Bearer sbp_b878d8e4e72943358190aaac1125b16dc91c40db",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  console.log(res.status, await res.text());
};
run();
