-- ============================================================
-- DOOHPLAY — Dados de demonstração
-- Execute APÓS 001_core_schema.sql
-- ⚠️  Apenas para ambiente de dev/staging, não em produção
-- ============================================================

-- Tenant demo
INSERT INTO tenants (id, name, slug, plan, primary_color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'DOOHPLAY Demo', 'doohplay-demo', 'enterprise', '#4F6EF7');

-- Telas de demonstração
INSERT INTO screens (tenant_id, name, city, state, address, lat, lng, type, size_w, size_h, status, cpm_base, device_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Av. Paulista #1200',     'São Paulo',       'SP', 'Av. Paulista, 1200',         -23.5637, -46.6521, 'billboard',  1920, 1080, 'online',      38.00, 'DOOH-SP001'),
  ('00000000-0000-0000-0000-000000000001', 'Shopping Ibirapuera L1', 'São Paulo',       'SP', 'Av. Ibirapuera, 3103',       -23.5943, -46.6548, 'retail',     1080, 1920, 'online',      19.00, 'DOOH-SP002'),
  ('00000000-0000-0000-0000-000000000001', 'Metrô Consolação',       'São Paulo',       'SP', 'R. da Consolação, s/n',      -23.5545, -46.6619, 'transit',    1920, 1080, 'online',      24.00, 'DOOH-SP003'),
  ('00000000-0000-0000-0000-000000000001', 'Rio Sul Center P2',      'Rio de Janeiro',  'RJ', 'R. Lauro Müller, 116',       -22.9487, -43.1791, 'retail',     1080, 1920, 'online',      19.00, 'DOOH-RJ001'),
  ('00000000-0000-0000-0000-000000000001', 'Eixão Norte BSB',        'Brasília',        'DF', 'Eixo Monumental Norte',      -15.7801, -47.9292, 'billboard',  1920, 1080, 'online',      28.00, 'DOOH-BSB01'),
  ('00000000-0000-0000-0000-000000000001', 'BH Shopping Entrada',    'Belo Horizonte',  'MG', 'Rod. BR-356, 3049',          -19.9624, -43.9933, 'retail',     1920, 1080, 'degraded',    16.00, 'DOOH-BHZ01'),
  ('00000000-0000-0000-0000-000000000001', 'Aeroporto GIG Check-in', 'Rio de Janeiro',  'RJ', 'Av. 20 de Janeiro, s/n',     -22.8099, -43.2505, 'indoor',     3840, 2160, 'online',      32.00, 'DOOH-RJ002'),
  ('00000000-0000-0000-0000-000000000001', 'Poste Smart Pinheriros',  'São Paulo',       'SP', 'R. dos Pinheiros, 870',      -23.5665, -46.6857, 'smart_city', 1080, 1920, 'offline',     22.00, 'DOOH-SP004');

-- Campanhas de demonstração
INSERT INTO campaigns (tenant_id, name, advertiser, objective, status, budget, budget_spent, cpm, impressions, start_date, end_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Nubank — Cashback Verão',    'Nubank',          'awareness',  'active',    48000, 31200, 38, 821053, '2025-09-01', '2025-10-31'),
  ('00000000-0000-0000-0000-000000000001', 'iFood — 30% OFF Almoço',     'iFood',           'promotion',  'active',    22000, 18400, 24, 766667, '2025-09-15', '2025-10-15'),
  ('00000000-0000-0000-0000-000000000001', 'Itaú — Pix Premiado',        'Itaú Unibanco',   'awareness',  'active',    65000, 28000, 32, 875000, '2025-10-01', '2025-11-30'),
  ('00000000-0000-0000-0000-000000000001', 'Magazine Luiza — Black',     'Magazine Luiza',  'promotion',  'draft',     90000,     0, 35,      0, '2025-11-25', '2025-12-02'),
  ('00000000-0000-0000-0000-000000000001', 'Ambev — Budweiser Copa',     'Ambev',           'awareness',  'paused',    35000, 35000, 40, 875000, '2025-08-01', '2025-09-30'),
  ('00000000-0000-0000-0000-000000000001', 'Localiza — Frota Flex',      'Localiza',        'leads',      'completed', 18000, 17800, 28, 635714, '2025-07-01', '2025-08-31');

-- Subscription demo
INSERT INTO subscriptions (tenant_id, plan, status, current_period_start, current_period_end) VALUES
  ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active', NOW(), NOW() + INTERVAL '30 days');
