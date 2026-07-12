-- ═══════════════════════════════════════════════════════════════════
-- FASE 15 · PASSO 1 — Canal DOOHPLAY por segmento
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo — não altera
-- nem apaga nada existente. Reversível: as duas colunas/tabela novas
-- podem ser ignoradas (ficam NULL/vazias) sem quebrar nada do que já
-- funciona hoje.
-- ═══════════════════════════════════════════════════════════════════

-- 1) inventory_segments_v2 já existia (Fase 1), vazia, esperando por isso.
--    Adiciona unicidade por nome pra permitir rodar essa migração de novo
--    sem duplicar linhas.
ALTER TABLE inventory_segments_v2
  ADD CONSTRAINT inventory_segments_v2_name_unique UNIQUE (name);

-- 2) Um segmento por tipo de negócio real do cadastro (mesma lista já usada
--    e corrigida em app/api/studio/ai-generate/route.ts nesta sessão).
INSERT INTO inventory_segments_v2 (name, criteria_json) VALUES
  ('Canal Barbearia',        '{"business_type": "Barbearia"}'),
  ('Canal Salão de Beleza',  '{"business_type": "Salão de Beleza"}'),
  ('Canal Farmácia',         '{"business_type": "Farmácia"}'),
  ('Canal Clínica',          '{"business_type": "Clínica"}'),
  ('Canal Lanchonete',       '{"business_type": "Lanchonete"}'),
  ('Canal Restaurante',      '{"business_type": "Restaurante"}'),
  ('Canal Academia',         '{"business_type": "Academia"}'),
  ('Canal Mercado',          '{"business_type": "Mercado"}'),
  ('Canal Petshop',          '{"business_type": "Petshop"}')
ON CONFLICT (name) DO NOTHING;

-- 3) institutional_media passa a poder apontar pra um segmento.
--    NULL (padrão, todo item existente continua assim) = institucional
--    genérico, 5% do tempo, todas as telas — comportamento de sempre.
--    Preenchido = conteúdo do canal daquele segmento, 20% do tempo, só
--    telas cujo business_type bate com o critério do segmento.
ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES inventory_segments_v2(id);

-- Nota: placements_v2.segment_id já existia desde a Fase 1 (criado
-- antecipando exatamente esse uso, nunca preenchido até hoje) — nada a
-- fazer nele, só passou a ser escrito de verdade agora via
-- lib/unifiedSync.ts → syncInstitutionalToUnified().
