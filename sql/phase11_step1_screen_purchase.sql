-- Fase 11 · Self-service: cliente adiciona tela nova, cobrado automaticamente
--
-- Fluxo: cliente digita o código de ativação (mostrado no próprio
-- aparelho, ex: DHP-A1B2C3) + nome da tela no dashboard dele. Sistema gera
-- cobrança única no Asaas (Pix+Boleto). A tela SÓ é criada de verdade
-- (client_screens) quando o pagamento é confirmado via webhook — mesmo
-- padrão já usado pra campanha de anunciante (nunca ativa sem confirmação
-- real de pagamento).

CREATE TABLE IF NOT EXISTS screen_purchase_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code       TEXT NOT NULL,
  player_id         UUID NOT NULL REFERENCES players(id),
  label             TEXT NOT NULL,
  value             NUMERIC NOT NULL,
  asaas_payment_id  TEXT,
  invoice_url       TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at           TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_screen_purchase_requests_client ON screen_purchase_requests (client_code);
CREATE INDEX IF NOT EXISTS idx_screen_purchase_requests_payment ON screen_purchase_requests (asaas_payment_id);
