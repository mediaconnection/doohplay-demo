-- Fase 9 · Layout multi-zona e YouTube como tipos de slide dentro da
-- playlist normal (não mais modo fixo de tela) + sequência de itens
-- institucionais (canal DOOHPLAY)
--
-- Alvo: institutional_media — é a tabela que o player de TV (app/player/
-- page.tsx) de fato lê. A fundação unificada (creative_assets_v2, Fase 1)
-- alimenta só a API do dashboard, não o player real — corrigido depois de
-- checar o código com atenção.
--
-- Decisão consciente de reverter a proibição de YouTube registrada em
-- sessão anterior (offline quebra, ToS proíbe esconder controles, pode
-- injetar anúncio do YouTube). Fundador confirmou ciente dos 3 riscos.

ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS layout_template_id UUID REFERENCES layout_templates(id);

-- Sequência — itens com o mesmo sequence_group tocam em bloco, um atrás
-- do outro, quando a vez do institucional chegar na rotação (em vez de só
-- um item solto por vez). É o que dá a sensação de "canal DOOHPLAY" /
-- bloco de programação da emissora, em vez de peças soltas aleatórias.
ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS sequence_group TEXT;
CREATE INDEX IF NOT EXISTS idx_institutional_media_sequence ON institutional_media (sequence_group) WHERE sequence_group IS NOT NULL;
