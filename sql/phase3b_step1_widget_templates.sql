-- Fase 3b · Templates com widgets de dados (clima/bolsa/notícias)
-- Aditivo, zero impacto no que já existe.

-- Configuração de template por tela ou por cliente inteiro (screen_id NULL = todas as telas do cliente)
CREATE TABLE IF NOT EXISTS screen_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code    TEXT NOT NULL,
  screen_id      UUID REFERENCES client_screens(id),  -- NULL = todas as telas do cliente
  template_key   TEXT NOT NULL DEFAULT 'fullscreen'
                   CHECK (template_key IN ('fullscreen', 'magazine')),
  widgets        TEXT[] NOT NULL DEFAULT '{}',  -- ex: ARRAY['weather','stocks','news']
  location_lat   NUMERIC,
  location_lon   NUMERIC,
  location_name  TEXT,                           -- ex: "São Paulo, SP"
  stock_tickers  TEXT[] DEFAULT ARRAY['IBOV'],    -- ex: ARRAY['PETR4','VALE3','IBOV']
  news_country   TEXT DEFAULT 'br',
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_screen_templates_client ON screen_templates (client_code);
CREATE INDEX IF NOT EXISTS idx_screen_templates_screen ON screen_templates (screen_id);

-- Cache dos dados externos (clima/bolsa/notícias) — evita bater na API
-- externa a cada tela/refresh; um cron ou o próprio request atualiza
-- quando o dado estiver velho.
CREATE TABLE IF NOT EXISTS external_data_cache (
  cache_key   TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
