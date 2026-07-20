-- Fase 34 · Canal Jornalismo (geral) + correção de gap achado no caminho
-- (20/07/2026)
--
-- Motivado por feedback direto de cliente prospectado: "precisamos de
-- mais conteúdo de prestação de serviços e até de jornalismo". A parte
-- de "prestação de serviços" já tem canal (Canal Casa & Serviços, criado
-- na Fase 15, só sem conteúdo produzido ainda — ver pendência). A parte
-- de "jornalismo" é conteúdo novo — canal geral (aparece em toda tela,
-- como Turismo/Diversão), não preso a um tipo de negócio específico.

-- 1) Canal Jornalismo novo — mesma convenção de "geral" confirmada via
--    consulta direta ao banco (is_general=true sozinho não filtra nada;
--    o que faz o canal aparecer em toda tela é a lista EXAUSTIVA de
--    business_types no criteria_json). Lista abaixo = todos os 15 tipos
--    reais do dropdown de cadastro hoje (app/cadastro/route.ts),
--    exceto "Outro" (nunca teve canal, comportamento de sempre).
INSERT INTO inventory_segments_v2 (name, is_general, criteria_json) VALUES
  ('Canal Jornalismo', true, '{"business_types": [
    "Academia", "Automotivo", "Bar", "Barbearia", "Casa & Serviços",
    "Clínica", "Condomínio", "Farmácia", "Lanchonete", "Loja de Roupas",
    "Mercado", "Padaria", "Petshop", "Restaurante", "Salão de Beleza"
  ]}')
ON CONFLICT (name) DO NOTHING;

-- 2) ACHADO nesta mesma investigação: Canal Turismo e Canal Diversão
--    (criados antes da Fase 26 adicionar Bar/Padaria/Loja de Roupas/
--    Casa & Serviços/Automotivo/Condomínio ao cadastro) tinham
--    criteria_json com só os 9 tipos ORIGINAIS — confirmado via consulta
--    direta ao banco. Na prática, um dono de padaria ou bar NUNCA recebe
--    esses dois canais gerais desde então, mesmo sendo "gerais" por
--    intenção de produto. Corrigido aqui pra bater com a lista real
--    atual — mesmo conjunto usado no Canal Jornalismo acima.
UPDATE inventory_segments_v2
SET criteria_json = '{"business_types": [
  "Academia", "Automotivo", "Bar", "Barbearia", "Casa & Serviços",
  "Clínica", "Condomínio", "Farmácia", "Lanchonete", "Loja de Roupas",
  "Mercado", "Padaria", "Petshop", "Restaurante", "Salão de Beleza"
]}'
WHERE name IN ('Canal Turismo', 'Canal Diversão');
