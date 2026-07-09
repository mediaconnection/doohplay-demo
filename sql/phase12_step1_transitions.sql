-- Fase 12 · Efeitos de transição entre slides (fade, cortina, deslizar)
--
-- Escopo: rotação de topo (tela cheia), que é a experiência principal de
-- "programação" pedida pelo fundador. Zonas aninhadas (dentro de um
-- slide-layout) continuam com corte instantâneo por enquanto — extensão
-- futura se fizer sentido depois de validar o efeito no caso principal.

ALTER TABLE screen_templates
  ADD COLUMN IF NOT EXISTS transition_effect TEXT NOT NULL DEFAULT 'fade'
  CHECK (transition_effect IN ('fade', 'cortina', 'deslizar', 'none'));
