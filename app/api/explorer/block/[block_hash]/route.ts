import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"
import { validateAnchoredMerkleRoot } from "@/lib/blockchain/validateAnchoredMerkleRoot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const DB_TIMEOUT_MS = 5000
const MAX_EVENTS = 500
const MAX_PROOF_ITEMS = 200
const MAX_PROOF_JSON_LENGTH = 50_000
const NETWORK_NAME = "polygon"

type ProofItem =
  | string
  | {
      position?: "left" | "right"
      hash: string
    }

type RawBlockchainValidation = Awaited<
  ReturnType<typeof validateAnchoredMerkleRoot>
>

type BlockchainValidation = RawBlockchainValidation & {
  merkle_root_onchain: string | null
  merkle_root_matches: boolean
  method: string
  valid: boolean
  checked: boolean
  confirmations: number
  reasons: string[]
  audit_flags: string[]
  contract_address: string | null
  block_number: number | null
  status: string
}

type BlockRecord = {
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
  signature: string | null
}

type EventRecord = {
  event_id: string
  event_hash: string
  previous_event_hash: string | null
  occurred_at: string | null
  campaign_id: string | null
  device_id: string | null
  proof_status: "VERIFIED" | "WARNING" | "FAILED"
  proof: ProofItem[] | null
}

type RouteParams = {
  block_hash: string
}

type ErrorResponse = {
  ok: false
  error: string
  code:
    | "INVALID_BLOCK_HASH"
    | "BLOCK_NOT_FOUND"
    | "DB_TIMEOUT"
    | "INTERNAL_ERROR"
}

