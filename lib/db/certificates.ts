import { pool } from "@/lib/db"

export type CertificateRow = {
  id?: string | number
  hash?: string | null
  certificate_hash?: string | null
  subject?: string | null
  issuer?: string | null
  serial?: string | null
  signature?: string | null
  verify_url?: string | null
  created_at?: string | Date | null
  updated_at?: string | Date | null
  [key: string]: unknown
}

function normalizeHash(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
}

function isValidHash(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/.test(normalizeHash(value))
}

export async function getCertificateByHash(
  hash: string
): Promise<CertificateRow | null> {
  const normalized = normalizeHash(hash)

  if (!isValidHash(normalized)) {
    return null
  }

  const result = await pool.query(
    `
    select *
    from public.proof_certificates
    where lower(replace(hash, '0x', '')) = $1
       or lower(replace(certificate_hash, '0x', '')) = $1
    order by updated_at desc nulls last, created_at desc nulls last
    limit 1
    `,
    [normalized]
  )

  const rows = result.rows as CertificateRow[]

  return rows[0] ?? null
}

export async function certificateExists(hash: string): Promise<boolean> {
  return (await getCertificateByHash(hash)) !== null
}

export default getCertificateByHash