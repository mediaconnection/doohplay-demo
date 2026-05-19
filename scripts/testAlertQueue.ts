import { alertQueue } from "../src/lib/queue/alertQueue";

async function run() {
  const job = await alertQueue.add(
    "send-alert",
    {
      alertId: "alert-123",
      channel: "email",
      target: "admin@doohplay.com",
      message: "Player offline há mais de 5 minutos",
    },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  console.log("🚀 Job criado:", job.id);
}

run();
