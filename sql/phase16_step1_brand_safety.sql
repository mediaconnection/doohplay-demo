-- ═══════════════════════════════════════════════════════════════════
-- FASE 16 · PASSO 1 — Brand-safety em anúncios pagos (anunciante)
-- Rodar manualmente no Supabase SQL Editor. 100% aditivo.
--
-- Contexto: hoje o pipeline de anúncio pago real (CampaignMedia via
-- Advertiser/Campaign/CampaignScreen) tem 0 registros em produção — é
-- infraestrutura pronta, esperando o primeiro anunciante de verdade.
-- Essa migração prepara o brand-safety ANTES de precisar dele.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Tags fixas de brand-safety por peça de anúncio. NULL/vazio (padrão,
--    retrocompatível) = sem tag nenhuma, nunca excluído por tag.
--    Taxonomia fixa (ver app/api/admin/media/[id]/route.ts e
--    app/api/client/ad-tag-preferences/[code]/route.ts):
--    bebida_alcoolica, tabaco, apostas, conteudo_adulto, politica
ALTER TABLE "CampaignMedia"
  ADD COLUMN IF NOT EXISTS content_tags TEXT[] DEFAULT NULL;

-- 2) Cliente escolhe quais tags NÃO quer receber. NULL/vazio (padrão) =
--    aceita todas as tags (comportamento de sempre, retrocompatível).
ALTER TABLE studio_clients
  ADD COLUMN IF NOT EXISTS excluded_ad_tags TEXT[] DEFAULT NULL;

-- Nota: exclusão de CONCORRENTE DIRETO (ex: clínica não ver anúncio de
-- outra clínica) não precisa de coluna nova — compara
-- "Advertiser".segment (já existe, preenchido no cadastro do anunciante)
-- com studio_clients.business_type na hora de montar a playlist. Regra
-- sempre ativa, sem toggle (nenhum dono realisticamente quer anúncio de
-- concorrente direto na própria tela).
