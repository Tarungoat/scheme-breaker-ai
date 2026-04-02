const run = async () => {
  const query = "SELECT 1;";
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
