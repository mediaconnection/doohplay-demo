// app/api/finance/setup/route.ts
// Roda migrations para as tabelas financeiras
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  const results: string[] = []

  const migrations = [
    // CPF/CNPJ na tabela de clientes
    `ALTER TABLE studio_clients ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20)`,
    `ALTER TABLE studio_clients ADD COLUMN IF NOT EXISTS person_type VARCHAR(10) DEFAULT 'FISICA'`,

    // CPF/CNPJ na tabela de leads
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20)`,

    // Tabela de subscriptions
    `CREATE TABLE IF NOT EXISTS financial_subscriptions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      asaas_customer_id VARCHAR(50),
      asaas_subscription_id VARCHAR(50),
      plan VARCHAR(20) NOT NULL DEFAULT 'local',
      value DECIMAL(10,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Tabela de pagamentos
    `CREATE TABLE IF NOT EXISTS financial_payments (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) NOT NULL,
      asaas_payment_id VARCHAR(50),
      value DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      billing_type VARCHAR(20) DEFAULT 'PIX',
      due_date DATE,
      paid_at TIMESTAMPTZ,
      invoice_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Index
    `CREATE INDEX IF NOT EXISTS idx_financial_payments_code ON financial_payments(code)`,
    `CREATE INDEX IF NOT EXISTS idx_financial_subscriptions_code ON financial_subscriptions(code)`,
  ]

  for (const sql of migrations) {
    try {
      await pool.query(sql)
      results.push(`✅ ${sql.slice(0, 60)}...`)
    } catch (e: any) {
      results.push(`⚠️ ${sql.slice(0, 60)}... → ${e.message}`)
    }
  }

  return NextResponse.json({ ok: true, results })
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()

  // Check current schema
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE 'financial%'
    ORDER BY table_name
  `)

  const columns = await pool.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('studio_clients', 'leads', 'financial_subscriptions', 'financial_payments')
      AND column_name IN ('cpf_cnpj', 'person_type', 'asaas_customer_id', 'billing_type', 'due_date', 'invoice_url')
    ORDER BY table_name, column_name
  `)

  return NextResponse.json({
    financial_tables: tables.rows.map((r: any) => r.table_name),
    relevant_columns: columns.rows,
  })
}
