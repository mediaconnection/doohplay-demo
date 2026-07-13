-- ═══════════════════════════════════════════════════════════════════
-- FASE 15 · PASSO 3 — 10 canais amplos (categorias de anúncio),
-- substituindo os 5 do passo 2. Rodar manualmente no Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Segurança: desvincula qualquer item institucional que já use um dos
--    5 canais do passo 2 antes de apagar (volta a ser institucional
--    genérico — não perde o item, só o vínculo de canal).
UPDATE institutional_media
SET segment_id = NULL
WHERE segment_id IN (SELECT id FROM inventory_segments_v2);

-- 2) Apaga os 5 canais do passo 2
DELETE FROM inventory_segments_v2;

-- 3) Cria os 10 canais amplos. Os 4 últimos (Automotivo, Educação,
--    Casa & Serviços, Moda & Vestuário) não têm nenhum business_type
--    correspondente no cadastro hoje — criteria_json com lista vazia,
--    "reservados pro futuro". Ficam disponíveis no dropdown do admin,
--    mas nenhuma tela vai receber conteúdo deles até: (a) alguém
--    adicionar esses tipos de negócio no cadastro, e (b) um cliente
--    real desse tipo se cadastrar.
INSERT INTO inventory_segments_v2 (name, criteria_json) VALUES
  ('Canal Beleza & Estética',
   '{"business_types": ["Barbearia", "Salão de Beleza"]}'),
  ('Canal Saúde',
   '{"business_types": ["Farmácia", "Clínica"]}'),
  ('Canal Alimentação',
   '{"business_types": ["Lanchonete", "Restaurante"]}'),
  ('Canal Fitness & Esportes',
   '{"business_types": ["Academia"]}'),
  ('Canal Varejo & Mercado',
   '{"business_types": ["Mercado"]}'),
  ('Canal Pet & Animais',
   '{"business_types": ["Petshop"]}'),
  ('Canal Automotivo',
   '{"business_types": []}'),
  ('Canal Educação',
   '{"business_types": []}'),
  ('Canal Casa & Serviços',
   '{"business_types": []}'),
  ('Canal Moda & Vestuário',
   '{"business_types": []}')
ON CONFLICT (name) DO NOTHING;

-- Nota: "Outro" continua sem canal — vai só no institucional genérico
-- (5% do tempo, todas as telas), como já era.
