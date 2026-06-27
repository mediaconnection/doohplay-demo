# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## API Contract

The shared API contract for the web backend, player web, and native Android player lives in `docs/api-contract.md`.

Any contract change must be documented there before code changes. Do not keep separate copies of playlist, heartbeat, or proof-of-play contracts in other project docs; link back to `docs/api-contract.md` instead. This rule exists because the 2026-06-25 Android/web divergence caused wrong categories and cross-client playlist leakage.

## Parallel Production App Front

Warning: this repository contains two separate development fronts that coexist but must not be mixed accidentally.

This document primarily describes the cryptographic proof/audit system: `src/`, Polygon blockchain, Merkle proofs, trust graph, and ad server.

There is a second front under `app/` that is the real production DOOHPLAY product serving a real customer: `BARBE332` / Barbearia Zimermam. That front includes the customer dashboard (`app/dashboard/`), admin panel (`app/admin/`), advertiser portal (`app/anunciante/`), Asaas billing (`lib/asaas.ts`), and player playlist APIs (`app/api/client/playlist/`). It uses direct `pg.Pool` access through `lib/db.ts` / `getPool()`, not Prisma, and has its own continuity script maintained in separate Claude.ai web sessions.

Mandatory rule: if a task asks for changes inside `app/api/`, `app/dashboard/`, `app/admin/`, `app/anunciante/`, `app/player/`, `lib/asaas.ts`, or database tables such as `studio_clients`, `Advertiser`, `Campaign`, `CampaignMedia`, `CampaignScreen`, or `campaign_payments`, stop and ask the user whether this is the correct front before proceeding. Do not assume the task belongs to the proof/blockchain system just because it is in the same repository.

Reason: on 2026-06-25, the Android front edited files in the `app/` production front without coordination, causing a production regression with wrong ad categories and cross-client content leakage for several hours. The same risk exists in the opposite direction: this `src/` proof/audit front can accidentally edit `app/` without realizing it is real production code.

