import Link from "next/link"
import type { ReactNode } from "react"

import CopyButton from "@/components/ui/CopyButton"
import TimeAgo from "@/components/ui/TimeAgo"
import Badge from "@/components/ui/Badge"
import MerkleViewer from "@/components/merkle/MerkleViewer"
import VerifyButton from "@/components/proof/VerifyButton"
import CertificateButton from "@/components/proof/CertificateButton"

export const revalidate = 10

type ProofStep = {
  hash: string
  position?: "left" | "right"
}

type ExplorerEventResponse = {
  ok: true
  event: {
    event_id: string
    event_hash: string
    block_hash: string | null
    merkle_root: string | null
    occurred_at: string | null
    tx_hash: string | null
    merkle_proof: ProofStep[] | null
  }
  verification: {
    anchored: boolean
    hash_valid: boolean
    merkle_root_valid: boolean
    merkle_proof_valid: boolean
    tx_valid: boolean
  }
  blockchain: {
    network: string
    anchored: boolean
    tx_hash: string | null
  }
  audit: {
    integrity_status: "VERIFIED" | "WARNING" | "FAILED"
    trust_level: "HIGH" | "MEDIUM" | "LOW"
    reasons: string[]
    trust_score: number
  }
}

type ExplorerEventErrorResponse = {
  ok: false
  error: string
  code:
    | "INVALID_EVENT_ID"
    | "EVENT_NOT_FOUND"
    | "DB_TIMEOUT"
    | "INTERNAL_ERROR"
}

type EventPageParams = {
  event_id: string
}

function normalizeId(id?: string | null): string {
  return typeof id === "string" ? id.trim() : ""
}

function normalizeHex(value?: string | null): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/^0x/, "")
    : ""
}

function format0xHash(value?: string | null): string {
  const normalized = normalizeHex(value)
  return normalized ? `0x${normalized}` : ""
}

function shortHash(hash?: string | null, start = 12, end = 8): string {
  const formatted = format0xHash(hash)

  if (!formatted) return "—"
  if (formatted.length <= start + end + 3) return formatted

  return `${formatted.slice(0, start)}...${formatted.slice(-end)}`
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{6,}$/.test(id)
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

function renderErrorCard(message: string) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {message}
      </div>
    </div>
  )
}

function renderNotFoundCard() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          EVENT NOT FOUND
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Evento não encontrado
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Não foi possível localizar este evento no explorer público do DOOHPLAY.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/verify"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ir para verificação
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ir para o portal
          </Link>
        </div>
      </div>
    </div>
  )
}

async function getEventExplorerData(
  eventId: string
): Promise<ExplorerEventResponse | ExplorerEventErrorResponse> {
  const url = `${getBaseUrl()}/api/explorer/event/${encodeURIComponent(eventId)}`

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 }
  })

  return (await response.json()) as
    | ExplorerEventResponse
    | ExplorerEventErrorResponse
}

