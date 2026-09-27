// lib/notices.ts
// Avisos (Fase 46, 27/09/2026) — recados curtos em texto que o dono cria
// no dashboard e que aparecem intercalados com a playlist normal da tela.
//
// Fonte única das regras (limites, modelos, ícones, "o que está no ar
// agora") usada pelas rotas do dashboard (app/api/client/notices/),
// pela playlist (app/api/client/playlist/[code]) e pelo SSR do player
// (app/player/page.tsx). Mesmo motivo do docs/api-contract.md: duas
// cópias da mesma regra já divergiram antes neste projeto.
//
// Tabela: sql/phase46_step1_client_notices.sql. Enquanto a migração não
// rodar num ambiente, getActiveNotices() devolve [] sem quebrar a
// playlist nem o player (mesmo padrão de feature_flags, Fase 45).
import type { getPool } from "@/lib/db"

type Pool = ReturnType<typeof getPool>

export const NOTICE_TEMPLATES = ["cartao", "faixa"] as const
export type NoticeTemplate = typeof NOTICE_TEMPLATES[number]

export const NOTICE_ICONS = ["aviso", "info", "relogio", "coracao"] as const
export type NoticeIcon = typeof NOTICE_ICONS[number]

export const NOTICE_TITLE_MAX = 60
export const NOTICE_MESSAGE_MAX = 200
export const NOTICE_MAX_PER_CLIENT = 20

// Regra de intercalação (decisão de 27/09/2026): o aviso NÃO entra no
// sorteio ponderado de categorias (docs/api-contract.md) — o player
// encaixa 1 aviso a cada N conteúdos da rotação principal, então o tempo
// dele sai um pouco de todas as categorias, sem mexer nos pesos.
export const NOTICE_DURATION_SECONDS = 8
export const NOTICE_EVERY_N_SLIDES = 4

// Traços SVG (viewBox 0 0 24 24, stroke) — desenho próprio em vez de
// emoji, que renderiza mal e inconsistente em TV Android (mesma decisão
// dos widgets, ver weatherIconSvg em app/player/page.tsx). Usado tanto no
// player quanto na prévia do dashboard.
export const NOTICE_ICON_PATHS: Record<NoticeIcon, string> = {
  aviso: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  info: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 16v-4M12 8h.01",
  relogio: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 6v6l4 2",
  coracao: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
}

export const NOTICE_ICON_LABELS: Record<NoticeIcon, string> = {
  aviso: "Atenção",
  info: "Informação",
  relogio: "Horário",
  coracao: "Carinho",
}

// O que o player recebe — só o necessário pra desenhar o aviso.
export interface PublicNotice {
  id: string
  title: string
  message: string
  template: NoticeTemplate
  icon: NoticeIcon | null
}

// Avisos no ar agora pra um cliente. Nunca lança: falha (inclusive tabela
// inexistente) vira lista vazia, porque aviso é complemento — a playlist
// e o player não podem cair por causa dele.
export async function getActiveNotices(pool: Pool, clientCode: string): Promise<PublicNotice[]> {
  try {
    const { rows } = await pool.query<PublicNotice>(
      `SELECT id, title, message, template, icon
       FROM client_notices
       WHERE client_code = $1
         AND active = true
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at > NOW())
       ORDER BY created_at ASC
       LIMIT $2`,
      [clientCode.toUpperCase(), NOTICE_MAX_PER_CLIENT]
    )
    return rows
  } catch (err) {
    console.error("[notices] client_notices indisponível (migração Fase 46 pendente?), seguindo sem avisos:", err)
    return []
  }
}

// Data/hora vem do <input type="datetime-local"> do dashboard, sem fuso
// ("2026-09-27T18:00") — sempre interpretada como horário de Brasília no
// SQL (AT TIME ZONE 'America/Sao_Paulo'), igual ao resto do agendamento.
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export interface NoticeInput {
  title: string
  message: string
  template: NoticeTemplate
  icon: NoticeIcon | null
  starts_at: string | null
  ends_at: string | null
}

export function validateNoticeInput(raw: unknown): { ok: true; value: NoticeInput } | { ok: false; error: string } {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const title = typeof body.title === "string" ? body.title.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""
  if (!title) return { ok: false, error: "Informe um título" }
  if (title.length > NOTICE_TITLE_MAX) return { ok: false, error: `Título pode ter no máximo ${NOTICE_TITLE_MAX} caracteres` }
  if (!message) return { ok: false, error: "Informe a mensagem" }
  if (message.length > NOTICE_MESSAGE_MAX) return { ok: false, error: `Mensagem pode ter no máximo ${NOTICE_MESSAGE_MAX} caracteres` }

  const template = body.template ?? "cartao"
  if (!(NOTICE_TEMPLATES as readonly unknown[]).includes(template)) return { ok: false, error: "Modelo inválido" }

  const icon = body.icon ?? null
  if (icon !== null && !(NOTICE_ICONS as readonly unknown[]).includes(icon)) return { ok: false, error: "Ícone inválido" }

  const rawStart = body.starts_at || null
  const rawEnd = body.ends_at || null
  if (rawStart !== null && (typeof rawStart !== "string" || !LOCAL_DATETIME.test(rawStart))) {
    return { ok: false, error: "Data de início inválida" }
  }
  if (rawEnd !== null && (typeof rawEnd !== "string" || !LOCAL_DATETIME.test(rawEnd))) {
    return { ok: false, error: "Data de fim inválida" }
  }
  const starts_at = rawStart as string | null
  const ends_at = rawEnd as string | null
  // Mesmo formato fixo dos dois lados — comparação de string basta.
  if (starts_at && ends_at && ends_at <= starts_at) {
    return { ok: false, error: "O fim precisa ser depois do início" }
  }

  return {
    ok: true,
    value: { title, message, template: template as NoticeTemplate, icon: icon as NoticeIcon | null, starts_at, ends_at },
  }
}

// Colunas devolvidas pro dashboard — datas de volta no mesmo formato do
// input (horário de Brasília) e status já calculado no banco, pra não
// depender do fuso do navegador do dono.
export const NOTICE_DASHBOARD_COLUMNS = `
  id, title, message, template, icon, active, created_at,
  to_char(starts_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI') AS starts_at,
  to_char(ends_at   AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI') AS ends_at,
  CASE
    WHEN NOT active THEN 'pausado'
    WHEN ends_at IS NOT NULL AND ends_at <= NOW() THEN 'encerrado'
    WHEN starts_at IS NOT NULL AND starts_at > NOW() THEN 'agendado'
    ELSE 'no_ar'
  END AS status`
