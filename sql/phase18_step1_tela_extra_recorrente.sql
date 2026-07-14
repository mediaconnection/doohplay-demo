-- ═══════════════════════════════════════════════════════════════════
-- FASE 18 · PASSO 1 — Tela extra vira assinatura recorrente
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo.
--
-- Contexto: análise comercial dos planos achou que a tela extra sendo
-- cobrança ÚNICA de R$97 tornava Starter+extras muito mais barato que
-- Business no longo prazo, pro mesmo número de telas — sem nenhum
-- limite de plano sendo checado em lugar nenhum do fluxo. Agora vira
-- recorrente (R$150/mês por tela extra, configurável via
-- EXTRA_SCREEN_MONTHLY_PRICE_BRL).
-- ═══════════════════════════════════════════════════════════════════

-- is_extra = true → essa tela é adicional paga (fora do que o plano já
-- inclui), com assinatura recorrente própria. false/NULL (padrão) =
-- tela normal, coberta pelo plano base — comportamento de sempre.
ALTER TABLE client_screens
  ADD COLUMN IF NOT EXISTS is_extra BOOLEAN NOT NULL DEFAULT false;

-- ID da assinatura recorrente no Asaas referente a ESSA tela específica
-- (independente da assinatura do plano principal). NULL se não for extra.
ALTER TABLE client_screens
  ADD COLUMN IF NOT EXISTS extra_subscription_id TEXT;
