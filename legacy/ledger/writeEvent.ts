import crypto from "crypto"
import { pool } from "@/lib/db"
import { invalidateCache } from "@/lib/cache"

type WriteEventInput = {
  payload: Record<string, any>
}

// 🔐 stringify determinístico
function stableStringify(obj: any): string {
  return JSON.stringify(sortObject(obj))
}

function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject)
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObject(obj[key])
        return acc
      }, {})
  }
  return obj
}

function computeHash(payload: any, previousHash: string | null) {
  const data = stableStringify({
    payload,
    previous_hash: previousHash
  })
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

export async function writeEvent({ payload }: WriteEventInput) {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid payload")
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    await client.query("SET LOCAL statement_timeout = 5000")

    // 🔗 último hash encadeado
    const prevRes = await client.query(`
      SELECT event_hash
      FROM event_chain
      ORDER BY id DESC
      LIMIT 1
    `)
    const previousHash = prevRes.rows[0]?.event_hash || null

    // 🧠 idempotência
    const eventId = payload.event_id || payload.id || crypto.randomUUID()
    const eventType = payload.event_type || "AD_PLAY"

    const enrichedPayload = {
      ...payload,
      event_id: eventId,
      event_type: eventType,
      timestamp: payload.timestamp || new Date().toISOString()
    }

    const event_hash = computeHash(enrichedPayload, previousHash)

    // 🔥 🔒 REGISTRO GLOBAL — evita duplicatas
    try {
      await client.query(`
        INSERT INTO event_hash_registry (event_hash)
        VALUES ($1)
      `, [event_hash])
    } catch (err: any) {
      if (err.code === "23505") {
        await client.query("ROLLBACK")
        console.warn("⚠️ Duplicate event blocked:", event_hash)
        return null
      }
      throw err
    }

    // 💾 INSERT com colunas corretas da event_chain
    const insertRes = await client.query(`
      INSERT INTO event_chain (
        event_id,
        event_type,
        event_hash,
        previous_event_hash,
        payload,
        occurred_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [
      eventId,
      eventType,
      event_hash,
      previousHash,
      enrichedPayload
    ])

    await client.query("COMMIT")

    console.log("✅ writeEvent OK:", { event_hash, eventId, eventType })

    // 🔥 cache resiliente
    try {
      await Promise.all([
        invalidateCache("trust:summary"),
        invalidateCache(`verify:${event_hash}`)
      ])
    } catch (cacheError) {
      console.warn("cache error", cacheError)
    }

    return insertRes.rows[0]

  } catch (error) {
    await client.query("ROLLBACK")
    console.error("writeEvent error", { payload, error })
    throw new Error("failed to write event")
  } finally {
    client.release()
  }
}