-- Core table migration for DOOHPLAY
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING

-- ============================================================
-- campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- event_blocks  (must exist before event_chain FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_blocks (
  id               BIGSERIAL   PRIMARY KEY,
  merkle_root      TEXT        NOT NULL,
  block_hash       TEXT        NOT NULL,
  prev_block_hash  TEXT,
  tx_hash          TEXT,
  network          TEXT,
  anchored_at      TIMESTAMPTZ,
  tsa_token        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_blocks_merkle_root
  ON public.event_blocks (merkle_root);

-- ============================================================
-- event_chain  (append-only ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_chain (
  id           BIGSERIAL   PRIMARY KEY,
  event_id     UUID,
  event_hash   TEXT        NOT NULL,
  prev_hash    TEXT,
  payload      JSONB,
  signature    TEXT,
  block_id     BIGINT      REFERENCES public.event_blocks (id),
  merkle_proof JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_chain_event_hash
  ON public.event_chain (event_hash);

CREATE INDEX IF NOT EXISTS idx_event_chain_block_id
  ON public.event_chain (block_id);

CREATE INDEX IF NOT EXISTS idx_event_chain_created_at
  ON public.event_chain (created_at);

-- ============================================================
-- impressions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.impressions (
  id           BIGSERIAL   PRIMARY KEY,
  screen_id    TEXT        NOT NULL,
  campaign_id  TEXT        NOT NULL,
  creative_id  TEXT        NOT NULL,
  player_id    TEXT,
  device_id    TEXT,
  played_at    TIMESTAMPTZ,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impressions_campaign_id
  ON public.impressions (campaign_id);

CREATE INDEX IF NOT EXISTS idx_impressions_played_at
  ON public.impressions (played_at);

-- ============================================================
-- play_logs_certified
-- ============================================================
CREATE TABLE IF NOT EXISTS public.play_logs_certified (
  id               BIGSERIAL   PRIMARY KEY,
  campaign_id      UUID,
  duration_seconds INTEGER,
  started_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_play_logs_certified_campaign_id
  ON public.play_logs_certified (campaign_id);

CREATE INDEX IF NOT EXISTS idx_play_logs_certified_created_at
  ON public.play_logs_certified (created_at);

-- ============================================================
-- blockchain_anchor
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blockchain_anchor (
  id               BIGSERIAL   PRIMARY KEY,
  block_id         BIGINT,
  merkle_root      TEXT        NOT NULL,
  tx_hash          TEXT,
  network          TEXT        NOT NULL,
  contract_address TEXT,
  method           TEXT,
  block_number     INTEGER,
  status           TEXT,
  anchored_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_blockchain_anchor_root_network UNIQUE (merkle_root, network)
);

-- ============================================================
-- trust_graph_nodes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trust_graph_nodes (
  id         TEXT        PRIMARY KEY,
  node_type  TEXT        NOT NULL CHECK (node_type IN ('event', 'device', 'campaign')),
  ref_id     TEXT        NOT NULL,
  label      TEXT        NOT NULL,
  score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  risk       TEXT        NOT NULL DEFAULT 'SAFE' CHECK (risk IN ('SAFE', 'WATCH', 'HIGH_RISK')),
  metadata   JSONB       NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trust_graph_nodes_type_ref
  ON public.trust_graph_nodes (node_type, ref_id);

CREATE INDEX IF NOT EXISTS idx_trust_graph_nodes_risk
  ON public.trust_graph_nodes (risk);

CREATE INDEX IF NOT EXISTS idx_trust_graph_nodes_score
  ON public.trust_graph_nodes (score);

-- ============================================================
-- trust_graph_edges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trust_graph_edges (
  id        BIGSERIAL  PRIMARY KEY,
  source_id TEXT       NOT NULL REFERENCES public.trust_graph_nodes (id) ON DELETE CASCADE,
  target_id TEXT       NOT NULL REFERENCES public.trust_graph_nodes (id) ON DELETE CASCADE,
  edge_type TEXT       NOT NULL CHECK (
    edge_type IN ('event_previous', 'event_device', 'event_campaign', 'device_campaign')
  ),
  weight    NUMERIC(8,2) NOT NULL DEFAULT 1,
  risk      TEXT       NOT NULL DEFAULT 'LOW' CHECK (risk IN ('LOW', 'MEDIUM', 'HIGH')),
  metadata  JSONB      NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trust_graph_edges_unique
  ON public.trust_graph_edges (source_id, target_id, edge_type);

CREATE INDEX IF NOT EXISTS idx_trust_graph_edges_source
  ON public.trust_graph_edges (source_id);

CREATE INDEX IF NOT EXISTS idx_trust_graph_edges_target
  ON public.trust_graph_edges (target_id);

CREATE INDEX IF NOT EXISTS idx_trust_graph_edges_type
  ON public.trust_graph_edges (edge_type);

-- ============================================================
-- PdfCertification  (Prisma-managed model)
-- ============================================================
CREATE TABLE IF NOT EXISTS "PdfCertification" (
  "id"          TEXT        NOT NULL,
  "pdfHash"     TEXT        NOT NULL,
  "signature"   TEXT        NOT NULL,
  "algorithm"   TEXT        NOT NULL,
  "certifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "generatedBy" TEXT        NOT NULL,
  "environment" TEXT        NOT NULL,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "publicKeyId" TEXT        NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PdfCertification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PdfCertification_pdfHash_key"
  ON "PdfCertification" ("pdfHash");
