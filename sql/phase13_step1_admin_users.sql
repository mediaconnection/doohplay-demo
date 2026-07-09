-- Fase 13 · Usuários e permissões
--
-- Hoje só existe 1 login mestre (via ADMIN_EMAIL/ADMIN_PASSWORD, env) com
-- acesso total. Essa tabela permite múltiplos admins, cada um com seu
-- próprio login e um papel (super_admin = tudo; operador = tudo, exceto
-- Assinaturas/financeiro por enquanto — escopo inicial, dá pra crescer).
--
-- O login mestre via env continua funcionando sempre, como "chave de
-- emergência" — nunca fica bloqueado por causa dessa tabela.

CREATE TABLE IF NOT EXISTS admin_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'operador' CHECK (role IN ('super_admin', 'operador')),
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ
);
