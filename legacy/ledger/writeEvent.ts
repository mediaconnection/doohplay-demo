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

    // 🔗 último hash
    const prevRes = await client.query(`
      SELECT event_hash
      FROM event_chain
      ORDER BY id DESC
      LIMIT 1
    `)

    const previousHash =
      prevRes.rows[0]?.event_hash || null

    // 🧠 idempotência
    const eventId = payload.event_id || crypto.randomUUID()

    const enrichedPayload = {
      ...payload,
      event_id: eventId,
      timestamp: payload.timestamp || new Date().toISOString()
    }

    const event_hash = computeHash(
      enrichedPayload,
      previousHash
    )

    // 🔥 🔒 REGISTRO GLOBAL (CORREÇÃO CRÍTICA)
    try {
      await client.query(`
        INSERT INTO event_hash_registry (event_hash)
        VALUES ($1)
      `, [event_hash])
    } catch (err: any) {

      if (err.code === "23505") {
        // duplicado → ignorar com segurança
        await client.query("ROLLBACK")

        console.warn("⚠️ Duplicate event blocked:", event_hash)

        return null
      }

      throw err
    }

    // 💾 INSERT real
    const insertRes = await client.query(`
      INSERT INTO event_chain (
        event_hash,
        previous_hash,
        payload
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [
      event_hash,
      previousHash,
      enrichedPayload
    ])

    await client.query("COMMIT")

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

    console.error("writeEvent error", {
      payload,
      error
    })

    throw new Error("failed to write event")

  } finally {
    client.release()
  }
}