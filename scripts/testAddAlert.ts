import { Queue } from "bullmq";

const queue = new Queue("alerts", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

async function run() {
  const job = await queue.add("alert", {
    alertId: "alert-123",
    channel: "email",
    target: "admin@doohplay.com",
    message: "Player offline há mais de 15 minutos",
  });

  console.log("🎯 Job criado:", job.id);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Erro ao criar job", err);
  process.exit(1);
});
