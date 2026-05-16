// src/lib/logging/logEvent.ts

import { LOG_EVENT_TYPES, LogEventType } from "./logEventTypes";
import { db } from "@/lib/db"; // ajuste para seu client real

/**
 * Entrada mínima para um evento de log.
 * Log é fato histórico: nunca será alterado.
 */
export type LogEventInput = {
  event_type?: LogEventType;
  type?: string;
  level?: string;
  message?: string;
  entity_id?: string;
  entity_type?: string;
  source?: string;
  campaign_id?: string | null;
  player_id?: string | null;
  execution_id?: string | null;
  metadata?: Record<string, any> | null;
};

/**
 * Registra um evento imutável no sistema.
 * INSERT ONLY. Nunca atualizar ou deletar.
 */
export async function logEvent(input: LogEventInput): Promise<void> {
  if (!input.event_type) {
    throw new Error("logEvent: event_type é obrigatório");
  }

  await db.query(
    `
    INSERT INTO log_events (
      event_type,
      campaign_id,
      player_id,
      execution_id,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      input.event_type,
      input.campaign_id ?? null,
      input.player_id ?? null,
      input.execution_id ?? null,
      input.metadata ?? null,
    ]
  );
}
