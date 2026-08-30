/**
 * lib/aiCreativeJobs.ts
 * ----------------------
 * Estado de progresso dos jobs de geração de 3 conceitos de criativo por IA
 * (aba IA do Studio). A geração roda em background (fire-and-forget) depois
 * que POST /api/studio/ai-generate responde com um jobId; o frontend faz
 * polling em GET /api/studio/ai-generate/status?jobId=... pra saber em que
 * conceito a geração está.
 *
 * Map em memória, NÃO Redis — decisão revisada em 30/08/2026. A primeira
 * versão usava lib/redis.ts (getRedis()), mas isso é a MESMA instância
 * (Upstash) que lib/queue/workers/alertWorker.ts usa e que está com
 * "ERR ... temporarily rate-limited" desde 2026-07-24 (ver STATUS_PROJETO.md).
 * Testado na prática (tsx, Redis inacessível): `setJobStatus` nunca resolve
 * NEM lança erro — fica pendurado pra sempre, porque lib/redis.ts configura
 * `maxRetriesPerRequest: null` (retry infinito). Como o POST de
 * ai-generate faz `await setJobStatus(...)` ANTES de responder ao clique,
 * isso travaria a feature inteira enquanto o Upstash estiver nesse estado —
 * pior do que o fluxo antigo (1 geração), que nunca dependia de Redis.
 *
 * Map local funciona corretamente hoje porque `render.yaml` não configura
 * múltiplas instâncias pro serviço `doohplay-demo` (roda numa instância só).
 * Se esse serviço algum dia escalar horizontalmente, esse Map deixa de ser
 * visível entre instâncias e isso precisa voltar a ser um store
 * compartilhado (Redis, uma vez resolvido o rate-limit, ou Postgres) — não
 * usar essa mesma classe de solução sem antes confirmar o estado do Upstash.
 */

export type AiCreativeConcept = {
  id: string
  style: "bold" | "minimal" | "vibrant"
  headline: string
  subline: string
  cta: string
  image_url: string | null
  image_error?: string
}

export type AiCreativeJob =
  | { status: "generating_copy" }
  | { status: "generating_image"; step: number; total: number }
  | { status: "done"; concepts: AiCreativeConcept[] }
  | { status: "error"; error: string }

const TTL_MS = 5 * 60 * 1000 // 5 minutos — sobra pra qualquer polling realista, evita acúmulo de jobs órfãos

const jobs = new Map<string, { job: AiCreativeJob; expiresAt: number }>()

function cleanupExpired() {
  const now = Date.now()
  for (const [id, entry] of jobs) {
    if (entry.expiresAt <= now) jobs.delete(id)
  }
}

// Assíncronas por compatibilidade de assinatura (os callers já fazem
// `await`) — troca futura de volta pra um store compartilhado não exige
// mudar nenhum outro arquivo.
export async function setJobStatus(jobId: string, job: AiCreativeJob): Promise<void> {
  cleanupExpired()
  jobs.set(jobId, { job, expiresAt: Date.now() + TTL_MS })
}

export async function getJobStatus(jobId: string): Promise<AiCreativeJob | null> {
  cleanupExpired()
  return jobs.get(jobId)?.job ?? null
}
