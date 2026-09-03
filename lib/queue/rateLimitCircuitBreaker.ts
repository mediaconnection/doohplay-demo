import type { Worker } from "bullmq"

// Achado 2026-09-03: o BullMQ, ao falhar em buscar o próximo job (erro que
// não é de conexão -- ver isNotConnectionError em bullmq/dist/cjs/utils),
// espera só 100ms fixos (DELAY_TIME_1, constante interna, não configurável
// via opções públicas do Worker) antes de tentar de novo. Com 5 workers
// fazendo isso ao mesmo tempo contra um Redis (Upstash) já rate-limited,
// isso vira uma rajada contínua de ~50 tentativas/segundo que nunca dá
// tempo da janela de rate-limit se recuperar sozinha.
//
// Este helper detecta especificamente esse erro do Upstash e força uma
// pausa real do worker (worker.pause() -- confirmado no código-fonte do
// bullmq que isso interrompe waitForJob() no ponto exato onde o loop de
// 100ms acontece, e espera jobs em andamento terminarem antes de pausar,
// sem risco de perda/duplicação) com backoff exponencial, em vez de
// deixar o BullMQ martelar indefinidamente.

const UPSTASH_RATE_LIMIT_PATTERN = /rate.?limit/i

function isUpstashRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  // ReplyError é o tipo que o ioredis usa pra respostas de erro do próprio
  // Redis (diferente de erro de conexão) -- restringe o match pra não
  // pegar qualquer erro genérico que por acaso contenha a palavra "rate".
  const name = (err as { name?: string }).name
  if (name && name !== "ReplyError") return false
  return UPSTASH_RATE_LIMIT_PATTERN.test(err.message ?? "")
}

type CircuitBreakerOptions = {
  /** Nome curto pra identificar o worker nos logs (ex: "proofWorker"). */
  label: string
  /** Teto do backoff exponencial, em ms. */
  maxDelayMs: number
  /** Delay inicial (antes de dobrar), em ms. Padrão: 30s. */
  baseDelayMs?: number
}

export function attachRateLimitCircuitBreaker(
  worker: Worker,
  options: CircuitBreakerOptions
): void {
  const { label, maxDelayMs } = options
  const baseDelayMs = options.baseDelayMs ?? 30_000

  let consecutiveTrips = 0
  let breakerActive = false

  worker.on("error", (err) => {
    if (breakerActive) return // já pausado/esperando, ignora erros repetidos
    if (!isUpstashRateLimitError(err)) return

    const delayMs = Math.min(baseDelayMs * 2 ** consecutiveTrips, maxDelayMs)
    consecutiveTrips++
    breakerActive = true

    console.warn(
      `[circuitBreaker:${label}] rate-limit do Upstash detectado -- pausando por ${delayMs}ms (tentativa ${consecutiveTrips})`
    )

    worker
      .pause()
      .then(() => {
        setTimeout(() => {
          breakerActive = false
          worker.resume()
          console.warn(`[circuitBreaker:${label}] retomado após ${delayMs}ms`)
        }, delayMs)
      })
      .catch((pauseErr) => {
        console.error(`[circuitBreaker:${label}] falha ao pausar worker:`, pauseErr)
        breakerActive = false // não trava o breaker num estado inconsistente
      })
  })

  // Job processado com sucesso = sinal de que o Redis voltou a responder
  // normalmente -- reseta o contador pra não herdar um backoff longo de
  // um episódio de rate-limit já resolvido.
  worker.on("completed", () => {
    consecutiveTrips = 0
  })
}
