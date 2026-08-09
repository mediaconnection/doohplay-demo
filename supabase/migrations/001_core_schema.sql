-- ============================================================
-- DOOHPLAY — Schema de produção v1.0
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enum types ────────────────────────────────────────────────────────────────────────────

CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'pro_plus', 'enterprise', 'enterprise_plus');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'operator', 'viewer');
CREATE TYPE screen_type AS ENUM ('billboard', 'transit', 'retail', 'indoor', 'smart_city');
CREATE TYPE screen_status AS ENUM ('online', 'offline', 'maintenance');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE creative_type AS ENUM ('image', 'video', 'html');
CREATE TYPE creative_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- ── Tenants (empresas) ──────────────────────────────────────────────────────────────────────────

CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan          plan_type NOT NULL DEFAULT 'starter',
  logo_url      TEXT,
  primary_color TEXT NOT NULL DEFAULT '#4F6EF7',
  phone         TEXT,
  cnpj          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User profiles (extends auth.users) ───────────────────────────────────────────────────────────────────────

CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone       TEXT,
  name        TEXT NOT NULL DEFAULT '',
  role        user_role NOT NULL DEFAULT 'operator',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_tenant ON user_profiles(tenant_id);

-- ── Screens ──────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE screens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT,
  address         TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  type            screen_type NOT NULL DEFAULT 'billboard',
  size_w          INTEGER NOT NULL DEFAULT 1920,
  size_h          INTEGER NOT NULL DEFAULT 1080,
  status          screen_status NOT NULL DEFAULT 'offline',
  cpm_base        NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  device_id       TEXT UNIQUE,
  last_heartbeat  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_screens_tenant ON screens(tenant_id);
CREATE INDEX idx_screens_status ON screens(status);
CREATE INDEX idx_screens_city ON screens(city);

-- ── Campaigns ───────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  advertiser      TEXT NOT NULL DEFAULT '',
  objective       TEXT NOT NULL DEFAULT 'awareness',
  status          campaign_status NOT NULL DEFAULT 'draft',
  budget          NUMERIC(12,2) NOT NULL DEFAULT 0,
  budget_spent    NUMERIC(12,2) NOT NULL DEFAULT 0,
  cpm             NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  impressions     BIGINT NOT NULL DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  targeting       JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ── Creatives ───────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE creatives (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id   UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  type          creative_type NOT NULL DEFAULT 'image',
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  duration      INTEGER NOT NULL DEFAULT 15,
  width         INTEGER NOT NULL DEFAULT 1920,
  height        INTEGER NOT NULL DEFAULT 1080,
  file_size     BIGINT,
  status        creative_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creatives_tenant ON creatives(tenant_id);
CREATE INDEX idx_creatives_campaign ON creatives(campaign_id);

-- ── Playlists ───────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE playlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  screen_id   UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  items       JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playlists_screen ON playlists(screen_id);

-- ── Proof of Play ─────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE proof_of_play (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  screen_id     UUID NOT NULL REFERENCES screens(id),
  campaign_id   UUID REFERENCES campaigns(id),
  creative_id   UUID REFERENCES creatives(id),
  duration      INTEGER NOT NULL,
  content_hash  TEXT NOT NULL,
  merkle_root   TEXT,
  polygon_tx    TEXT,
  tsa_hash      TEXT,
  played_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pop_tenant ON proof_of_play(tenant_id);
CREATE INDEX idx_pop_screen ON proof_of_play(screen_id);
CREATE INDEX idx_pop_campaign ON proof_of_play(campaign_id);
CREATE INDEX idx_pop_played_at ON proof_of_play(played_at DESC);

-- ── Subscriptions & Billing ───────────────────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                 UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan                      plan_type NOT NULL DEFAULT 'starter',
  status                    subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  pagarme_subscription_id   TEXT,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  subscription_id   UUID REFERENCES subscriptions(id),
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'BRL',
  status            TEXT NOT NULL DEFAULT 'draft',
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  nfe_key           TEXT,
  stripe_invoice_id TEXT,
  pdf_url           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);

-- ── Webhooks ────────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE webhooks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  events      TEXT[] NOT NULL DEFAULT '{}',
  secret      TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_fired  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id    UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event         TEXT NOT NULL,
  payload       JSONB NOT NULL,
  response_code INTEGER,
  duration_ms   INTEGER,
  success       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);

-- ── Audit Log ──────────────────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID REFERENCES tenants(id),
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  resource    TEXT NOT NULL,
  resource_id TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ── Updated_at triggers ────────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_screens_updated BEFORE UPDATE ON screens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_creatives_updated BEFORE UPDATE ON creatives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────────────────────────────

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_play ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: retorna tenant_id do usuário logado
CREATE OR REPLACE FUNCTION my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas: cada usuário vê apenas dados do próprio tenant
CREATE POLICY "tenant_isolation" ON tenants          FOR ALL USING (id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON user_profiles    FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON screens          FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON campaigns        FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON creatives        FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON playlists        FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON proof_of_play    FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON subscriptions    FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON invoices         FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON webhooks         FOR ALL USING (tenant_id = my_tenant_id());
CREATE POLICY "tenant_isolation" ON webhook_logs     FOR ALL USING (
  webhook_id IN (SELECT id FROM webhooks WHERE tenant_id = my_tenant_id())
);
CREATE POLICY "tenant_isolation" ON audit_log        FOR ALL USING (tenant_id = my_tenant_id());

-- Android player: pode inserir proof_of_play com device_id autenticado
CREATE POLICY "player_insert_pop" ON proof_of_play FOR INSERT
  WITH CHECK (
    screen_id IN (
      SELECT id FROM screens
      WHERE device_id = (auth.jwt() ->> 'device_id')
    )
  );
