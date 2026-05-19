async function check() {
  try {
    // 🔧 Porta configurável (3000 / 3001 / produção)
    const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";

    const res = await fetch(
      `${baseUrl}/api/alerts/players/offline`
    );

    // 🚨 Se não for HTTP 200, não tenta parsear JSON
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Erro HTTP:", res.status, text);
      return;
    }

    const players = await res.json();

    if (Array.isArray(players) && players.length > 0) {
      console.log("🚨 Players offline:", players);
    } else {
      console.log("✅ Nenhum player offline");
    }

  } catch (error) {
    console.error("❌ Falha ao checar players offline:", error);
  }
}

check();
