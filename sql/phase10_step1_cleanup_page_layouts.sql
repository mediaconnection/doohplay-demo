-- Fase 10 · Simplificação da arquitetura de templates
--
-- "Layout personalizado" fixo por página foi removido do admin (Templates).
-- Toda divisão de tela agora vive só dentro do Institucional, como slide de
-- playlist. Isso zera qualquer configuração órfã de antes da mudança —
-- sem isso, um cliente configurado com layout de página antes desta sessão
-- continuaria preso nele pra sempre (o botão que limpava isso não existe
-- mais na interface).

UPDATE screen_templates SET layout_template_id = NULL WHERE layout_template_id IS NOT NULL;
