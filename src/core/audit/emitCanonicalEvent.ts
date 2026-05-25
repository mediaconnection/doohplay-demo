// @ts-nocheck
import crypto from "crypto";
import { CanonicalEvent } from "./canonicalEvent";
import { hashPayload, hashEvent } from "./eventHasher";
import {
  getLastEventHash,
  saveEvent
} from "./eventChainRepository";

/**
 * Parâmetros canônicos para emissão de evento auditável
 */
type EmitCanonicalEventParams = {
  event_type: string;
  source_table: string;
  source_id: string;

  device_id?: string | null;
  campaign_id?: string | null;

  /**
   * Permite idempotência
   */
  event_id?: string;

  /**
   * Timestamp opcional
   */
  occurred_at?: string;

  /**
   * Payload usado apenas para gerar payload_hash
   */
  payload: Record<string, unknown>;
};

/**
 * Emite um evento canônico imutável e o anexa à cadeia
 */
export async function emitCanonicalEvent(
  params: EmitCanonicalEventParams
): Promise<CanonicalEvent> {

  console.log("🔥 emitCanonicalEvent START", params.event_type);

  /**
   * Timestamp canônico
   */
  const occurred_at =
    params.occurred_at ?? new Date().toISOString();

  /**
   * Event ID idempotente
   */
  const event_id =
    params.event_id ??
    crypto
      .createHash("sha256")
      .update(
        `${params.event_type}:${params.source_table}:${params.source_id}:${occurred_at}`
      )
      .digest("hex");

  /**
   * Hash do evento anterior
   */
  let previous_event_hash: string | null = null;

  try {
    previous_event_hash = await getLastEventHash();
  } catch (err) {
    console.warn(
      "⚠️ getLastEventHash failed, starting new chain",
      err
    );
  }

  /**
   * Hash determinístico do payload
   */
  const payload_hash = hashPayload(params.payload);

  /**
   * Hash do evento
   */
  const event_hash = hashEvent({
    event_type: params.event_type,
    source_table: params.source_table,
    source_id: params.source_id,
    payload_hash,
    previous_event_hash,
    occurred_at
  });

  /**
   * Evento final
   */
  const event: CanonicalEvent = {
    event_id,

    event_type: params.event_type,
    source_table: params.source_table,
    source_id: params.source_id,

    device_id: params.device_id ?? null,
    campaign_id: params.campaign_id ?? null,

    occurred_at,
    payload_hash,
    previous_event_hash,
    event_hash,

    signature: "DOOHPLAY_SYSTEM_v1"
  };

  /**
   * Persistência
   */
  await saveEvent(event);

  console.log("✅ emitCanonicalEvent OK", event.event_id);

  return event;
}
