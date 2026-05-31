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
 * Executa o pipeline criptográfico do DOOHPLAY
 */

async function createCertificationForBlock(block) {
  const crypto = require('crypto')
  const {createClient} = require('@supabase/supabase-js')
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}})
  const merkleRoot = block.merkle_root
  if (!merkleRoot) return 0
  const privRaw = process.env.PRIVATE_PEM || ''
  if (!privRaw) return 0
  const priv = privRaw.startsWith('-----') ? privRaw : ['-----BEGIN PRIVATE KEY-----', ...privRaw.match(/.{1,64}/g), '-----END PRIVATE KEY-----', ''].join('\n')
  const sig = crypto.createSign('SHA256').update(Buffer.from(merkleRoot,'hex')).sign(priv,'base64')
  
  // TSA timestamp
  let tsaToken = null
  let tsaTimestamp = null
  try {
    const {writeFileSync, readFileSync, unlinkSync} = require('fs')
    const {spawn} = require('child_process')
    const {randomUUID} = require('crypto')
    const id = randomUUID()
    const inputFile = '/tmp/' + id + '.txt'
    const queryFile = '/tmp/' + id + '.tsq'
    const responseFile = '/tmp/' + id + '.tsr'
    writeFileSync(inputFile, merkleRoot)
    await new Promise((resolve) => {
      const q = spawn('openssl', ['ts', '-query', '-data', inputFile, '-sha256', '-no_nonce', '-cert', '-out', queryFile])
      q.on('close', resolve)
    })
    await new Promise((resolve) => {
      const r = spawn('curl', ['-s', '-H', 'Content-Type: application/timestamp-query', '--data-binary', '@' + queryFile, 'https://freetsa.org/tsr', '-o', responseFile])
      r.on('close', resolve)
    })
    tsaToken = readFileSync(responseFile).toString('base64')
    tsaTimestamp = new Date().toISOString()
    try { unlinkSync(inputFile) } catch {}
    try { unlinkSync(queryFile) } catch {}
    try { unlinkSync(responseFile) } catch {}
    console.log('[pipeline] TSA timestamp obtido')
  } catch(e) {
    console.warn('[pipeline] TSA falhou:', e.message)
  }
  const {Pool: PgPool} = require('pg')
  const pgPool = new PgPool({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}})
  const error = await pgPool.query(
    `INSERT INTO certifications (content_hash, entity_id, entity_type, merkle_root, signature, tsa_token, tsa_timestamp)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (content_hash) DO UPDATE SET signature=EXCLUDED.signature, merkle_root=EXCLUDED.merkle_root`,
    [merkleRoot, String(block.block_id || merkleRoot.slice(0,36)), 'event', merkleRoot, sig, tsaToken, tsaTimestamp]
  ).then(() => null).catch(e => e)
  await pgPool.end()
  const _unused = {
    content_hash: merkleRoot,
    entity_id: String(block.block_id || merkleRoot.slice(0,36)),
    entity_type: 'event',
    merkle_root: merkleRoot,
    signature: sig
  }
  if (error) { console.error('cert error:', error.message); return 0 }
  console.log('[pipeline] certification criada:', merkleRoot.slice(0,16)+'...')
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
    STEP 2 — gerar certificados
    */

    const createdCerts = await generateCertificatesForBlock(blockHeight)

    certs += createdCerts
    certs += await createCertificationForBlock(block.block)

  }

  /*
  STEP 3 — criar anchor periódico
  */

  const anchor = await createAnchor()

  if (anchor) {
    anchors++
  }

  return {
    blocks_created: blocks,
    anchors_created: anchors,
    certificates_created: certs
  }

}
