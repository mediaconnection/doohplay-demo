"use client"

import { useMemo, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"

const MerkleTreeReal = dynamic(
  () => import("@/components/merkle/MerkleTreeReal"),
  { ssr: false }
)

const MerkleProofView = dynamic(
  () => import("@/components/merkle/MerkleProofView"),
  { ssr: false }
)

type ProofStatus = "VERIFIED" | "WARNING" | "FAILED"

type ProofItem =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

type EventRow = {
  event_id?: string | null
  event_hash: string
  previous_event_hash?: string | null
  occurred_at?: string | null
  campaign_id?: string | null
  device_id?: string | null
  proof_status?: ProofStatus
  proof?: ProofItem[] | null
}

type BlockData = {
  id?: number | string | null
  block_hash?: string | null
  merkle_root?: string | null
  previous_hash?: string | null
  created_at?: string | null
  event_count?: number | null
  anchored?: boolean
  anchored_at?: string | null
  tx_hash?: string | null
  timestamp_token?: boolean
  signature_present?: boolean
}

type AuditData = {
  integrity_status?: "VERIFIED" | "WARNING" | "FAILED"
  trust_level?: "HIGH" | "MEDIUM" | "LOW"
  risk?: "LOW" | "MEDIUM" | "HIGH"
  reasons?: string[]
  audit_flags?: string[]
  trust_score?: number
  summary?: string
}

type CrossLayerValidation = {
  merkle_root_database?: string | null
  merkle_root_blockchain?: string | null
  merkle_vs_tx_match?: boolean
  tx_method?: string | null
  blockchain_valid?: boolean
  confirmations?: number | null
  reasons?: string[]
  audit_flags?: string[]
}

type BlockchainData = {
  anchored?: boolean
  checked?: boolean
  valid?: boolean
  tx_hash?: string | null
  network?: string | null
  method?: string | null
  contract_address?: string | null
  confirmations?: number | null
  block_number?: number | null
  status?: string | null
}

type LinksData = {
  polygon_url?: string | null
  public_block_url?: string | null
}

type BlockViewerProps = {
  block: BlockData
  events?: EventRow[] | null
  audit?: AuditData | null
  crossLayerValidation?: CrossLayerValidation | null
  blockchain?: BlockchainData | null
  links?: LinksData | null
}

function formatDate(value?: string | null): string {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleString("pt-BR")
}

function shortHash(value?: string | null): string {
  if (!value) return "—"

  if (value.length <= 18) {
    return value
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

function getRiskDot(status?: string): string {
  if (status === "VERIFIED") return "bg-emerald-500"
  if (status === "WARNING") return "bg-amber-400"

  return "bg-rose-500"
}

function normalizeEvents(events: EventRow[] | null | undefined): EventRow[] {
  if (!Array.isArray(events)) return []

  return events.filter(
    (event): event is EventRow =>
      Boolean(event && typeof event.event_hash === "string")
  )
}

export default function BlockViewer({
  block,
  events,
  audit,
  crossLayerValidation,
  blockchain,
  links
}: BlockViewerProps) {
  const normalizedEvents = useMemo(() => normalizeEvents(events), [events])

  const [selected, setSelected] = useState<string | null>(
    normalizedEvents[0]?.event_hash ?? null
  )

  const selectedEvent =
    normalizedEvents.find((event: EventRow) => event.event_hash === selected) ??
    normalizedEvents[0] ??
    null

  const leaves = normalizedEvents.map((event: EventRow) => event.event_hash)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="Audit Summary">
          <Metric label="Status" value={audit?.integrity_status} />
          <Metric
            label="Score"
            value={
              typeof audit?.trust_score === "number"
                ? `${audit.trust_score}/100`
                : "—"
            }
          />
          <Metric label="Trust" value={audit?.trust_level} />
          <Metric label="Risk" value={audit?.risk} />

          <p className="mt-3 text-sm">{audit?.summary ?? "—"}</p>
        </Panel>

        <Panel title="Cross-Layer">
          <Metric
            label="Root Match"
            value={
              crossLayerValidation?.merkle_vs_tx_match
                ? "CONSISTENT"
                : "MISMATCH ⚠️"
            }
          />

          <Metric label="Method" value={crossLayerValidation?.tx_method} />
          <Metric
            label="Confirmations"
            value={crossLayerValidation?.confirmations}
          />

          {crossLayerValidation?.merkle_vs_tx_match === false ? (
            <div className="mt-2 text-xs text-rose-600">
              ⚠️ Merkle inconsistency detected
            </div>
          ) : null}
        </Panel>

        <Panel title="Blockchain">
          <Metric label="Status" value={blockchain?.status} />
          <Metric label="Contract" value={blockchain?.contract_address} />
          <Metric label="Block" value={blockchain?.block_number} />

          {links?.polygon_url ? (
            <a
              href={links.polygon_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-blue-600"
            >
              View on Polygon
            </a>
          ) : null}
        </Panel>
      </section>

      <Panel title="Merkle Tree">
        {leaves.length > 0 ? (
          <MerkleTreeReal leaves={leaves} />
        ) : (
          <div className="text-sm text-slate-500">
            No leaves available for this block.
          </div>
        )}
      </Panel>

      <Panel title="Events">
        <div className="space-y-2">
          {normalizedEvents.length > 0 ? (
            normalizedEvents.map((event: EventRow, index: number) => (
              <button
                key={event.event_hash}
                type="button"
                onClick={() => setSelected(event.event_hash)}
                className="w-full rounded border p-3 text-left hover:bg-slate-50"
              >
                <div className="flex justify-between gap-3">
                  <span>Event #{index + 1}</span>

                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getRiskDot(
                        event.proof_status
                      )}`}
                    />
                    <span>{event.proof_status ?? "UNKNOWN"}</span>
                  </div>
                </div>

                <div className="text-xs font-mono">
                  {shortHash(event.event_hash)}
                </div>

                <div className="text-xs text-slate-500">
                  {formatDate(event.occurred_at)}
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-slate-500">
              No events available for this block.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Selected Event">
        {selectedEvent ? (
          <>
            <Metric label="Hash" value={selectedEvent.event_hash} />
            <Metric label="Date" value={formatDate(selectedEvent.occurred_at)} />
            <Metric label="Status" value={selectedEvent.proof_status} />

            <a
              href={`/verify/${selectedEvent.event_hash}`}
              className="mt-3 inline-block rounded bg-black px-4 py-2 text-white"
            >
              Verify Event
            </a>
          </>
        ) : (
          <div className="text-sm text-slate-500">No selected event.</div>
        )}
      </Panel>

      <Panel title="Merkle Proof">
        {selectedEvent?.proof?.length ? (
          <MerkleProofView
            leaf={selectedEvent.event_hash}
            root={block.merkle_root ?? ""}
            proof={selectedEvent.proof}
          />
        ) : (
          <div className="text-sm text-slate-500">
            No proof available (single event or backend not loaded)
          </div>
        )}
      </Panel>

      <Panel title="Timeline">
        {normalizedEvents.length > 0 ? (
          normalizedEvents.map((event: EventRow, index: number) => (
            <div key={event.event_hash} className="mb-3 flex gap-3">
              <div className="w-1 bg-slate-200" />

              <div>
                <div className="text-sm font-semibold">Event #{index + 1}</div>

                <div className="text-xs text-slate-500">
                  {formatDate(event.occurred_at)}
                </div>

                <div className="text-xs font-mono">
                  {shortHash(event.event_hash)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">No timeline available.</div>
        )}
      </Panel>
    </div>
  )
}

function Panel({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Metric({
  label,
  value
}: {
  label: string
  value?: ReactNode
}) {
  return (
    <div className="mb-1 flex justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="break-all text-right font-medium">{value ?? "—"}</span>
    </div>
  )
}