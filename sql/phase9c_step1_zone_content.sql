-- Fase 9c · Conteúdo escolhido por zona dentro de um slide-layout
--
-- Antes, as zonas de conteúdo (main_rotation/ad_only) de um item tipo
-- 'layout' sorteavam sozinhas o que mostrar (pickNextMedia). O fundador
-- pediu controle explícito: escolher exatamente o que entra em cada zona
-- na hora de criar o item.
--
-- zone_content mapeia zone_id -> { type: 'image'|'video', url, name }.
-- Só é usado quando institutional_media.type = 'layout'. Fica na tabela
-- do ITEM (não do layout_template, que é reutilizável por vários itens
-- diferentes, cada um podendo querer conteúdo diferente nas mesmas zonas).

ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS zone_content JSONB;
