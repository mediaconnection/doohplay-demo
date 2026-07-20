-- Fase 29 · Transição por vídeo/imagem individual (20/07/2026)
--
-- Motivado por feedback direto de cliente prospectado: "a transição das
-- imagens devem ser escolhidas por vídeo e não uma só para todos". Até
-- aqui (Fase 12), a transição era uma escolha única por tela inteira
-- (screen_templates.transition_effect). Esta migração é aditiva — não
-- remove nem altera esse comportamento, só adiciona a opção de sobrepor
-- por item individual.
--
-- NULL = usa o padrão da tela (comportamento de sempre, nada muda pra
-- quem não configurar nada aqui).

ALTER TABLE "CampaignMedia"
  ADD COLUMN IF NOT EXISTS transition_effect TEXT DEFAULT NULL
  CHECK (transition_effect IS NULL OR transition_effect IN ('fade', 'cortina', 'deslizar', 'none'));
