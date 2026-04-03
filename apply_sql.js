const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");

const sql = `
-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('essay_uploads', 'essay_uploads', true) ON CONFLICT (id) DO NOTHING;

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

-- Storage policies
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

const cmd = os.platform() === "win32" ? "npx.cmd" : "npx";
const mcp = spawn(cmd, ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "sbp_b878d8e4e72943358190aaac1125b16dc91c40db"], {
  stdio: ["pipe", "pipe", "inherit"],
  shell: os.platform() === "win32"
});

mcp.stdout.on("data", (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id === 3) {
          console.log("SQL EXECUTION RESULT:", JSON.stringify(parsed, null, 2));
          mcp.kill();
          process.exit(0);
        }
      } catch (e) {}
    }
  }
});

const initReq = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } } };
mcp.stdin.write(JSON.stringify(initReq) + "\n");

setTimeout(() => {
  mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  const execReq = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "execute_sql",
      arguments: {
        project_id: "qeypbmdhhbvdsnjjczpn",
        query: sql
      }
    }
  };
  mcp.stdin.write(JSON.stringify(execReq) + "\n");
}, 3000);
