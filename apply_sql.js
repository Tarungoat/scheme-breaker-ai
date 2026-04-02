const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");

const sql = `
-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  essay_text TEXT,
  image_url TEXT,
  exam_board TEXT,
  paper TEXT,
  question_number TEXT,
  level_score INT,
  feedback_json JSONB,
  tokens_used INT
);

-- Create usage_limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  analyses_today INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Note: DROP POLICY first to ensure idempotency when rerunning
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own analyses" ON analyses;
  DROP POLICY IF EXISTS "Users can manage their own usage limits" ON usage_limits;
END $$;

CREATE POLICY "Users can manage their own analyses" 
ON analyses FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own usage limits"
ON usage_limits FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
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