type ExplorerBlockResponse = {
  ok: true
  block: {
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
  events: EventRecord[]
  merkle: {
    root: string | null
    valid_format: boolean
    proofs_loaded: number
  }
  cross_layer_validation: {
    merkle_root_database: string | null
    merkle_root_blockchain: string | null
    merkle_vs_tx_match: boolean
    tx_method: string
    blockchain_valid: boolean
    confirmations: number
    reasons: string[]
    audit_flags: string[]
  }
  blockchain: {
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
  audit: {
    mode: "ETHERSCAN_PWC"
    integrity_status: "VERIFIED" | "WARNING" | "FAILED"
    trust_level: "HIGH" | "MEDIUM" | "LOW"
    risk: "LOW" | "MEDIUM" | "HIGH"
    reasons: string[]
    audit_flags: string[]
    trust_score: number
    summary: string
  }
  links: {
    polygon_url: string | null
    public_block_url: string
  }
}

type TableExistsRow = {
  exists: boolean
}

type ColumnRow = {
  column_name: string
}

type RawBlockRow = {
  id: unknown
  block_hash: unknown
  merkle_root: unknown
  previous_hash: unknown
  created_at: unknown
  event_count: unknown
  tx_hash: unknown
  anchored_at: unknown
  timestamp_token: unknown
  signature: unknown
}

type RawEventRow = {
  event_id: unknown
  event_hash: unknown
  previous_event_hash: unknown
  occurred_at: unknown
  campaign_id: unknown
  device_id: unknown
  signature: unknown
  merkle_root: unknown
  proof: unknown
}

function strip0x(value?: string | null): string {
  return String(value ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function add0x(value?: string | null): string {
  const normalized = strip0x(value)
  return normalized ? `0x${normalized}` : ""
}

function isHexHash64(value?: string | null): boolean {
  if (typeof value !== "string") return false
  return /^[a-f0-9]{64}$/i.test(strip0x(value))
}

function formatStoredHash(value?: string | null): string | null {
  const normalized = add0x(value)
  return normalized || null
}

function normalizeProofHash(value?: string | null): string | null {
  if (!value) return null
  const normalized = add0x(value)
  return isHexHash64(normalized) ? normalized : null
}

function safeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function boolFrom(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "yes"
  }

  return false
}

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizePosition(value: unknown): "left" | "right" | undefined {
  if (typeof value !== "string") return undefined

  const normalized = value.trim().toLowerCase()
  return normalized === "left" || normalized === "right" ? normalized : undefined
}

function readUnknown(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined
  return (value as Record<string, unknown>)[key]
}

function safeBlockchainValidation(
  value: RawBlockchainValidation
): BlockchainValidation {
  const rootOnchain =
    safeString(readUnknown(value, "merkle_root_onchain")) ??
    safeString(readUnknown(value, "expected_root")) ??
    null

  const rootMatches =
    readUnknown(value, "merkle_root_matches") === true ||
    readUnknown(value, "root_found_in_tx") === true

  const anchored =
    readUnknown(value, "anchored") === true ||
    readUnknown(value, "valid") === true

  return {
    ...value,
    merkle_root_onchain: rootOnchain,
    merkle_root_matches: rootMatches,
    method: safeString(readUnknown(value, "method")) ?? "unknown",
    valid: anchored,
    checked: readUnknown(value, "checked") === true,
    confirmations: safeNumber(readUnknown(value, "confirmations")),
    reasons: Array.isArray(readUnknown(value, "reasons"))
      ? (readUnknown(value, "reasons") as string[])
      : [],
    audit_flags: Array.isArray(readUnknown(value, "audit_flags"))
      ? (readUnknown(value, "audit_flags") as string[])
      : [],
    contract_address: safeString(readUnknown(value, "contract_address")),
    block_number:
      readUnknown(value, "block_number") == null
        ? null
        : safeNumber(readUnknown(value, "block_number")),
    status: safeString(readUnknown(value, "status")) ?? "UNKNOWN"
  }
}

function parseProofItem(item: unknown): ProofItem | null {
  if (typeof item === "string") return normalizeProofHash(item)

  if (!item || typeof item !== "object" || Array.isArray(item)) return null

  const record = item as Record<string, unknown>

  const position =
    normalizePosition(record.position) ??
    normalizePosition(record.side) ??
    normalizePosition(record.direction)

  const hash =
    normalizeProofHash(safeString(record.hash)) ??
    normalizeProofHash(safeString(record.sibling)) ??
    normalizeProofHash(safeString(record.value))

  if (!hash) return null

  return position ? { position, hash } : { hash }
}

function parseProofValue(value: unknown): ProofItem[] | null {
  if (!value) return null

  let parsed: unknown = value

  if (typeof value === "string") {
    if (value.length > MAX_PROOF_JSON_LENGTH) return null

    try {
      parsed = JSON.parse(value)
    } catch {
      return null
    }
  }

  if (!Array.isArray(parsed)) return null

  const result = parsed
    .slice(0, MAX_PROOF_ITEMS)
    .map((item) => parseProofItem(item))
    .filter((item): item is ProofItem => item !== null)

  return result.length > 0 ? result : null
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("DB_TIMEOUT")), ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function jsonError(
  status: number,
  error: string,
  code: ErrorResponse["code"]
) {
  return NextResponse.json<ErrorResponse>(
    { ok: false, error, code },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  )
}

function getBaseUrl(req: NextRequest): string {
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http")

  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host")?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, "") ||
    "localhost:3000"

  return `${proto}://${host}`
}

function calcEventProofStatus(
  row: Record<string, unknown>,
  proof: ProofItem[] | null
): EventRecord["proof_status"] {
  const eventHash = safeString(row.event_hash)
  const previousEventHash = safeString(row.previous_event_hash)
  const signature = safeString(row.signature)
  const merkleRoot = safeString(row.merkle_root)

  if (
    eventHash &&
    isHexHash64(eventHash) &&
    (signature || merkleRoot || previousEventHash || (proof && proof.length > 0))
  ) {
    return "VERIFIED"
  }

  if (eventHash && isHexHash64(eventHash)) return "WARNING"

  return "FAILED"
}

function buildAudit(
  block: BlockRecord,
  events: EventRecord[],
  blockchain: BlockchainValidation
): ExplorerBlockResponse["audit"] {
  const reasons = new Set<string>()
  const auditFlags = new Set<string>()

  const hasValidBlockHash = isHexHash64(block.block_hash)
  const hasValidMerkleRoot = isHexHash64(block.merkle_root)
  const hasEvents = events.length > 0
  const hasTx = Boolean(block.tx_hash)

  const declaredEvents = block.event_count
  const loadedEvents = events.length
  const eventsTruncated = declaredEvents > MAX_EVENTS && loadedEvents === MAX_EVENTS
  const singleEventBlock = declaredEvents === 1 && loadedEvents === 1

  const verifiedEvents = events.filter(
    (event) => event.proof_status === "VERIFIED"
  ).length

  const failedEvents = events.filter(
    (event) => event.proof_status === "FAILED"
  ).length

  const proofsLoaded = events.filter(
    (event) => Array.isArray(event.proof) && event.proof.length > 0
  ).length

  let score = 0

  if (hasValidBlockHash) score += 10
  else reasons.add("BLOCK_HASH_INVALID")

  if (hasValidMerkleRoot) score += 15
  else reasons.add("MERKLE_ROOT_INVALID_OR_MISSING")

  if (hasEvents) score += 10
  else reasons.add("BLOCK_WITHOUT_EVENTS")

  if (declaredEvents > 0 && declaredEvents !== loadedEvents && !eventsTruncated) {
    reasons.add("EVENT_COUNT_MISMATCH")
    score -= 5
  }

  if (eventsTruncated) {
    reasons.add("EVENTS_TRUNCATED")
    auditFlags.add("Only the first batch of events was loaded for this block")
  }

  if (events.length > 0) {
    const verifiedRatio = verifiedEvents / events.length

    if (singleEventBlock) {
      score += 10
    } else if (verifiedRatio >= 0.9) {
      score += 10
    } else if (verifiedRatio >= 0.6) {
      score += 5
      reasons.add("PARTIAL_EVENT_PROOF_COVERAGE")
    } else {
      reasons.add("LOW_EVENT_PROOF_COVERAGE")
    }

    if (proofsLoaded === 0) {
      if (singleEventBlock) score += 10
      else reasons.add("MERKLE_PROOFS_NOT_LOADED")
    } else if (proofsLoaded < events.length) {
      reasons.add("PARTIAL_MERKLE_PROOFS")
      score += 5
    } else {
      score += 10
    }
  }

  if (failedEvents > 0) {
    reasons.add("EVENTS_WITH_FAILED_PROOF")
    score -= Math.min(10, failedEvents * 2)
  }

  if (block.anchored) score += 5
  else reasons.add("BLOCK_NOT_ANCHORED")

  if (hasTx) score += 5
  else reasons.add("TX_HASH_MISSING")

  if (block.timestamp_token) score += 5

  if (blockchain.checked) score += 5
  else reasons.add("BLOCKCHAIN_NOT_CHECKED")

  if (blockchain.valid) score += 20
  else reasons.add("BLOCKCHAIN_VALIDATION_FAILED")

  if (blockchain.merkle_root_matches) score += 15
  else reasons.add("MERKLE_ROOT_TX_MISMATCH")

  for (const reason of blockchain.reasons) reasons.add(reason)
  for (const flag of blockchain.audit_flags) auditFlags.add(flag)

  score = Math.max(0, Math.min(100, Math.round(score)))

  const integrity_status =
    score >= 90 ? "VERIFIED" : score >= 60 ? "WARNING" : "FAILED"

  const trust_level = score >= 90 ? "HIGH" : score >= 60 ? "MEDIUM" : "LOW"
  const risk = score >= 90 ? "LOW" : score >= 60 ? "MEDIUM" : "HIGH"

  return {
    mode: "ETHERSCAN_PWC",
    integrity_status,
    trust_level,
    risk,
    reasons: Array.from(reasons),
    audit_flags: Array.from(auditFlags),
    trust_score: score,
    summary:
      integrity_status === "VERIFIED"
        ? "Block validated against Merkle structure and decoded blockchain transaction."
        : integrity_status === "WARNING"
          ? "Block partially validated. Some Merkle or blockchain checks require audit review."
          : "Block failed one or more critical Merkle or blockchain validation checks."
  }
}

const tableExistsCache = new Map<string, boolean>()
const tableColumnsCache = new Map<string, Set<string>>()

async function tableExists(tableName: string): Promise<boolean> {
  const cached = tableExistsCache.get(tableName)
  if (typeof cached === "boolean") return cached

  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS exists
    `,
    [tableName]
  )

  const rows = result.rows as TableExistsRow[]
  const exists = rows[0]?.exists === true

  tableExistsCache.set(tableName, exists)

  return exists
}

async function getTableColumns(tableName: string): Promise<Set<string>> {
  const cached = tableColumnsCache.get(tableName)
  if (cached) return cached

  const result = await pool.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    `,
    [tableName]
  )

  const rows = result.rows as ColumnRow[]
  const columns = new Set<string>(rows.map((row) => String(row.column_name)))

  tableColumnsCache.set(tableName, columns)

  return columns
}

function selectFirstExisting(
  available: Set<string>,
  candidates: string[]
): string | null {
  for (const candidate of candidates) {
    if (available.has(candidate)) return candidate
  }

  return null
}

async function findBlockTable(): Promise<"event_blocks" | "ledger_blocks" | null> {
  if (await tableExists("event_blocks")) return "event_blocks"
  if (await tableExists("ledger_blocks")) return "ledger_blocks"
  return null
}

async function fetchBlockByHash(blockHash: string): Promise<{
  block: BlockRecord | null
  tableName: "event_blocks" | "ledger_blocks" | null
}> {
  const tableName = await findBlockTable()

  if (!tableName) return { block: null, tableName: null }

  const columns = await getTableColumns(tableName)

  const idCol = selectFirstExisting(columns, ["id", "block_id", "height"])
  const hashCol = selectFirstExisting(columns, ["block_hash", "hash"])
  const merkleCol = selectFirstExisting(columns, ["merkle_root"])
  const prevCol = selectFirstExisting(columns, [
    "previous_hash",
    "previous_block_hash",
    "prev_block_hash"
  ])
  const createdCol = selectFirstExisting(columns, [
    "created_at",
    "anchored_at",
    "timestamp",
    "block_timestamp"
  ])
  const countCol = selectFirstExisting(columns, ["event_count", "events_count"])
  const txCol = selectFirstExisting(columns, ["tx_hash", "blockchain_tx"])
  const anchoredAtCol = selectFirstExisting(columns, ["anchored_at"])
  const tsTokenCol = selectFirstExisting(columns, ["timestamp_token"])
  const signatureCol = selectFirstExisting(columns, ["signature"])

  if (!hashCol) return { block: null, tableName }

  const sql = `
    SELECT
      ${idCol ? `"${idCol}"` : "NULL"} AS id,
      "${hashCol}" AS block_hash,
      ${merkleCol ? `"${merkleCol}"` : "NULL"} AS merkle_root,
      ${prevCol ? `"${prevCol}"` : "NULL"} AS previous_hash,
      ${createdCol ? `"${createdCol}"` : "NULL"} AS created_at,
      ${countCol ? `COALESCE("${countCol}", 0)` : "0"} AS event_count,
      ${txCol ? `"${txCol}"` : "NULL"} AS tx_hash,
      ${anchoredAtCol ? `"${anchoredAtCol}"` : "NULL"} AS anchored_at,
      ${tsTokenCol ? `"${tsTokenCol}"` : "FALSE"} AS timestamp_token,
      ${signatureCol ? `"${signatureCol}"` : "NULL"} AS signature
    FROM "${tableName}"
    WHERE lower(replace("${hashCol}", '0x', '')) = $1
    LIMIT 1
  `

  const result = await pool.query(sql, [strip0x(blockHash)])
  const rows = result.rows as RawBlockRow[]
  const row = rows[0]

  if (!row) return { block: null, tableName }

  const txHash = safeString(row.tx_hash)
  const anchoredAt = toIsoOrNull(row.anchored_at)

  return {
    tableName,
    block: {
      id: row.id == null ? null : safeNumber(row.id),
      block_hash:
        formatStoredHash(safeString(row.block_hash) ?? blockHash) ??
        add0x(blockHash),
      merkle_root: safeString(row.merkle_root)
        ? formatStoredHash(safeString(row.merkle_root))
        : null,
      previous_hash: safeString(row.previous_hash)
        ? formatStoredHash(safeString(row.previous_hash))
        : null,
      created_at: toIsoOrNull(row.created_at),
      event_count: Math.max(0, safeNumber(row.event_count, 0)),
      anchored: Boolean(txHash) || Boolean(anchoredAt),
      anchored_at: anchoredAt,
      tx_hash: txHash ? formatStoredHash(txHash) : null,
      timestamp_token: boolFrom(row.timestamp_token),
      signature: safeString(row.signature)
    }
  }
}

async function fetchEventsForBlock(
  block: BlockRecord,
  blockTableName: "event_blocks" | "ledger_blocks" | null
): Promise<EventRecord[]> {
  if (!(await tableExists("event_chain"))) return []

  const columns = await getTableColumns("event_chain")

  const eventIdCol = selectFirstExisting(columns, ["event_id", "id"])
  const eventHashCol = selectFirstExisting(columns, ["event_hash", "hash"])
  const prevEventHashCol = selectFirstExisting(columns, ["previous_event_hash"])
  const occurredAtCol = selectFirstExisting(columns, ["occurred_at", "created_at"])
  const campaignIdCol = selectFirstExisting(columns, ["campaign_id"])
  const deviceIdCol = selectFirstExisting(columns, ["device_id"])
  const signatureCol = selectFirstExisting(columns, ["signature"])
  const merkleRootCol = selectFirstExisting(columns, ["merkle_root"])
  const proofCol = selectFirstExisting(columns, ["merkle_proof", "proof"])
  const blockIdCol = selectFirstExisting(columns, ["block_id"])
  const blockHashCol = selectFirstExisting(columns, ["block_hash"])
  const blockHeightCol = selectFirstExisting(columns, ["block_height"])

  if (!eventHashCol) return []

  const filters: string[] = []
  const values: unknown[] = []
  let index = 1

  if (blockIdCol && block.id != null) {
    filters.push(`"${blockIdCol}" = $${index++}`)
    values.push(block.id)
  }

  if (blockHashCol && block.block_hash) {
    filters.push(`lower(replace("${blockHashCol}", '0x', '')) = $${index++}`)
    values.push(strip0x(block.block_hash))
  }

  if (blockHeightCol && block.id != null && blockTableName === "ledger_blocks") {
    filters.push(`"${blockHeightCol}" = $${index++}`)
    values.push(block.id)
  }

  if (!filters.length) return []

  const orderExpression = occurredAtCol
    ? `"${occurredAtCol}" ASC NULLS LAST`
    : `"${eventHashCol}" ASC`

  const sql = `
    SELECT DISTINCT ON ("${eventHashCol}")
      ${eventIdCol ? `"${eventIdCol}"::text` : "''"} AS event_id,
      "${eventHashCol}" AS event_hash,
      ${prevEventHashCol ? `"${prevEventHashCol}"` : "NULL"} AS previous_event_hash,
      ${occurredAtCol ? `"${occurredAtCol}"` : "NULL"} AS occurred_at,
      ${campaignIdCol ? `"${campaignIdCol}"::text` : "NULL"} AS campaign_id,
      ${deviceIdCol ? `"${deviceIdCol}"::text` : "NULL"} AS device_id,
      ${signatureCol ? `"${signatureCol}"` : "NULL"} AS signature,
      ${merkleRootCol ? `"${merkleRootCol}"` : "NULL"} AS merkle_root,
      ${proofCol ? `"${proofCol}"` : "NULL"} AS proof
    FROM "event_chain"
    WHERE (${filters.join(" OR ")})
    ORDER BY "${eventHashCol}", ${orderExpression}
    LIMIT ${MAX_EVENTS}
  `

  const result = await pool.query(sql, values)
  const rows = result.rows as RawEventRow[]

  return rows.map((row) => {
    const proof = parseProofValue(row.proof)
    const rowRecord = row as Record<string, unknown>

    return {
      event_id: safeString(row.event_id) ?? safeString(row.event_hash) ?? "unknown",
      event_hash: formatStoredHash(safeString(row.event_hash)) ?? "",
      previous_event_hash: safeString(row.previous_event_hash)
        ? formatStoredHash(safeString(row.previous_event_hash))
        : null,
      occurred_at: toIsoOrNull(row.occurred_at),
      campaign_id: safeString(row.campaign_id),
      device_id: safeString(row.device_id),
      proof_status: calcEventProofStatus(rowRecord, proof),
      proof
    }
  })
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { block_hash } = await context.params
    const rawBlockHash = String(block_hash ?? "").trim()

    if (!isHexHash64(rawBlockHash)) {
      return jsonError(
        400,
        "Invalid block hash. Expected 64 hex chars with or without 0x prefix.",
        "INVALID_BLOCK_HASH"
      )
    }

    const { block, tableName } = await withTimeout(
      fetchBlockByHash(rawBlockHash),
      DB_TIMEOUT_MS
    )

    if (!block) {
      return jsonError(404, "Block not found.", "BLOCK_NOT_FOUND")
    }

    const events = await withTimeout(
      fetchEventsForBlock(block, tableName),
      DB_TIMEOUT_MS
    )

    const normalizedBlock: BlockRecord =
      block.event_count > 0
        ? block
        : {
            ...block,
            event_count: events.length
          }

    const rawBlockchainValidation = await validateAnchoredMerkleRoot({
      txHash: normalizedBlock.tx_hash,
      expectedRoot: normalizedBlock.merkle_root
    })

    const blockchainValidation = safeBlockchainValidation(rawBlockchainValidation)

    const audit = buildAudit(normalizedBlock, events, blockchainValidation)
    const baseUrl = getBaseUrl(req)
    const normalizedHash = strip0x(normalizedBlock.block_hash)

    const response: ExplorerBlockResponse = {
      ok: true,
      block: {
        id: normalizedBlock.id,
        block_hash: normalizedBlock.block_hash,
        merkle_root: normalizedBlock.merkle_root,
        previous_hash: normalizedBlock.previous_hash,
        created_at: normalizedBlock.created_at,
        event_count: normalizedBlock.event_count,
        anchored: normalizedBlock.anchored,
        anchored_at: normalizedBlock.anchored_at,
        tx_hash: normalizedBlock.tx_hash,
        timestamp_token: normalizedBlock.timestamp_token,
        signature_present: Boolean(normalizedBlock.signature)
      },
      events,
      merkle: {
        root: normalizedBlock.merkle_root,
        valid_format: isHexHash64(normalizedBlock.merkle_root),
        proofs_loaded: events.filter(
          (event) => Array.isArray(event.proof) && event.proof.length > 0
        ).length
      },
      cross_layer_validation: {
        merkle_root_database: normalizedBlock.merkle_root,
        merkle_root_blockchain: blockchainValidation.merkle_root_onchain,
        merkle_vs_tx_match: blockchainValidation.merkle_root_matches,
        tx_method: blockchainValidation.method,
        blockchain_valid: blockchainValidation.valid,
        confirmations: blockchainValidation.confirmations,
        reasons: blockchainValidation.reasons,
        audit_flags: blockchainValidation.audit_flags
      },
      blockchain: {
        anchored: normalizedBlock.anchored,
        checked: blockchainValidation.checked,
        valid: blockchainValidation.valid,
        tx_hash: normalizedBlock.tx_hash,
        network: NETWORK_NAME,
        method: blockchainValidation.method,
        contract_address: blockchainValidation.contract_address,
        confirmations: blockchainValidation.confirmations,
        block_number: blockchainValidation.block_number,
        status: blockchainValidation.status
      },
      audit,
      links: {
        polygon_url: normalizedBlock.tx_hash
          ? `https://polygonscan.com/tx/${normalizedBlock.tx_hash}`
          : null,
        public_block_url: `${baseUrl}/explorer/block/${normalizedHash}`
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("GET /api/explorer/block/[block_hash] error:", error)

    if (error instanceof Error && error.message === "DB_TIMEOUT") {
      return jsonError(
        504,
        "Database timeout while loading block explorer data.",
        "DB_TIMEOUT"
      )
    }

    return jsonError(
      500,
      "Internal server error while loading block explorer data.",
      "INTERNAL_ERROR"
    )
  }
}