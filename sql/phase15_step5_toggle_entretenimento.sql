-- ═══════════════════════════════════════════════════════════════════
-- FASE 15 · PASSO 5 — Dono pode desligar canais de entretenimento geral
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Marca quais canais são "gerais" (não pertencem a um segmento de
--    negócio, aparecem em toda tela por padrão) — hoje só Turismo e
--    Diversão. Canais de segmento (Beleza, Saúde, etc) continuam
--    obrigatórios/automáticos, sem opção de desligar — decisão de
--    produto: garantir alcance real pra futuro patrocinador de canal.
ALTER TABLE inventory_segments_v2
  ADD COLUMN IF NOT EXISTS is_general BOOLEAN NOT NULL DEFAULT false;

UPDATE inventory_segments_v2
SET is_general = true
WHERE name IN ('Canal Turismo', 'Canal Diversão');

-- 2) Cliente pode desligar canais gerais específicos. NULL/vazio (padrão,
--    retrocompatível) = recebe todos os canais gerais, como já era.
ALTER TABLE studio_clients
  ADD COLUMN IF NOT EXISTS excluded_general_channels UUID[] DEFAULT NULL;
