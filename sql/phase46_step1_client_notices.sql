-- Fase 46 (27/09/2026) — Avisos: recados curtos em texto que o dono cria
-- no dashboard (aba "Avisos") e que o player intercala com a playlist
-- normal (1 aviso a cada N conteúdos, ver lib/notices.ts).
--
-- Sem screen_id de propósito: o player web hoje não sabe qual tela física
-- está exibindo a página (/player?screen=CODE é por cliente, ver
-- comentário "limitação conhecida" em app/player/page.tsx), então um
-- aviso "só da tela X" não teria como ser respeitado. Todo aviso vale
-- pra todas as telas do cliente até isso mudar.
--
-- Rodar manualmente no Supabase (SQL editor). Idempotente. Enquanto não
-- rodar, playlist e player seguem normais, só sem avisos
-- (getActiveNotices em lib/notices.ts cai em lista vazia).
CREATE TABLE IF NOT EXISTS client_notices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT NOT NULL,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 60),
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 200),
  template    TEXT NOT NULL DEFAULT 'cartao' CHECK (template IN ('cartao', 'faixa')),
  icon        TEXT CHECK (icon IS NULL OR icon IN ('aviso', 'info', 'relogio', 'coracao')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_client_notices_client_code ON client_notices (client_code);

-- Mesmo padrão das outras tabelas do app (studio_clients, feature_flags,
-- playlist_schedule...): RLS ligado e nenhuma policy. Bloqueia leitura/
-- escrita pela API REST do Supabase com a chave anônima (que é pública) —
-- sem isso, qualquer um criaria aviso na TV de qualquer cliente. O
-- pg.Pool do servidor conecta como dono da tabela e não é afetado.
ALTER TABLE client_notices ENABLE ROW LEVEL SECURITY;
