-- ═══════════════════════════════════════════════════════════════════
-- FASE 1 · PASSO 2 — Migrar Institucional para a fundação nova
-- Aditivo: NÃO apaga nem altera institutional_media. Só copia.
-- Rodar DEPOIS do Passo 1 (cria as tabelas). Idempotente: pode rodar
-- de novo sem duplicar (usa source_table/source_id como chave de checagem).
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_campaign_id UUID;
BEGIN
  -- 1 campanha guarda-chuva pro Institucional (não existe hoje um "campaign_id"
  -- por peça institucional — cada peça é independente, então todas compartilham
  -- esta campanha simbólica, só pra caber no modelo unificado)
  SELECT id INTO v_campaign_id FROM campaigns_v2
    WHERE owner_type = 'institucional' AND source_table = 'institutional_media_umbrella'
    LIMIT 1;

  IF v_campaign_id IS NULL THEN
    INSERT INTO campaigns_v2 (owner_type, owner_code, name, status, source_table, source_id)
    VALUES ('institucional', 'DOOHPLAY', 'Conteúdo Institucional DOOHPLAY', 'active',
            'institutional_media_umbrella', 'umbrella')
    RETURNING id INTO v_campaign_id;
  END IF;

  -- Creative assets: um por peça institucional, só se ainda não migrado
  INSERT INTO creative_assets_v2
    (campaign_id, name, url, type, display_format, duration_seconds, status, source_table, source_id)
  SELECT
    v_campaign_id, im.name, im.url, im.type, 'fullscreen', im.duration,
    CASE WHEN im.active THEN 'approved' ELSE 'rejected' END,
    'institutional_media', im.id::text
  FROM institutional_media im
  WHERE NOT EXISTS (
    SELECT 1 FROM creative_assets_v2 ca
    WHERE ca.source_table = 'institutional_media' AND ca.source_id = im.id::text
  );

  -- Placements: um por peça, herdando o agendamento já cadastrado
  INSERT INTO placements_v2
    (creative_asset_id, screen_id, segment_id, client_code, position,
     start_date, end_date, start_time, end_time, days_of_week, active,
     source_table, source_id)
  SELECT
    ca.id, NULL, NULL, NULL, im.position,
    im.start_date, im.end_date, im.start_time, im.end_time, im.days_of_week, im.active,
    'institutional_media', im.id::text
  FROM institutional_media im
  JOIN creative_assets_v2 ca
    ON ca.source_table = 'institutional_media' AND ca.source_id = im.id::text
  WHERE NOT EXISTS (
    SELECT 1 FROM placements_v2 p
    WHERE p.source_table = 'institutional_media' AND p.source_id = im.id::text
  );
END $$;

-- ── Verificação — rode e me mande o resultado ──
SELECT
  (SELECT COUNT(*) FROM institutional_media)                                          AS original_count,
  (SELECT COUNT(*) FROM creative_assets_v2 WHERE source_table = 'institutional_media') AS creative_assets_migrados,
  (SELECT COUNT(*) FROM placements_v2      WHERE source_table = 'institutional_media') AS placements_migrados;
-- Os 3 números precisam bater. Se não baterem, PARE e me avise antes de seguir.
