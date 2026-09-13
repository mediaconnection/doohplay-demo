-- Alerta proativo de tela offline via WhatsApp (2026-09-13) — ver
-- STATUS_PROJETO.md, "Investigação — Alerta proativo de tela offline via
-- WhatsApp". Threshold configurável por cliente (default 45min, calibrado
-- pro padrão real de queda curta/frequente do BARBE332 -- 30min ainda
-- pegaria flutuação normal de rede).
ALTER TABLE studio_clients
  ADD COLUMN IF NOT EXISTS offline_alert_threshold_min INTEGER NOT NULL DEFAULT 45;

-- Uma linha "aberta" (recovered_at IS NULL) por incidente de queda --
-- fecha quando o player volta a pingar dentro do threshold. Evita repetir
-- o mesmo alerta a cada checagem enquanto a tela continuar offline.
CREATE TABLE IF NOT EXISTS screen_offline_incidents (
  id SERIAL PRIMARY KEY,
  player_id UUID NOT NULL,
  client_code TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_alerted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_screen_offline_incidents_open
  ON screen_offline_incidents (player_id)
  WHERE recovered_at IS NULL;
