import { openOrUpdateAlert } from "@/core/alerts/openOrUpdateAlert";

async function run() {
  const sourceId = "22222222-2222-2222-2222-222222222222";

  console.log("🚨 Criando alerta...");
  await openOrUpdateAlert({
    type: "PLAYER_OFFLINE",
    sourceId,
    metadata: { offline_minutes: 10 }
  });

  console.log("🔁 Chamando de novo (não deve criar outro)");
  await openOrUpdateAlert({
    type: "PLAYER_OFFLINE",
    sourceId,
    metadata: { offline_minutes: 15 }
  });

  console.log("✅ Teste concluído");
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Erro no teste", err);
    process.exit(1);
  });
