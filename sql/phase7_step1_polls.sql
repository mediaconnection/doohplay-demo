-- Fase 7 · Interatividade básica — enquete via QR code
-- As telas são só de exibição (sem toque); a interação acontece no celular
-- de quem está vendo: aponta a câmera pro QR, vota, resultado atualiza na
-- tela quase em tempo real.

CREATE TABLE IF NOT EXISTS polls (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code  TEXT NOT NULL,
  question     TEXT NOT NULL,
  options      TEXT[] NOT NULL,  -- ex: ARRAY['Sim','Não'] ou até 4 opções
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_polls_client ON polls (client_code, active);

CREATE TABLE IF NOT EXISTS poll_votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id       UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index  INT NOT NULL,
  voter_hash    TEXT,  -- hash de IP+user-agent — fricção básica contra voto
                        -- duplicado óbvio, não é anti-fraude robusto (não
                        -- precisa ser: é uma enquete de vitrine, não eleição)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes (poll_id);
