-- ═══════════════════════════════════════════════════════════════════
-- FASE 18 · PASSO 1 — Cota separada pro Assistente IA (chat)
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo.
--
-- Contexto: ai_generation_log (Fase 17) contava "1 linha = 1 geração de
-- criativo" (Studio/Cliente). O Assistente IA novo (insights + chat,
-- app/dashboard/local/[code]) é uma unidade de custo bem menor (1
-- mensagem de chat), então não pode compartilhar o mesmo contador sem
-- comer a cota de criativo do cliente. Adiciona uma coluna `feature`
-- pra separar as duas cotas na mesma tabela, sem criar tabela nova.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE ai_generation_log ADD COLUMN IF NOT EXISTS feature TEXT;

-- Todo uso histórico (antes desta coluna existir) foi geração de
-- criativo — não existia outra feature de IA no produto até agora.
-- Sem esse backfill, a query de cota do mês atual (`feature = 'creative'`)
-- ignoraria geração já feita este mês e resetaria a cota de graça.
UPDATE ai_generation_log SET feature = 'creative' WHERE feature IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_generation_log_code_feature_date
  ON ai_generation_log (client_code, feature, created_at);
