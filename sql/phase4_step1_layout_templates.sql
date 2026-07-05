-- Fase 4 · Layouts genéricos e editáveis
-- Substitui o template_key fixo ('fullscreen'/'magazine') por um sistema de
-- N zonas arbitrárias, cada uma com posição/tamanho (% da tela) e um tipo
-- de conteúdo. Os 10 modelos que já desenhamos entram como ponto de
-- partida ("presets") — o admin pode clonar e editar livremente
-- (mover, redimensionar, remover bloco, trocar o que toca em cada um).

CREATE TABLE IF NOT EXISTS layout_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  orientation   TEXT NOT NULL DEFAULT 'horizontal'
                  CHECK (orientation IN ('horizontal', 'vertical')),
  zones         JSONB NOT NULL,  -- [{id,x,y,w,h,content_type}] — x/y/w/h em % (0-100)
  is_preset     BOOLEAN NOT NULL DEFAULT FALSE,  -- true = um dos 10 modelos prontos (referência, não editar direto)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- screen_templates passa a apontar pra um layout_template específico,
-- em vez do enum fixo antigo. template_key continua existindo por
-- compatibilidade (rotas antigas), mas layout_template_id é o caminho novo.
ALTER TABLE screen_templates
  ADD COLUMN IF NOT EXISTS layout_template_id UUID REFERENCES layout_templates(id);

-- ── Seed dos 10 modelos prontos ──
-- content_type possíveis: 'main_rotation' (dono+anunciante+rede+institucional,
-- ciclo com pesos, igual ao de hoje), 'ad_only' (só anúncio, formato "encolhe
-- lateral" de antes), 'weather', 'stocks', 'news'.

INSERT INTO layout_templates (name, orientation, zones, is_preset) VALUES
('Tela cheia', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":100,"h":100,"content_type":"main_rotation"}]'::jsonb, true),

('2 partes · lado a lado', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":50,"h":100,"content_type":"main_rotation"},
    {"id":"z2","x":50,"y":0,"w":50,"h":100,"content_type":"ad_only"}]'::jsonb, true),

('2 partes · principal + lateral', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":70,"h":100,"content_type":"main_rotation"},
    {"id":"z2","x":70,"y":0,"w":30,"h":100,"content_type":"ad_only"}]'::jsonb, true),

('3 partes · principal + 2 empilhadas', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":60,"h":100,"content_type":"main_rotation"},
    {"id":"z2","x":60,"y":0,"w":40,"h":50,"content_type":"weather"},
    {"id":"z3","x":60,"y":50,"w":40,"h":50,"content_type":"news"}]'::jsonb, true),

('3 partes · três colunas', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":34,"h":100,"content_type":"main_rotation"},
    {"id":"z2","x":34,"y":0,"w":33,"h":100,"content_type":"stocks"},
    {"id":"z3","x":67,"y":0,"w":33,"h":100,"content_type":"news"}]'::jsonb, true),

('4 partes · grade 2x2', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":50,"h":50,"content_type":"main_rotation"},
    {"id":"z2","x":50,"y":0,"w":50,"h":50,"content_type":"weather"},
    {"id":"z3","x":0,"y":50,"w":50,"h":50,"content_type":"stocks"},
    {"id":"z4","x":50,"y":50,"w":50,"h":50,"content_type":"news"}]'::jsonb, true),

('5 partes · principal + 4 empilhadas', 'horizontal',
  '[{"id":"z1","x":0,"y":0,"w":60,"h":100,"content_type":"main_rotation"},
    {"id":"z2","x":60,"y":0,"w":40,"h":25,"content_type":"weather"},
    {"id":"z3","x":60,"y":25,"w":40,"h":25,"content_type":"stocks"},
    {"id":"z4","x":60,"y":50,"w":40,"h":25,"content_type":"news"},
    {"id":"z5","x":60,"y":75,"w":40,"h":25,"content_type":"ad_only"}]'::jsonb, true),

('2 partes · empilhadas', 'vertical',
  '[{"id":"z1","x":0,"y":0,"w":100,"h":50,"content_type":"main_rotation"},
    {"id":"z2","x":0,"y":50,"w":100,"h":50,"content_type":"ad_only"}]'::jsonb, true),

('3 partes · principal + 2 lado a lado', 'vertical',
  '[{"id":"z1","x":0,"y":0,"w":100,"h":60,"content_type":"main_rotation"},
    {"id":"z2","x":0,"y":60,"w":50,"h":40,"content_type":"weather"},
    {"id":"z3","x":50,"y":60,"w":50,"h":40,"content_type":"news"}]'::jsonb, true),

('4 partes · grade 2x2 vertical', 'vertical',
  '[{"id":"z1","x":0,"y":0,"w":50,"h":50,"content_type":"main_rotation"},
    {"id":"z2","x":50,"y":0,"w":50,"h":50,"content_type":"weather"},
    {"id":"z3","x":0,"y":50,"w":50,"h":50,"content_type":"stocks"},
    {"id":"z4","x":50,"y":50,"w":50,"h":50,"content_type":"news"}]'::jsonb, true)

ON CONFLICT DO NOTHING;
