-- ═══════════════════════════════════════════════════════════════════
-- FASE 17 · PASSO 1 — Cota de geração por IA (Studio) por plano
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo.
--
-- Contexto: geração de IA no Studio (app/api/studio/ai-generate) usa
-- ANTHROPIC_API_KEY — é a única feature com custo variável real por uso,
-- e não tinha limite nenhum, em nenhum plano, até hoje.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_generation_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice pra contar rápido "quantas gerações esse cliente já fez este mês"
CREATE INDEX IF NOT EXISTS idx_ai_generation_log_code_date
  ON ai_generation_log (client_code, created_at);
