-- Necessário pra sincronização em tempo real (upsert) funcionar via
-- ON CONFLICT. Sem isso, INSERT ... ON CONFLICT não tem em cima do que agir.

ALTER TABLE campaigns_v2
  ADD CONSTRAINT campaigns_v2_source_unique UNIQUE (source_table, source_id);

ALTER TABLE creative_assets_v2
  ADD CONSTRAINT creative_assets_v2_source_unique UNIQUE (source_table, source_id);

ALTER TABLE placements_v2
  ADD CONSTRAINT placements_v2_source_unique UNIQUE (source_table, source_id);
