-- ═══════════════════════════════════════════════════════════════════
-- FASE 19 · PASSO 1 — Institucional Layout/YouTube na fundação unificada
-- Achado 14/07/2026: institutional-media POST só chamava
-- syncInstitutionalToUnified() no ramo 'media' (imagem/vídeo). Os ramos
-- 'layout' e 'youtube' gravavam em institutional_media mas NUNCA
-- chegavam em placements_v2/creative_assets_v2 — e como
-- /api/client/playlist/[code] (o que a TV real consulta em todo ciclo
-- de refresh) só lê da fundação unificada, essas peças apareciam
-- configuradas no admin mas nunca tocavam de fato na tela.
-- Efeito colateral agravante: creative_assets_v2.type tinha CHECK
-- restrito a ('image','video') — nem dava pra sincronizar sem isso.
-- 100% aditivo. Não altera dado existente.
-- Rodar manualmente no Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Permite 'layout' e 'youtube' como tipo de creative_asset
ALTER TABLE creative_assets_v2 DROP CONSTRAINT IF EXISTS creative_assets_v2_type_check;
ALTER TABLE creative_assets_v2
  ADD CONSTRAINT creative_assets_v2_type_check
  CHECK (type IN ('image','video','layout','youtube'));

-- 2) Campos por-peça que só o institucional usa (layout N-zonas + bloco
--    de sequência) — mesma informação que já existia em institutional_media,
--    agora espelhada na fundação nova pra sync funcionar de ponta a ponta.
ALTER TABLE creative_assets_v2 ADD COLUMN IF NOT EXISTS layout_template_id UUID REFERENCES layout_templates(id);
ALTER TABLE creative_assets_v2 ADD COLUMN IF NOT EXISTS zone_content        JSONB;
ALTER TABLE creative_assets_v2 ADD COLUMN IF NOT EXISTS sequence_group      TEXT;

-- 3) url em creative_assets_v2 é NOT NULL — layout não tem uma url única
--    (o conteúdo vive em zone_content), então precisa aceitar vazio.
ALTER TABLE creative_assets_v2 ALTER COLUMN url DROP NOT NULL;
ALTER TABLE creative_assets_v2 ALTER COLUMN url SET DEFAULT '';
UPDATE creative_assets_v2 SET url = '' WHERE url IS NULL;
