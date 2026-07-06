-- Fase 8 · Proof-of-play real — "segundo a segundo, sem dado simulado"
-- (princípio não-negociável da Visão do projeto). Tabela própria e nova,
-- não escreve em event_chain/blockchain_anchor (não conhecemos a lógica
-- de hash/assinatura que esse sistema espera — arriscado escrever lá sem
-- entender o pipeline pretendido). Isso pode virar a FONTE de dado real
-- pro sistema de blockchain no futuro, sem eu ter adivinhado a arquitetura.

CREATE TABLE IF NOT EXISTS play_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code        TEXT NOT NULL,
  screen_player_id   TEXT,             -- player_id do aparelho físico, quando disponível
  media_id           TEXT,             -- id da mídia (creative_assets_v2, CampaignMedia ou institutional_media)
  media_name         TEXT,
  media_type         TEXT,             -- 'image' | 'video'
  slot_category      TEXT,             -- 'dono' | 'anunciante' | 'rede' | 'institucional'
  duration_seconds   NUMERIC,          -- duração real configurada pro slide
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_play_log_client ON play_log (client_code, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_log_media  ON play_log (media_id, started_at DESC);
