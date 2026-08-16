-- Fase 43 · Arquitetura de 3 modelos de painel de widgets + painel completo
-- com 8 fontes revezando no card central (21/07/2026)
--
-- Aditivo, zero impacto no que já existe. Cliente que não configurar nada
-- continua exatamente como está hoje: template_key = 'fullscreen' (sem
-- painel) ou 'magazine' com widget_position = 'lateral_right' (o mesmo
-- lugar onde o painel já vive hoje, então nada muda de posição sozinho).

-- Onde o painel de widgets aparece na tela — independente do modo de
-- conteúdo dele (fixed/revezando/compacto/painel_completo). Um cliente
-- pode, por exemplo, manter o modo "fixed" de sempre só mudando de lugar.
ALTER TABLE screen_templates
  ADD COLUMN IF NOT EXISTS widget_position TEXT NOT NULL DEFAULT 'lateral_right'
  CHECK (widget_position IN ('lateral_right', 'lateral_left', 'bottom'));

-- Novo modo de conteúdo do painel: um único card central que reveza entre
-- 8 telas (bolsa, câmbio, indicadores, notícias, economia, qualidade do
-- ar, enquete ao vivo, loteria), com relógio+clima e logo fixos nas
-- pontas — layout dos mockups modelo-1/2/3 aprovados. Estende o CHECK da
-- Fase 40 (que aceitava fixed/revezando/compacto) sem remover nenhum
-- valor existente.
ALTER TABLE screen_templates
  DROP CONSTRAINT IF EXISTS screen_templates_widget_layout_mode_check;
ALTER TABLE screen_templates
  ADD CONSTRAINT screen_templates_widget_layout_mode_check
  CHECK (widget_layout_mode IN ('fixed', 'revezando', 'compacto', 'painel_completo'));
