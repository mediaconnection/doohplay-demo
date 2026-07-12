-- Fase 14 (fix) — garante todas as colunas de client_login_codes
-- Achado: a tabela já existia no banco (de algum teste anterior) com um
-- schema diferente do esperado, então o CREATE TABLE IF NOT EXISTS da
-- migration original não criou nada. Rode isso manual no Supabase SQL
-- Editor — idempotente, seguro rodar mesmo que as colunas já existam.

ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS client_code TEXT;
ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
ALTER TABLE client_login_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_client_login_codes_code ON client_login_codes(client_code);
CREATE INDEX IF NOT EXISTS idx_client_login_codes_created ON client_login_codes(client_code, created_at DESC);
