-- ═══════════════════════════════════════════════════════════════════
-- FASE 1 · PASSO 1 — Fundação de dados única
-- 100% aditivo. Não altera, não lê, não referencia nenhuma tabela
-- existente. Pode rodar em produção sem risco nenhum ao BARBE332.
-- Rodar manualmente no Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1) CAMPAIGNS — o "Insertion Order": quem está anunciando, em que janela
CREATE TABLE IF NOT EXISTS campaigns_v2 (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type    TEXT NOT NULL CHECK (owner_type IN ('dono','anunciante','rede','institucional','agencia')),
  owner_code    TEXT,                    -- client_code, código do anunciante, ou id da agência
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('draft','pending_review','active','paused','ended')),
  budget_cents  INTEGER,
  cpm_cents     INTEGER,
  flight_start  DATE,
  flight_end    DATE,
  source_table  TEXT,                    -- rastreabilidade: de onde essa linha veio na migração
  source_id     TEXT,                    -- id original na tabela de origem
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_v2_owner ON campaigns_v2 (owner_type, owner_code);

-- 2) CREATIVE_ASSETS — as peças, já com formato de exibição declarado
CREATE TABLE IF NOT EXISTS creative_assets_v2 (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       UUID NOT NULL REFERENCES campaigns_v2(id) ON DELETE CASCADE,
  name              TEXT,
  url               TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('image','video')),
  display_format    TEXT NOT NULL DEFAULT 'fullscreen'
                       CHECK (display_format IN
                         ('fullscreen','half_h','half_v','quarter','corner_overlay','bottom_bar')),
  width             INTEGER,
  height            INTEGER,
  duration_seconds  INTEGER NOT NULL DEFAULT 15,
  status            TEXT NOT NULL DEFAULT 'approved'
                       CHECK (status IN ('pending_review','approved','rejected')),
  source_table      TEXT,
  source_id         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creative_assets_v2_campaign ON creative_assets_v2 (campaign_id);

-- 3) INVENTORY_SEGMENTS — pacotes de tela (vazio por enquanto, Fase 2 preenche a lógica).
--    Criado agora só pra placements.segment_id já ter FK válida desde o início.
CREATE TABLE IF NOT EXISTS inventory_segments_v2 (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  criteria_json  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) PLACEMENTS — onde e quando cada peça toca. Substitui playlist_schedule
--    E institutional_media (agendamento) num único lugar.
CREATE TABLE IF NOT EXISTS placements_v2 (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_asset_id   UUID NOT NULL REFERENCES creative_assets_v2(id) ON DELETE CASCADE,
  screen_id           UUID REFERENCES client_screens(id),   -- alvo = 1 tela específica
  segment_id          UUID REFERENCES inventory_segments_v2(id), -- alvo = pacote de telas
  client_code         TEXT,                -- mantém compatibilidade com filtro por code direto
  position            INTEGER NOT NULL DEFAULT 0,
  start_date          DATE,
  end_date            DATE,
  start_time          TIME,                -- NULL = dia inteiro
  end_time            TIME,
  days_of_week        TEXT[],              -- NULL = todos os dias
  active              BOOLEAN NOT NULL DEFAULT TRUE,
  source_table        TEXT,
  source_id           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (screen_id IS NOT NULL OR segment_id IS NOT NULL OR client_code IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_placements_v2_creative ON placements_v2 (creative_asset_id);
CREATE INDEX IF NOT EXISTS idx_placements_v2_screen   ON placements_v2 (screen_id);
CREATE INDEX IF NOT EXISTS idx_placements_v2_client   ON placements_v2 (client_code);

-- Nota sobre o sufixo _v2: proposital. Enquanto a migração não for validada em
-- produção, as tabelas antigas (Campaign, CampaignMedia, CampaignScreen,
-- playlist_schedule, institutional_media) continuam sendo a fonte real que o
-- player lê. Só trocamos o código pra ler daqui depois do Passo de verificação
-- confirmar paridade de contagem. O rename para os nomes finais (sem _v2)
-- acontece no corte final, não antes.