export default async function EventPage({
  params
}: {
  params: Promise<EventPageParams>
}) {
  const { event_id } = await params
  const eventId = normalizeId(event_id)

  if (!isValidId(eventId)) {
    return renderErrorCard("Identificador de evento inválido.")
  }

  let response: ExplorerEventResponse | ExplorerEventErrorResponse

  try {
    response = await getEventExplorerData(eventId)
  } catch (error) {
    console.error("EVENT_PAGE_FETCH_ERROR", {
      event_id: eventId,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    })

    return renderErrorCard("Falha ao consultar a API do explorer do evento.")
  }

  if (!response.ok) {
    if (response.code === "EVENT_NOT_FOUND") {
      return renderNotFoundCard()
    }

    if (response.code === "INVALID_EVENT_ID") {
      return renderErrorCard("Identificador de evento inválido.")
    }

    if (response.code === "DB_TIMEOUT") {
      return renderErrorCard(
        "Tempo limite excedido ao consultar o evento. Tente novamente em instantes."
      )
    }

    return renderErrorCard(
      response.error || "Erro interno ao carregar os dados do evento."
    )
  }

  const { event, verification, blockchain, audit } = response

  const eventHash = format0xHash(event.event_hash)
  const merkleRoot = format0xHash(event.merkle_root)
  const blockHash = format0xHash(event.block_hash)
  const txHash = format0xHash(event.tx_hash)
  const proof = Array.isArray(event.merkle_proof) ? event.merkle_proof : null

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/verify"
            className="text-sm text-slate-500 transition hover:text-slate-900 hover:underline"
          >
            ← Voltar para verificação
          </Link>

          {verification.hash_valid ? (
            <Link
              href={`/verify/${normalizeHex(eventHash)}`}
              className="text-sm text-slate-500 transition hover:text-slate-900 hover:underline"
            >
              Abrir prova pública
            </Link>
          ) : null}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Explorer do Evento
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Event Proof
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Visualização pública do evento, integridade criptográfica,
                evidências Merkle e vínculo com prova auditável.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatusCard
                label="Integrity"
                value={audit.integrity_status}
                tone={
                  audit.integrity_status === "VERIFIED"
                    ? "green"
                    : audit.integrity_status === "WARNING"
                      ? "amber"
                      : "red"
                }
              />

              <StatusCard
                label="Trust Score"
                value={`${audit.trust_score} · ${audit.trust_level}`}
                tone={
                  audit.trust_level === "HIGH"
                    ? "green"
                    : audit.trust_level === "MEDIUM"
                      ? "amber"
                      : "red"
                }
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <VerifyButton hash={eventHash} entity_id={event.event_id} entity_type="event" />

            <CertificateButton
              hash={eventHash}
              entity_id={event.event_id}
              entity_type="event"
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MetaCard label="Event ID" value={event.event_id} mono />

            <MetaCard
              label="Event Hash"
              value={eventHash}
              mono
              copyValue={verification.hash_valid ? eventHash : undefined}
              invalid={!verification.hash_valid}
              invalidText="Formato de hash inválido."
            />

            <MetaCard
              label="Merkle Root"
              value={merkleRoot || "—"}
              mono
              copyValue={verification.merkle_root_valid ? merkleRoot : undefined}
              invalid={!!merkleRoot && !verification.merkle_root_valid}
              invalidText="Merkle root inválida."
            />

            <MetaCard
              label="Occurred"
              value={event.occurred_at ? <TimeAgo date={event.occurred_at} /> : "—"}
            />

            <MetaCard
              label="Block"
              value={
                blockHash ? (
                  <Link
                    href={`/explorer/block/${blockHash}`}
                    className="font-mono text-blue-600 underline"
                  >
                    {shortHash(blockHash)}
                  </Link>
                ) : (
                  "—"
                )
              }
            />

            <MetaCard
              label="Transaction"
              value={
                txHash ? (
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 underline"
                    >
                      {shortHash(txHash)}
                    </a>
                    <CopyButton value={txHash} />
                  </div>
                ) : (
                  "—"
                )
              }
              invalid={!!txHash && !verification.tx_valid}
              invalidText="Formato de transação inválido."
            />

            <MetaCard
              label="Anchored"
              value={
                <Badge
                  label={verification.anchored ? "Anchored" : "Pending"}
                  variant={verification.anchored ? "success" : "warning"}
                />
              }
            />

            <MetaCard
              label="Blockchain"
              value={
                verification.anchored ? (
                  <span className="text-emerald-600">Verified on-chain</span>
                ) : (
                  <span className="text-amber-600">
                    Awaiting anchor confirmation
                  </span>
                )
              }
            />

            <MetaCard label="Network" value={blockchain.network || "—"} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Merkle Proof
              </h2>

              {verification.merkle_proof_valid &&
              verification.hash_valid &&
              verification.merkle_root_valid &&
              proof ? (
                <div className="mt-4">
                  <MerkleViewer leaf={eventHash} root={merkleRoot} proof={proof} />
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Nenhuma prova Merkle válida disponível para este evento.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Verification Signals
              </h2>

              <div className="mt-4 space-y-3">
                <MetricRow label="Hash Valid" value={verification.hash_valid ? "YES" : "NO"} />
                <MetricRow
                  label="Merkle Root Valid"
                  value={verification.merkle_root_valid ? "YES" : "NO"}
                />
                <MetricRow
                  label="Merkle Proof Valid"
                  value={verification.merkle_proof_valid ? "YES" : "NO"}
                />
                <MetricRow label="TX Valid" value={verification.tx_valid ? "YES" : "NO"} />
                <MetricRow label="Anchored" value={verification.anchored ? "YES" : "NO"} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Audit Signals
              </h2>

              <div className="mt-4 space-y-2">
                {audit.reasons.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Nenhuma ressalva material foi detectada nesta visão do evento.
                  </div>
                ) : (
                  audit.reasons.map((reason: string) => (
                    <div
                      key={reason}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                      {reason}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Executive Summary
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Este evento representa uma evidência individual no ledger DOOHPLAY,
                  com hash criptográfico, vínculo Merkle e possível ancoragem pública.
                </p>

                <p>
                  O nível atual de integridade foi classificado como{" "}
                  <strong>{audit.integrity_status}</strong>, com trust level{" "}
                  <strong>{audit.trust_level}</strong> e score{" "}
                  <strong>{audit.trust_score}</strong>.
                </p>

                <p>
                  A presença de hash válido, Merkle root consistente, prova carregada
                  e vínculo blockchain influencia diretamente a confiança final do Explorer.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}

function MetaCard({
  label,
  value,
  mono,
  copyValue,
  invalid,
  invalidText
}: {
  label: string
  value: ReactNode
  mono?: boolean
  copyValue?: string
  invalid?: boolean
  invalidText?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>

      <div
        className={[
          "mt-2 break-all text-sm text-slate-900",
          mono ? "font-mono" : ""
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div>{value}</div>
          {copyValue ? <CopyButton value={copyValue} /> : null}
        </div>
      </div>

      {invalid ? (
        <div className="mt-2 text-xs text-rose-600">
          {invalidText ?? "Valor inválido."}
        </div>
      ) : null}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[65%] break-all text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

function StatusCard({
  label,
  value,
  tone
}: {
  label: string
  value: string
  tone: "green" | "amber" | "red"
}) {
  const styles =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700"

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  )
}