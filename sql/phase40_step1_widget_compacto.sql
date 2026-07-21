-- Fase 40 · Selo "Patrocinado" + 3º modo de widget "compacto" (20/07/2026)
--
-- Selo "Patrocinado" não precisa de coluna nova (é puramente visual, JS
-- decide com base na categoria do item já existente). Só o modo
-- "compacto" precisa de mudança de schema: estender o CHECK da Fase 39
-- (que só aceitava 'fixed'/'revezando') pra incluir o valor novo.
--
-- Inspirado em referência visual (template-grid-retail.html) enviada
-- pelo fundador: linha única de hora+clima (estilo cabeçalho) + ticker
-- corrido de notícia, mais discreto que os cards cheios do modo fixo/
-- revezando.

ALTER TABLE screen_templates
  DROP CONSTRAINT IF EXISTS screen_templates_widget_layout_mode_check;
ALTER TABLE screen_templates
  ADD CONSTRAINT screen_templates_widget_layout_mode_check
  CHECK (widget_layout_mode IN ('fixed', 'revezando', 'compacto'));
