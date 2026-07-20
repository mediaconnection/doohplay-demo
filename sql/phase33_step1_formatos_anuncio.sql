-- Fase 33 · Formatos de anúncio: lateral pra anunciante real + faixa
-- inferior + flutuante (20/07/2026)
--
-- Motivado por feedback direto de cliente prospectado: "mais espaços
-- diferentes de anúncios, posições diferentes na tela, entradas
-- flutuantes durante a programação, entradas laterais e abaixo que
-- reduzem a tela principal".
--
-- Achado na investigação: display_format (fullscreen/shrink_lateral) já
-- existia desde a Fase 3, mas só era lido de institutional_media — todo
-- anúncio pago de anunciante real (CampaignMedia via CampaignScreen)
-- sempre vinha fixo em fullscreen, sem opção nenhuma. Esta migração
-- adiciona a mesma coluna em CampaignMedia, mais 2 valores novos
-- (banner_bottom, floating) no conjunto de opções.

ALTER TABLE "CampaignMedia"
  ADD COLUMN IF NOT EXISTS display_format TEXT NOT NULL DEFAULT 'fullscreen'
  CHECK (display_format IN ('fullscreen', 'shrink_lateral', 'banner_bottom', 'floating'));

-- Institucional já tinha a coluna (Fase 3) mas só aceitava 2 valores —
-- estende o mesmo CHECK pra incluir os 2 formatos novos, sem alterar
-- nenhum dado existente (todos os valores atuais continuam válidos).
ALTER TABLE institutional_media
  DROP CONSTRAINT IF EXISTS institutional_media_display_format_check;
ALTER TABLE institutional_media
  ADD CONSTRAINT institutional_media_display_format_check
  CHECK (display_format IN ('fullscreen', 'shrink_lateral', 'banner_bottom', 'floating'));

-- ACHADO nesta mesma investigação: creative_assets_v2 (fundação unificada,
-- Fase 1) tinha um CHECK com um conjunto de valores TOTALMENTE diferente
-- e nunca usado por nenhum código real (half_h/half_v/quarter/
-- corner_overlay/bottom_bar — planejado na Fase 1, nunca implementado).
-- Nenhuma linha existente usa esses valores (a coluna sempre foi gravada
-- como 'fullscreen' fixo pelo unifiedSync.ts) — seguro trocar pro
-- conjunto real usado em produção.
ALTER TABLE creative_assets_v2
  DROP CONSTRAINT IF EXISTS creative_assets_v2_display_format_check;
ALTER TABLE creative_assets_v2
  ADD CONSTRAINT creative_assets_v2_display_format_check
  CHECK (display_format IN ('fullscreen', 'shrink_lateral', 'banner_bottom', 'floating'));
