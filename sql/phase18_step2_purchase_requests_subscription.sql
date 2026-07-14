-- ═══════════════════════════════════════════════════════════════════
-- FASE 18 · PASSO 2 — rastreio da assinatura recorrente da tela extra
-- Rodar manualmente no Supabase SQL Editor, junto com o passo 1.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE screen_purchase_requests
  ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;