Status of active development in this `src/` proof/blockchain front relative to the `app/` production front is not confirmed by this note. Check with the team before assuming either front is paused.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run worker       # Run BullMQ event worker (tsx worker.ts)
npm run worker:prod  # Run compiled worker (node dist/worker.js)
```

Prisma:
```bash
npx prisma generate           # Regenerate Prisma client after schema changes
npx prisma db push            # Push schema changes to database
npx prisma studio             # Open Prisma Studio
```

There are no automated tests in this codebase.

## Architecture

**DOOHPLAY** is a DOOH (Digital Out-Of-Home) advertising transparency and audit platform. Every ad impression goes through a cryptographic proof pipeline: events are written to an immutable ledger, grouped into Merkle-tree blocks, signed with RSA, and anchored on the Polygon blockchain. Advertisers and auditors can publicly verify any impression via a hash.

### Path Aliases

`@/*` resolves to **both** `./src/*` and `./` (repo root). When a module exists in both locations, prefer `src/`. The `@/components/*` alias resolves to `./components/*` and `./src/components/*`.

### Database Layer

Three database clients coexist:

| Client | Module | Use |
|--------|--------|-----|
| `pg.Pool` | `@/lib/db` (root `lib/db.ts`) | Direct SQL queries to PostgreSQL — used by most API routes |
| Supabase JS | `lib/supabase/client.ts` or `src/lib/supabase.ts` | Auth and realtime |
| Prisma | `src/lib/prisma.ts` | Only the `PdfCertification` model (schema: `prisma/schema.prisma`) |

Primary tables (raw PostgreSQL, not in Prisma schema): `event_chain`, `event_blocks`, `impressions`, `play_logs_certified`, `campaigns`, `block_anchors`.

### Redis / Queue

Two Redis client instances exist:
- `src/lib/queue/redis.ts` — hardcoded `127.0.0.1:6379`, used by the src-tree BullMQ worker
- `lib/redis.ts` and `lib/queue/connection.ts` — use `REDIS_URL` env var

BullMQ queue `event-queue` processes `write-event` jobs. The separate worker process (`npm run worker`) must be running alongside the Next.js server in production.

### Cryptographic Proof Pipeline

The core trust mechanism runs as a cron job at `GET /api/cron/proof-pipeline` → `lib/proof/scheduler/runProofPipeline.ts`:

1. **Append event** (`lib/domain/ledger/appendEvent.ts`) — each impression is hashed with the previous event hash (blockchain-style chain) and stored in `event_chain`
2. **Build block** — groups pending events, computes Merkle root
3. **Generate certificates** — RSA-signs each impression's proof; stored in `PdfCertification` (Prisma)
4. **Anchor** (`lib/proof/anchor/createAnchor.ts`) — sends the Merkle root to the `DOOHPLAYAnchor` smart contract on Polygon

RSA signing: private key at `keys/private.pem` (not versioned). Public key is versioned. The signer in `src/services/pdf/pdfSigner.ts` uses Node's `crypto.createSign("RSA-SHA256")`.

PDF generation uses **`pdfkit/js/pdfkit.standalone`** (not the regular `pdfkit` import) to avoid bundling issues in Next.js.

### Smart Contract

`doohplay-contract/contracts/DOOHPLAYAnchor.sol` — Hardhat project. The contract stores Merkle roots on-chain. Verification: `BLOCKCHAIN_RPC` + `ANCHOR_CONTRACT_ADDRESS` env vars feed `src/lib/blockchain/verifyAnchor.ts`, which calls `isAnchored(bytes32)` and `anchorIndex(bytes32)` on the contract.

### Public Verification Portal

`/verify/[hash]` (server component) — fetches `/api/verify/[hash]`, normalizes the deeply polymorphic response via `normalizeUiResult()`, and renders trust score, evidence matrix, and layer details. The response schema is intentionally permissive to support multiple verification engine versions.

### Ad Server

`POST /api/adserver/play` → `lib/adserver/selectCreative.ts` — selects a creative for a screen.
`POST /api/adserver/impression` → `lib/adserver/registerImpression.ts` — records impression and enqueues the ledger write.

### Trust Graph & Alerts

- **Trust graph** (`src/lib/trust-graph/`) — analyzes relationships between screens, campaigns, advertisers, and operators to detect fraud clusters. Nodes score from 0–100; below 40 = `HIGH_RISK`.
- **Alert engine** (`src/lib/alerts/engine/`) — policy-based pipeline: `evaluatePolicies` → `enrichAlert` → `computeRiskScore` → `persistAlert` → `auditAlert`. Policy definitions in `src/lib/alerts/policies/`.

### Dashboard

`/dashboard` — client-side page with period filter (`today` / `7d` / `30d`). Components fetch data independently from `/api/reports/*` endpoints. Each component is wrapped in a `SafeBlock` error boundary.

## Environment Variables

```
# Database
DATABASE_URL                    # PostgreSQL connection string (used by pg Pool and Prisma)

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redis
REDIS_URL                       # Used by lib/redis.ts and lib/queue/connection.ts

# Blockchain (Polygon)
BLOCKCHAIN_RPC                  # JSON-RPC endpoint
ANCHOR_CONTRACT_ADDRESS         # DOOHPLAYAnchor contract address

# API security
PUBLIC_API_KEY                  # Checked via x-api-key header in lib/security/validateApiKey.ts

# App
NEXT_PUBLIC_BASE_URL            # Used to build absolute URLs server-side
```

## Key Conventions

- API routes return `Response.json(...)` (native Web API), not `NextResponse.json(...)`, unless they need headers (e.g., CSV export uses `NextResponse`).
- All SQL queries go through `pool.query(...)` with parameterized `$1, $2, ...` placeholders — never string interpolation.
- Dates and periods (today / 7d / 30d) are always resolved server-side to ISO strings before hitting the database.
- The UI language is Portuguese (pt-BR); keep user-facing strings in Portuguese.
