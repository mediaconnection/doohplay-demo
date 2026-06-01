// @ts-nocheck
import { buildBlock } from "../ledger/buildBlock"
import { createAnchor } from "../anchor/createAnchor"
import { generateProofCertificate } from "../generateProofCertificate"
import { pool } from "@/lib/db"

interface PipelineResult {
  blocks_created: number
  anchors_created: number
  certificates_created: number
}

async function generateCertificatesForBlock(blockHeight: number) {
  const res = await pool.query(`
    select id
    from impressions
    where block_height = $1
  `, [blockHeight])

  let count = 0
  for (const row of res.rows) {
    try {
      await generateProofCertificate("impression", row.id)
      count++
    } catch (err) {
      console.error("certificate error", row.id)
    }
  }
  return count
}

/**
 * Gera assinatura RSA-SHA256 para um hash hex
 */
function signHash(hashHex: string): string | null {
  try {
    const crypto = require('crypto')
    const privRaw = process.env.PRIVATE_PEM || ''
    if (!privRaw) return null
    const priv = privRaw.startsWith('-----')
      ? privRaw
      : ['-----BEGIN PRIVATE KEY-----', ...privRaw.match(/.{1,64}/g), '-----END PRIVATE KEY-----', ''].join('\n')
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(Buffer.from(hashHex.replace(/^0x/, ''), 'hex'))
    return sign.sign(priv, 'base64')
  } catch (e) {
    console.warn('[pipeline] signHash falhou:', e.message)
    return null
  }
}

/**
 * Obtém TSA timestamp RFC3161 para um dado
 */
async function getTsaToken(data: string): Promise<{ token: string | null, timestamp: string | null }> {
  try {
    const { writeFileSync, readFileSync, unlinkSync } = require('fs')
    const { spawn } = require('child_process')
    const { randomUUID } = require('crypto')
    const id = randomUUID()
    const inputFile = `/tmp/${id}.txt`
    const queryFile = `/tmp/${id}.tsq`
    const responseFile = `/tmp/${id}.tsr`
    writeFileSync(inputFile, data)
    await new Promise((resolve) => {
      const q = spawn('openssl', ['ts', '-query', '-data', inputFile, '-sha256', '-no_nonce', '-cert', '-out', queryFile])
      q.on('close', resolve)
    })
    await new Promise((resolve) => {
      const r = spawn('curl', ['-s', '-H', 'Content-Type: application/timestamp-query',
        '--data-binary', `@${queryFile}`, 'https://freetsa.org/tsr', '-o', responseFile])
      r.on('close', resolve)
    })
    const token = readFileSync(responseFile).toString('base64')
    const timestamp = new Date().toISOString()
    try { unlinkSync(inputFile) } catch {}
    try { unlinkSync(queryFile) } catch {}
    try { unlinkSync(responseFile) } catch {}
    console.log('[pipeline] TSA timestamp obtido')
    return { token, timestamp }
  } catch (e) {
    console.warn('[pipeline] TSA falhou:', e.message)
    return { token: null, timestamp: null }
  }
}

/**
 * Cria certification para o bloco E popula event_chain com assinatura e event_id
 */
async function createCertificationForBlock(block) {
  const merkleRoot = block.merkle_root
  if (!merkleRoot) return 0

  // 1. Assinar o merkle_root
  const sig = signHash(merkleRoot)
  if (!sig) { console.warn('[pipeline] sem assinatura, abortando cert'); return 0 }

  // 2. TSA timestamp
  const { token: tsaToken, timestamp: tsaTimestamp } = await getTsaToken(merkleRoot)

  // 3. Garantir event_id em todos os eventos do bloco sem UUID
  await pool.query(`
    UPDATE public.event_chain
    SET event_id = gen_random_uuid()
    WHERE block_id = $1 AND event_id IS NULL
  `, [block.block_id || block.id])

  // 4. Salvar assinatura no event_chain (para o adapter getLedgerEventCertification)
  await pool.query(`
    UPDATE public.event_chain
    SET signature = $1
    WHERE block_id = $2 AND (signature IS NULL OR signature = '')
  `, [sig, block.block_id || block.id])

  // 5. Inserir na tabela certifications
  const error = await pool.query(
    `INSERT INTO certifications (content_hash, entity_id, entity_type, merkle_root, signature, tsa_token, tsa_timestamp)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (content_hash) DO UPDATE SET
       signature = EXCLUDED.signature,
       merkle_root = EXCLUDED.merkle_root,
       tsa_token = COALESCE(EXCLUDED.tsa_token, certifications.tsa_token),
       tsa_timestamp = COALESCE(EXCLUDED.tsa_timestamp, certifications.tsa_timestamp)`,
    [merkleRoot, String(block.block_id || merkleRoot.slice(0, 36)), 'event', merkleRoot, sig, tsaToken, tsaTimestamp]
  ).then(() => null).catch(e => e)

  if (error) { console.error('[pipeline] cert error:', error.message); return 0 }
  console.log('[pipeline] certification criada:', merkleRoot.slice(0, 16) + '...')
  return 1
}

export async function runProofPipeline(): Promise<PipelineResult> {
  let blocks = 0
  let anchors = 0
  let certs = 0

  /*
  STEP 1 — criar bloco do ledger
  */
  const block = await buildBlock()

  if (block.created) {
    blocks++
    const blockHeight = block.block.block_height

    /*
    STEP 2 — gerar certificados de impressions (legado)
    */
    const createdCerts = await generateCertificatesForBlock(blockHeight)
    certs += createdCerts

    /*
    STEP 2b — criar certification para o bloco com assinatura + TSA
    */
    certs += await createCertificationForBlock(block.block)
  }

  /*
  STEP 3 — criar anchor periódico na Polygon
  */
  const anchor = await createAnchor()

  if (anchor) {
    anchors++

    if (anchor.anchor_network === 'polygon' && anchor.anchor_tx) {
      const merkleAnchored = anchor.merkle_root

      // Atualizar certifications com o tx_hash do anchor
      await pool.query(
        `UPDATE certifications
         SET blockchain_tx = $1, tx_hash = $1
         WHERE (blockchain_tx IS NULL OR blockchain_tx = '' OR blockchain_tx = tx_hash)`,
        [anchor.anchor_tx]
      ).catch(e => console.warn('[pipeline] update cert tx_hash failed:', e.message))

      // Atualizar event_chain com o tx_hash do anchor Polygon
      if (merkleAnchored) {
        await pool.query(
          `UPDATE public.event_chain ec
           SET tx_hash = $1
           FROM public.event_blocks eb
           WHERE ec.block_id = eb.id
             AND lower(replace(eb.merkle_root, '0x', '')) = lower(replace($2, '0x', ''))
             AND (ec.tx_hash IS NULL OR ec.tx_hash = '')`,
          [anchor.anchor_tx, merkleAnchored]
        ).catch(e => console.warn('[pipeline] update event_chain tx_hash failed:', e.message))
      }

      console.log('[pipeline] anchor Polygon registrado:', anchor.anchor_tx)
    }
  }

  return {
    blocks_created: blocks,
    anchors_created: anchors,
    certificates_created: certs
  }
}
