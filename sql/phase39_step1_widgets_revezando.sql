-- Fase 39 · Widgets combinados revezando (20/07/2026)
--
-- Pedido do fundador: widgets que revezam entre assuntos afins (ex: hora
-- alternando com clima; bolsa alternando com notícia de economia), como
-- opção NOVA ao lado do painel fixo atual (4 widgets sempre visíveis
-- empilhados) — o admin escolhe por tela, nunca substitui o padrão.

ALTER TABLE screen_templates
  ADD COLUMN IF NOT EXISTS widget_layout_mode TEXT NOT NULL DEFAULT 'fixed'
  CHECK (widget_layout_mode IN ('fixed', 'revezando'));
