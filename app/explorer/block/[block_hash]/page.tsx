import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import BlockViewer from "@/components/block/BlockViewer"

export const dynamic = "force-dynamic"
export const revalidate = 0

type ProofItem =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

type ExplorerBlockResponse = {
  ok?: boolean
  error?: string
  code?: string
  message?: string

  block?: {
    id: number | null
    block_hash: string
    merkle_root: string | null
    previous_hash: string | null
    created_at: string | null
    event_count: number
    anchored: boolean
    anchored_at: string | null
    tx_hash: string | null
    timestamp_token: boolean
    signature_present: boolean
  }

  events?: Array<{
    event_id: string
    event_hash: string
    previous_event_hash: string | null
    occurred_at: string | null
    campaign_id: string | null
    device_id: string | null
    proof_status: "VERIFIED" | "WARNING" | "FAILED"
    proof: ProofItem[] | null
  }>

  merkle?: {
    root: string | null
    valid_format: boolean
    proofs_loaded: number
  }

  cross_layer_validation?: {
    merkle_root_database: string | null
    merkle_root_blockchain: string | null
    merkle_vs_tx_match: boolean
    tx_method: string
    blockchain_valid: boolean
    confirmations: number
    reasons: string[]
    audit_flags: string[]
  }

  blockchain?: {
    anchored: boolean
    checked: boolean
    valid: boolean
    tx_hash: string | null
    network: string
    method: string
    contract_address: string | null
    confirmations: number
    block_number: number | null
    status: string
  }

  audit?: {
    mode: "ETHERSCAN_PWC"
    integrity_status: "VERIFIED" | "WARNING" | "FAILED"
    trust_level: "HIGH" | "MEDIUM" | "LOW"
    risk: "LOW" | "MEDIUM" | "HIGH"
    reasons: string[]
    audit_flags: string[]
    trust_score: number
    summary: string
  }

  links?: {
    polygon_url: string | null
    public_block_url: string
  }
}

type BlockExplorerParams = {
  block_hash: string
}

function normalizeHash(value?: string | null): string {
  return String(value ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function formatDate(value?: string | null): string {
  if (!value) return "—"

  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString("pt-BR")
  } catch {
    return value
  }
}

function formatScore(value?: number | null): string {
  if (typeof value !== "number") return "—"
  return `${Math.round(value)}/100`
}

function statusClasses(status?: string): string {
  if (status === "VERIFIED") return "bg-emerald-600 text-white"
  if (status === "WARNING") return "bg-amber-500 text-white"
  return "bg-rose-600 text-white"
}

function trustClasses(level?: string): string {
  if (level === "HIGH") return "bg-emerald-50 text-emerald-700"
  if (level === "MEDIUM") return "bg-amber-50 text-amber-700"
  return "bg-rose-50 text-rose-700"
}

async function getBaseUrl(): Promise<string> {
  const h = await headers()

  const proto =
    h.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http")

  const host =
    h.get("host") ||
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, "") ||
    "localhost:3000"

  return `${proto}://${host}`
}

export default async function BlockExplorerPage({
  params
}: {
  params: Promise<BlockExplorerParams>
}) {
  const { block_hash } = await params
  const blockHash = normalizeHash(block_hash)

  if (!isValidHash(blockHash)) {
    return <div className="p-10 text-red-600">Hash inválido</div>
  }

  const baseUrl = await getBaseUrl()

  const res = await fetch(`${baseUrl}/api/explorer/block/${blockHash}`, {
    cache: "no-store"
  })

  if (res.status === 404) {
    notFound()
  }

  const data = (await res.json()) as ExplorerBlockResponse

  if (!data.block) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-3xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Block Explorer</h1>
              <p className="text-sm text-slate-500">
                Auditoria completa do bloco
              </p>
            </div>

            <div className="flex gap-3">
              <span
                className={`rounded px-3 py-1 ${statusClasses(
                  data.audit?.integrity_status
                )}`}
              >
                {data.audit?.integrity_status ?? "UNKNOWN"}
              </span>

              <span
                className={`rounded px-3 py-1 ${trustClasses(
                  data.audit?.trust_level
                )}`}
              >
                {data.audit?.trust_level ?? "UNKNOWN"}
              </span>
            </div>
          </div>

          <div className="mt-4 break-all font-mono text-lg">
            {data.block.block_hash}
          </div>

          <div className="mt-2 text-sm text-slate-500">
            {formatDate(data.block.created_at)}
          </div>

          <div className="mt-3 text-xl font-bold">
            Score: {formatScore(data.audit?.trust_score)}
          </div>
        </section>

        <section className="mt-6">
          <BlockViewer
            block={data.block}
            events={data.events ?? []}
            audit={data.audit}
            crossLayerValidation={data.cross_layer_validation}
            blockchain={data.blockchain}
            links={data.links}
          />
        </section>

        <div className="mt-6 flex gap-4">
          {data.links?.polygon_url ? (
            <a
              href={data.links.polygon_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              PolygonScan
            </a>
          ) : null}

          <Link href="/verify" className="text-blue-600 hover:underline">
            Voltar
          </Link>
        </div>
      </div>
    </main>
  )
}