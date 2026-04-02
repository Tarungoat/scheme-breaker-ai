const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://qeypbmdhhbvdsnjjczpn.supabase.co", "sb_publishable_X1a0JXGXpAjOn2oJjEWRpg_GE8Xk3o3");
async function check() {
  const { data, error } = await supabase.from("analyses").select("*").limit(1);
  console.log("data:", data, "error:", error);
}
check();
