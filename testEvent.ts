const { randomUUID, createHash } = require("crypto");
const stringify = require("json-stable-stringify");

// Tipos explícitos
type CanonicalEvent = {
  schema_version: "1.0";
  event_id: string;
  occurred_at: string;
  event_type: string;
  actor: {
    type: "SYSTEM" | "USER" | "SERVICE";
    id: string;
  };
  context: {
    environment: "production" | "staging" | "development";
    application: string;
  };
  payload: Record<string, unknown>;
};

// Cria o evento canônico
function createCanonicalEvent(
  input: Omit<CanonicalEvent, "schema_version" | "event_id" | "occurred_at">
): CanonicalEvent {
  return {
    schema_version: "1.0",
    event_id: randomUUID(),
    occurred_at: new Date().toISOString(),
    ...input
  };
}

// Gera hash determinístico
function gerarHashEvento(evento: CanonicalEvent): string {
  const canonical = stringify(evento);

  if (typeof canonical !== "string") {
    throw new Error("Falha ao canonicalizar o evento");
  }

  return createHash("sha256").update(canonical).digest("hex");
}

// ===== TESTE =====

const evento = createCanonicalEvent({
  event_type: "DOOH_EXECUTION",
  actor: { type: "SYSTEM", id: "dooh-engine" },
  context: { environment: "production", application: "dashboard-web" },
  payload: {
    screen_id: "SP-001",
    duration_seconds: 30
  }
});

const hash = gerarHashEvento(evento);

console.log("EVENTO CANÔNICO:");
console.log(evento);

console.log("\nHASH SHA-256:");
console.log(hash);
