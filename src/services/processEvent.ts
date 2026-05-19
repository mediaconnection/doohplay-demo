import { createCanonicalEvent } from "@/domain/events/createEvent";
import { gerarHashEvento } from "@/domain/events/hashEvent";
import { persistEvent } from "@/services/persistEvent";

export async function processEvent() {
  const evento = createCanonicalEvent({
    event_type: "DOOH_EXECUTION",
    actor: { type: "SYSTEM", id: "dooh-engine" },
    context: { environment: "production", application: "dashboard-web" },
    payload: { screen_id: "SP-001", duration_seconds: 30 }
  });

  const hash = gerarHashEvento(evento);

  const proofUrl =
    `https://SEU-PROJETO.supabase.co/functions/v1/legal-proof/${hash}`;

  const result = await persistEvent({
    contentHash: hash,
    event: evento,
    issuedAt: new Date().toISOString(),
    proofUrl
  });

  return { hash, result };
}
