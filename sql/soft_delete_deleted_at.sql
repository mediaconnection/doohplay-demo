-- Exclusão lógica nas rotas destrutivas do admin (11/10/2026,
-- Documento-Mestre 12.63). Aplicada em produção em 11/10/2026 pelo
-- conector do Supabase (migração "soft_delete_deleted_at_columns") e
-- conferida no information_schema. Só adiciona colunas; nenhuma linha
-- existente foi alterada. As 4 tabelas já tinham RLS ligado.
--
-- Reverter: ALTER TABLE ... DROP COLUMN deleted_at (depois de reverter o
-- código que lê a coluna).
ALTER TABLE "Advertiser"        ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE studio_clients      ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE institutional_media ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE media_examples      ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
