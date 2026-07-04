-- Só leitura, zero risco. Roda isso e me manda o resultado.
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'creative_assets_v2'::regclass
  AND contype = 'c';
