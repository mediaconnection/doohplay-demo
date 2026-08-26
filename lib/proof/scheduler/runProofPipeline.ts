/**
 * @deprecated Este pipeline NUNCA foi usado em producao.
 *
 * Investigacao em 2026-08-26 confirmou: nenhum cron ou scheduler chama
 * a rota que aciona este arquivo (app/api/cron/proof-pipeline/route.ts —
 * zero logs de invocacao encontrados no Render). Alem disso, depende de
 * buildBlock() (que le da tabela `evidence`, morta desde 2026-06-01) e
 * do stub signPkcs7 dentro de generateCertificatesForBlock (tabela
 * `impressions.block_height` nunca preenchida, `proof_certificates`
 * sempre com 0 linhas).
 *
 * O pipeline real de producao e `runProofChainAggregator()` em
 * lib/proof/aggregator/proofChainAggregator.ts, agendado a cada 5 minutos
 * dentro de worker.ts (scheduleAggregatorJob).
 *
 * Mantido sem remocao por decisao explicita — nao usar como referencia
 * nem estender. Ver STATUS_PROJETO.md para o historico completo.
 */
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
    select id from impressions where block_height = $1
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

async function createCertificationForBlock(block) {
  const merkleRoot = block.merkle_root
  if (!merkleRoot) return 0

  const sig = signHash(merkleRoot)
  if (!sig) { console.warn('[pipeline] sem assinatura, abortando cert'); return 0 }

  const { token: tsaToken, timestamp: tsaTimestamp } = await getTsaToken(merkleRoot)

  // Garantir event_id em todos os eventos do bloco
  await pool.query(`
    UPDATE public.event_chain
    SET event_id = gen_random_uuid()
    WHERE block_id = $1 AND event_id IS NULL
  `, [block.block_id || block.id])

  // Salvar assinatura no event_chain
  await pool.query(`
    UPDATE public.event_chain
    SET signature = $1
    WHERE block_id = $2 AND (signature IS NULL OR signature = '')
  `, [sig, block.block_id || block.id])

  // Certification do bloco (content_hash = merkle_root)
  await pool.query(
    `INSERT INTO certifications (content_hash, entity_id, entity_type, merkle_root, signature, tsa_token, tsa_timestamp)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (content_hash) DO UPDATE SET
       signature = EXCLUDED.signature,
       merkle_root = EXCLUDED.merkle_root,
       tsa_token = COALESCE(EXCLUDED.tsa_token, certifications.tsa_token),
       tsa_timestamp = COALESCE(EXCLUDED.tsa_timestamp, certifications.tsa_timestamp)`,
    [merkleRoot, String(block.block_id || merkleRoot.slice(0, 36)), 'event', merkleRoot, sig, tsaToken, tsaTimestamp]
  ).catch(e => console.error('[pipeline] cert block error:', e.message))

  // Certifications individuais por evento (content_hash = event_hash)
  // Isso é necessário para que /api/verify/[event_hash] funcione
  const events = await pool.query(`
    SELECT event_hash, event_id::text FROM public.event_chain
    WHERE block_id = $1 AND event_hash IS NOT NULL
  `, [block.block_id || block.id])

  for (const ev of events.rows) {
    await pool.query(
      `INSERT INTO certifications (content_hash, entity_id, entity_type, merkle_root, signature, tsa_token, tsa_timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (content_hash) DO UPDATE SET
         signature = EXCLUDED.signature,
         merkle_root = EXCLUDED.merkle_root,
         tsa_token = COALESCE(EXCLUDED.tsa_token, certifications.tsa_token),
         tsa_timestamp = COALESCE(EXCLUDED.tsa_timestamp, certifications.tsa_timestamp)`,
      [ev.event_hash, ev.event_id || ev.event_hash.slice(0, 36), 'event', merkleRoot, sig, tsaToken, tsaTimestamp]
    ).catch(e => console.warn('[pipeline] cert event error:', e.message))
  }

  console.log('[pipeline] certifications criadas para bloco:', merkleRoot.slice(0, 16) + '...',
    '+ ' + events.rows.length + ' eventos individuais')
  return 1
}

export async function runProofPipeline(): Promise<PipelineResult> {
  let blocks = 0
  let anchors = 0
  let certs = 0

  const block = await buildBlock()

  if (block.created) {
    blocks++
    const blockHeight = block.block.block_height
    const createdCerts = await generateCertificatesForBlock(blockHeight)
    certs += createdCerts
    certs += await createCertificationForBlock(block.block)
  }

  const anchor = await createAnchor()

  if (anchor) {
    anchors++

    if (anchor.anchor_network === 'polygon' && anchor.anchor_tx) {
      const merkleAnchored = anchor.merkle_root

      await pool.query(
        `UPDATE certifications
         SET blockchain_tx = $1, tx_hash = $1
         WHERE (blockchain_tx IS NULL OR blockchain_tx = '' OR blockchain_tx = tx_hash)`,
        [anchor.anchor_tx]
      ).catch(e => console.warn('[pipeline] update cert tx_hash failed:', e.message))

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

  return { blocks_created: blocks, anchors_created: anchors, certificates_created: certs }
}
