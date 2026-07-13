-- ═══════════════════════════════════════════════════════════════════
-- FASE 15 · PASSO 2 — Canais amplos em vez de 1 por business_type
-- Rodar manualmente no Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Segurança: se algum item institucional de teste já usa um dos 9
--    segmentos antigos, desvincula antes de apagar (volta a ser
--    institucional genérico — não perde o item, só o vínculo de canal).
UPDATE institutional_media
SET segment_id = NULL
WHERE segment_id IN (SELECT id FROM inventory_segments_v2);

-- 2) Apaga os 9 segmentos estreitos (1 por business_type)
DELETE FROM inventory_segments_v2;

-- 3) Cria os 5 canais amplos, cada um com uma LISTA de business_types
--    (formato novo: "business_types", array — não mais "business_type" único)
INSERT INTO inventory_segments_v2 (name, criteria_json) VALUES
  ('Canal Beleza',
   '{"business_types": ["Barbearia", "Salão de Beleza"]}'),
  ('Canal Saúde',
   '{"business_types": ["Farmácia", "Clínica"]}'),
  ('Canal Alimentação',
   '{"business_types": ["Lanchonete", "Restaurante"]}'),
  ('Canal Fitness & Bem-estar',
   '{"business_types": ["Academia"]}'),
  ('Canal Varejo & Pet',
   '{"business_types": ["Mercado", "Petshop"]}')
ON CONFLICT (name) DO NOTHING;

-- Nota: "Outro" continua sem canal — vai só no institucional genérico
-- (5% do tempo, todas as telas), como já era.
