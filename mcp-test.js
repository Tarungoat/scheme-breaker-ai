const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");

const isWin = os.platform() === "win32";
const cmd = isWin ? "npx.cmd" : "npx";
const mcp = spawn(cmd, ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "sbp_b878d8e4e72943358190aaac1125b16dc91c40db"], {
  stdio: ["pipe", "pipe", "inherit"],
  shell: isWin
});

let buffer = "";
mcp.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep the last incomplete line
  for (const line of lines) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.id === 2 && parsed.result && parsed.result.tools) {
          fs.writeFileSync("tools.json", JSON.stringify(parsed.result.tools, null, 2));
          console.log("Wrote tools.json");
          mcp.kill();
          process.exit(0);
        }
      } catch (e) {}
    }
  }
});

const initReq = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};
mcp.stdin.write(JSON.stringify(initReq) + "\n");

setTimeout(() => {
  mcp.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    method: "notifications/initialized"
  }) + "\n");

  const toolsReq = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };
  mcp.stdin.write(JSON.stringify(toolsReq) + "\n");
}, 3000);
