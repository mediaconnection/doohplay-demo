# DOOHPLAY

Plataforma de verificação criptográfica para publicidade DOOH (Digital Out-of-Home).

## Stack

- Next.js 15 (App Router)
- PostgreSQL + Supabase
- Polygon blockchain (storeRoot)
- TSA RFC3161 (FreeTSA)
- RSA-SHA256 ICP signing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for required variables including `DATABASE_URL`, `PRIVATE_PEM`, `WALLET_PRIVATE_KEY`, `BLOCKCHAIN_RPC`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PROOF_CACHE_SECRET`, `REDIS_URL`.

## Verify an event

```bash
curl https://doohplay-demo.onrender.com/api/verify/{hash}
```

## Documentation

See `DOOHPLAY_Integracao.md` for full integration documentation.

<!-- rebuild 2026-06-01 -->
