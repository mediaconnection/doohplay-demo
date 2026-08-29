// app/api/client/assistant/message/route.ts
// POST — chat do Assistente IA (aba Chat). Fase 18 (29/08/2026), porta do
// protótipo Figma Make AIAssistant.tsx (lá, respostas vinham de um
// dicionário local por palavra-chave; aqui é IA de verdade, mesmo padrão
// de app/api/studio/ai-generate/route.ts: fetch direto na Anthropic,
// nunca client-side).
//
// Histórico de conversa: sem tabela nova — o client mantém as mensagens
// em memória (useState) e reenvia as últimas N a cada chamada. Servidor
// fica stateless; se der refresh na página, a conversa reinicia (aceitável
// pra v1, decisão registrada no plano de arquitetura).
//
// Cota: separada da de geração de criativo (PLAN_AI_CHAT_LIMITS, feature
// 'chat' em ai_generation_log) — ver sql/phase18_ai_assistant_chat.sql e
// lib/asaas.ts. 1 mensagem de chat é uma unidade de custo bem menor que
// 1 geração de criativo completa; não podem compartilhar contador.
import { NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import { verifyClientSessionToken, CLIENT_SESSION_COOKIE } from "@/lib/client-session"
import { PLAN_AI_CHAT_LIMITS, DEFAULT_AI_CHAT_LIMIT, PlanKey } from "@/lib/asaas"

export const dynamic = "force-dynamic"

const MAX_HISTORY_MESSAGES = 6 // últimas N mensagens reenviadas pro contexto, sem persistir no servidor

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body.code ?? "").toUpperCase()
    const message = String(body.message ?? "").trim()
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : []

    if (!code || !message) {
      return NextResponse.json({ error: "code e message obrigatórios" }, { status: 400 })
    }

    const sessionCode = verifyClientSessionToken(req.cookies.get(CLIENT_SESSION_COOKIE)?.value)
    if (sessionCode !== code) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const pool = getPool()

    // Cota mensal de mensagens de chat, por plano
    let chatLimit = DEFAULT_AI_CHAT_LIMIT
    try {
      const subRes = await pool.query(
        `SELECT plan FROM financial_subscriptions WHERE code = $1 AND status = 'ACTIVE' LIMIT 1`,
        [code]
      )
      const planKey = subRes.rows[0]?.plan?.toLowerCase() as PlanKey | undefined
      if (planKey && planKey in PLAN_AI_CHAT_LIMITS) {
        chatLimit = PLAN_AI_CHAT_LIMITS[planKey]
      }
    } catch (err) {
      console.warn("[assistant/message] Não foi possível buscar plano:", err)
    }

    if (chatLimit !== -1) {
      const usageRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM ai_generation_log
         WHERE client_code = $1 AND feature = 'chat' AND created_at >= date_trunc('month', NOW())`,
        [code]
      )
      const used = usageRes.rows[0]?.count ?? 0
      if (used >= chatLimit) {
        return NextResponse.json({
          error: `Limite de ${chatLimit} mensagens do assistente este mês atingido pro seu plano.`,
          quotaExceeded: true, limit: chatLimit, used,
        }, { status: 429 })
      }
    }

    // Mesmo padrão de app/api/studio/ai-generate/route.ts: fetch direto
    // na Anthropic, server-side, nunca exposto ao navegador.
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        thinking: { type: "disabled" },
        system: `Você é o assistente de IA da DOOHPLAY, plataforma de publicidade digital em telas físicas (DOOH) no Brasil.
Fala com o DONO de uma tela física (ex: dono de barbearia, salão, farmácia) sobre a conta dele: receita, playlist, exibições, dispositivo, plano.
Responda em português do Brasil, direto e prático, em markdown simples (** pra negrito, - pra listas).
NUNCA invente número específico de receita, CPM, proposta de anunciante ou meta que você não recebeu no contexto da conversa — se não souber, diga que não tem esse dado ainda.`,
        messages: [
          ...history.slice(-MAX_HISTORY_MESSAGES).map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
      }),
    })

    if (!claudeRes.ok) {
      const errText = await claudeRes.text().catch(() => "")
      console.error("[assistant/message] Claude API error:", claudeRes.status, errText)
      return NextResponse.json({ error: `Erro ao consultar o assistente (Claude API ${claudeRes.status})` }, { status: 502 })
    }

    const claudeData = await claudeRes.json()
    const reply = claudeData.content?.[0]?.text ?? ""

    pool.query(`INSERT INTO ai_generation_log (client_code, feature) VALUES ($1, 'chat')`, [code])
      .catch((err: unknown) => console.warn("[assistant/message] Falha ao logar uso (não bloqueia a resposta):", err))

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("[client/assistant/message POST]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
