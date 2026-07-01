-- Agendamento do Conteúdo Institucional (datas + horário + dias da semana)
-- Rodar manualmente no Supabase SQL Editor.

-- 1. Novas colunas (nullable no primeiro passo pra permitir backfill)
ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS start_date   DATE,
  ADD COLUMN IF NOT EXISTS end_date     DATE,
  ADD COLUMN IF NOT EXISTS start_time   TIME,
  ADD COLUMN IF NOT EXISTS end_time     TIME,
  ADD COLUMN IF NOT EXISTS days_of_week TEXT[];

-- 2. Backfill das 4 peças já cadastradas (Coca Cola, Pingo, Havainas, Copa 2026)
--    Sem isso elas sumiriam da rotação assim que a NOT NULL constraint entrar.
--    Fica: hoje até +1 ano, todos os dias, dia inteiro (equivalente ao comportamento atual).
UPDATE institutional_media
SET start_date = COALESCE(start_date, CURRENT_DATE),
    end_date   = COALESCE(end_date, CURRENT_DATE + INTERVAL '1 year')
WHERE start_date IS NULL OR end_date IS NULL;

-- 3. A partir de agora, todo cadastro novo é obrigado a ter datas
ALTER TABLE institutional_media
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date   SET NOT NULL;

-- start_time / end_time / days_of_week continuam opcionais:
-- NULL = sem restrição de horário / todos os dias da semana.
