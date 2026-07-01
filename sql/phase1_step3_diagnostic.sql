-- ═══════════════════════════════════════════════════════════════════
-- FASE 1 · PASSO 3 — Diagnóstico (só leitura, zero risco)
-- Rode isso e me mande o resultado. Preciso saber a distribuição real
-- de content_source e o formato de advertiserCode antes de escrever a
-- migração de Campaign/CampaignMedia/CampaignScreen/playlist_schedule
-- — migrar isso no chute é o tipo de erro caro que estamos tentando evitar.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Quantas campanhas existem e quantas mídias cada uma tem
SELECT c.id, c."advertiserCode", c.name, c.status, c."startDate", c."endDate",
       COUNT(cm.id) AS total_medias
FROM "Campaign" c
LEFT JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
GROUP BY c.id, c."advertiserCode", c.name, c.status, c."startDate", c."endDate"
ORDER BY total_medias DESC;

-- 2) content_source: quais valores existem de fato, e se uma mesma campanha
--    mistura mais de um tipo (isso muda como eu desenho a migração)
SELECT cm."campaignId", cm.content_source, COUNT(*) AS qtd
FROM "CampaignMedia" cm
GROUP BY cm."campaignId", cm.content_source
ORDER BY cm."campaignId";

-- 3) advertiserCode aponta pro client_code do dono (studio_clients) ou existe
--    caso de anunciante terceiro de verdade (tabela "Advertiser")?
SELECT c."advertiserCode",
       (SELECT COUNT(*) FROM studio_clients sc WHERE sc.code = c."advertiserCode")   AS existe_em_studio_clients,
       (SELECT COUNT(*) FROM "Advertiser" a    WHERE a.code = c."advertiserCode")    AS existe_em_advertiser
FROM "Campaign" c
GROUP BY c."advertiserCode";

-- 4) CampaignScreen: quantas campanhas têm vínculo explícito de tela
--    (fluxo "anunciante real" citado no código)
SELECT COUNT(DISTINCT "campaignId") AS campanhas_com_campaignscreen,
       COUNT(*)                     AS total_vinculos
FROM "CampaignScreen";

-- 5) playlist_schedule: quantas linhas, e quantas realmente têm agendamento
--    preenchido (vs. só position/duration/active, que é o mais comum hoje)
SELECT
  COUNT(*)                                                        AS total_linhas,
  COUNT(*) FILTER (WHERE start_date IS NOT NULL)                   AS com_start_date,
  COUNT(*) FILTER (WHERE days_of_week IS NOT NULL)                 AS com_days_of_week,
  COUNT(*) FILTER (WHERE start_time IS NOT NULL)                   AS com_start_time,
  COUNT(*) FILTER (WHERE screen_id IS NOT NULL)                    AS com_screen_id
FROM playlist_schedule;

-- 6) Confirma se media_id em playlist_schedule aponta sempre pra CampaignMedia.id
--    (assumido no código, mas melhor confirmar antes de migrar)
SELECT COUNT(*) AS orfaos
FROM playlist_schedule ps
WHERE NOT EXISTS (SELECT 1 FROM "CampaignMedia" cm WHERE cm.id = ps.media_id);
