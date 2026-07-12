-- Fase 14 — Login de cliente via WhatsApp (OTP)
-- Rode manual no Supabase SQL Editor. Sem blocos DO $$, statements simples.

CREATE TABLE IF NOT EXISTS client_login_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code   TEXT NOT NULL,
  otp_hash      TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used          BOOLEAN NOT NULL DEFAULT false,
  attempts      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_login_codes_code ON client_login_codes(client_code);
CREATE INDEX IF NOT EXISTS idx_client_login_codes_created ON client_login_codes(client_code, created_at DESC);
