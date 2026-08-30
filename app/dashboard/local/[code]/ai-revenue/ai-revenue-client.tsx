"use client"

import { useState } from "react"
import Link from "next/link"

// Mesma paleta de app/dashboard/local/[code]/page.tsx original.
const C = {
  bg: "#F8FAFC", white: "#FFFFFF", border: "#E5E7EB", border2: "#F3F4F6",
  blue: "#3B82F6", blueLt: "#EFF6FF", blueBd: "#BFDBFE",
  green: "#10B981", greenLt: "#DCFCE7", greenBd: "#86EFAC",
  amber: "#D97706", amberLt: "#FFFBEB",
  purple: "#7C3AED", purpleLt: "#F5F3FF",
  red: "#DC2626", redLt: "#FEF2F2",
  text: "#111827", text2: "#6B7280", text3: "#9CA3AF",
  gray50: "#F9FAFB", gray100: "#F3F4F6",
}

const fmtR = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export type AIRevenueData = {
  payoutHistory: { label: string; total: number }[]
  offlineHours: number
  playsByDow: { label: string; plays: number }[]
  plays30d: number
  activeAdvertisers: number
  isOnlineNow: boolean
  hasPlayer: boolean
  estimatedAdvertiserRevenue: number
}

type Tab = "overview" | "oportunidades" | "anunciantes" | "previsao"

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "anunciantes", label: "Anunciantes Recomendados" },
  { id: "previsao", label: "Previsão Financeira" },
]

// Badge + frase de aviso — usado em TODO bloco que mistura ou é 100%
// número ilustrativo. Nunca aparece sozinho o badge sem a frase, e nunca
// um bloco fictício sem os dois. Ver plano aprovado em 30/08/2026.
function SimulationNotice({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 11, background: C.purpleLt, color: C.purple, fontWeight: 600, padding: "2px 8px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>
        ⭐ Simulação
      </span>
      <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

function RealDataTag() {
  return (
    <span style={{ fontSize: 10, background: C.greenLt, color: "#15803D", fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
      ● Dado real da sua tela
    </span>
  )
}

// ── Conteúdo fixo ilustrativo (Simulação) — mantido do protótipo/versão
// anterior, categoria/descrição/match% continuam sem dado real por trás
// (não existe algoritmo de match nem proposta de anunciante nomeada). ──
const OPPORTUNITY_EXAMPLES = [
  {
    icon: "🏦", title: "Anunciante do setor financeiro — Cartão de crédito",
    desc: "Campanha de 90 dias · CPM R$ 12,00 · alto match com seu público de renda média-alta.",
    color: C.green, bg: C.greenLt, border: C.greenBd, match: "94%", category: "Financeiro",
  },
  {
    icon: "🛵", title: "Anunciante de delivery — Promoção",
    desc: "Anúncio rotativo · 15s · exibição em horário de almoço e jantar.",
    color: C.blue, bg: C.blueLt, border: C.blueBd, match: "88%", category: "Alimentação",
  },
  {
    icon: "📱", title: "Anunciante de tecnologia — Lançamento de produto",
    desc: "Campanha nacional · 30s · alta CPM por ser campanha de lançamento.",
    color: C.purple, bg: C.purpleLt, border: "#DDD6FE", match: "79%", category: "Tecnologia",
  },
  {
    icon: "🧴", title: "Anunciante de beleza — Linha sazonal",
    desc: "Campanha sazonal · junho a agosto · público feminino 25-45 anos.",
    color: C.amber, bg: C.amberLt, border: "#FDE68A", match: "72%", category: "Beleza",
  },
]

const TIPS = [
  {
    icon: "⏰", title: "Ative o horário de pico",
    desc: "Telas ativas entre 7h–9h e 17h–19h têm 3× mais visualizações. Você está perdendo R$ 180/mês.",
    impact: "+34% views", color: C.amber,
  },
  {
    icon: "🖼", title: "Adicione conteúdo próprio",
    desc: "Estabelecimentos com promoções próprias retêm 40% mais atenção. Crie seu primeiro card.",
    impact: "+40% engajamento", color: C.blue,
  },
  {
    icon: "📅", title: "Ative campanhas de fim de semana",
    desc: "Sábado e domingo têm 28% mais tráfego no seu segmento. Nenhum anunciante está ativo nesses dias.",
    impact: "+R$ 120/mês", color: C.green,
  },
]

const GROWTH_SCENARIOS = [
  { scenario: "Conservador", desc: "Sem nenhuma ação adicional", color: C.text2 },
  { scenario: "Base (com ativação)", desc: "Ativando 1 oportunidade de exemplo", color: C.blue, highlight: true },
  { scenario: "Otimista", desc: "Ativando todas as oportunidades de exemplo", color: C.green },
]

export default function AIRevenueTabs({
  code, clientName, businessType, data,
}: {
  code: string
  clientName: string
  businessType: string
  data: AIRevenueData
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const maxDow = Math.max(...data.playsByDow.map(d => d.plays), 1)
  const maxPayout = Math.max(...data.payoutHistory.map(p => p.total), 1)

  return (
    <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/local/${code}`} style={{ fontSize: 13, color: C.text2, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>AI Revenue Center</span>
        </div>
        <span style={{ fontSize: 12, color: C.text2 }}>{clientName}</span>
      </header>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.white, padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
              fontSize: 13, whiteSpace: "nowrap",
              fontWeight: activeTab === t.id ? 700 : 400,
              color: activeTab === t.id ? C.blue : C.text2,
              borderBottom: activeTab === t.id ? `2px solid ${C.blue}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── VISÃO GERAL ── */}
        {activeTab === "overview" && (
          <>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Sua tela hoje</div>
                <RealDataTag />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Repasse deste mês</div>
                  {data.payoutHistory.length > 0 ? (
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
                      {fmtR(data.payoutHistory[data.payoutHistory.length - 1]?.total ?? 0)}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: C.text3, fontStyle: "italic" }}>Nenhum repasse solicitado ainda</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Exibições (30 dias)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
                    {data.hasPlayer ? data.plays30d.toLocaleString("pt-BR") : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Status da tela</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: data.isOnlineNow ? "#15803D" : C.red }}>
                    {data.hasPlayer ? (data.isOnlineNow ? "🟢 Online" : "🔴 Offline") : "Sem tela vinculada"}
                  </div>
                  {data.hasPlayer && data.offlineHours > 0 && (
                    <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{data.offlineHours}h offline este mês</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #7C3AED 100%)`, borderRadius: 16, padding: "28px 32px", marginBottom: 20, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.8 }}>AI REVENUE CENTER</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.18)", fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>⭐ Simulação</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
                Potencial não realizado:{" "}
                <span style={{ color: "#FCD34D" }}>R$ 880/mês</span>
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 20 }}>
                Exemplo ilustrativo de oportunidades de receita para o perfil {businessType} — não é uma análise gerada a partir dos seus dados.
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  { label: "Match médio", value: "83%" },
                  { label: "Oportunidades", value: "4" },
                  { label: "Receita atual (exemplo)", value: "R$ 847" },
                  { label: "Potencial máximo", value: "R$ 1.727" },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── OPORTUNIDADES ── */}
        {activeTab === "oportunidades" && (
          <>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Exibições reais por dia da semana</div>
                <RealDataTag />
              </div>
              <div style={{ fontSize: 12, color: C.text3, marginBottom: 18 }}>Volume real dos últimos 30 dias — não é estimativa de receita</div>
              {data.hasPlayer && data.plays30d > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.playsByDow.map((d, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: C.text2 }}>{d.label}</span>
                        <span style={{ fontWeight: 700, color: C.text }}>{d.plays.toLocaleString("pt-BR")} exibições</span>
                      </div>
                      <div style={{ width: "100%", height: 8, borderRadius: 4, background: C.gray100, overflow: "hidden" }}>
                        <div style={{ width: `${(d.plays / maxDow) * 100}%`, height: "100%", background: C.blue, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: C.text3, fontStyle: "italic" }}>
                  Ainda não há exibições registradas pra essa tela nos últimos 30 dias.
                </div>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>
              💡 Dicas de otimização
            </div>
            <SimulationNotice text="As dicas abaixo são exemplos genéricos de boas práticas de DOOH, não uma análise gerada a partir dos dados desta tela." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {TIPS.map((tip, i) => (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{tip.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{tip.title}</div>
                  <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5, marginBottom: 12 }}>{tip.desc}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tip.color }}>{tip.impact}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ANUNCIANTES RECOMENDADOS ── */}
        {activeTab === "anunciantes" && (
          <>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <RealDataTag />
              <span style={{ fontSize: 13, color: C.text2 }}>
                Hoje há <strong style={{ color: C.text }}>{data.activeAdvertisers}</strong> anunciante{data.activeAdvertisers === 1 ? "" : "s"} com campanha ativa na rede DOOHPLAY.
              </span>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              🎯 Categorias de exemplo com bom potencial de match
            </div>
            <SimulationNotice text="Categoria, descrição e % de match são exemplos ilustrativos — não existe hoje um algoritmo de match nem proposta de anunciante nomeada disponível pra essa tela. Só o valor de receita estimada usa dado real (CPM de mercado pro volume de exibições desta tela)." />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {OPPORTUNITY_EXAMPLES.map((op, i) => (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: op.bg, border: `1px solid ${op.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {op.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{op.title}</span>
                      <span style={{ fontSize: 10, background: op.bg, color: op.color, fontWeight: 600, padding: "1px 7px", borderRadius: 10, border: `1px solid ${op.border}` }}>
                        {op.category}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.text2 }}>{op.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: op.color }}>
                      {data.plays30d > 0 ? `~${fmtR(data.estimatedAdvertiserRevenue)}/mês` : "Sem dado de volume"}
                    </div>
                    <div style={{ fontSize: 11, color: C.text3 }}>
                      Match: <strong style={{ color: op.color }}>{op.match}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data.plays30d > 0 && (
              <div style={{ fontSize: 11, color: C.text3, marginTop: 10 }}>
                Estimativa de receita calculada com o CPM médio de mercado pra faixa de volume desta tela ({data.plays30d.toLocaleString("pt-BR")} exibições/mês) — mesmo valor de referência aplicado às 4 categorias de exemplo acima.
              </div>
            )}
          </>
        )}

        {/* ── PREVISÃO FINANCEIRA ── */}
        {activeTab === "previsao" && (
          <>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Histórico real de repasses</div>
                <RealDataTag />
              </div>
              <div style={{ fontSize: 12, color: C.text3, marginBottom: 20 }}>Valores efetivamente solicitados/pagos — sem projeção</div>
              {data.payoutHistory.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 120 }}>
                  {data.payoutHistory.map((p, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{fmtR(p.total)}</div>
                      <div style={{ width: "100%", borderRadius: "6px 6px 0 0", height: `${Math.max((p.total / maxPayout) * 90, 4)}px`, background: C.blue, opacity: 0.85 }} />
                      <div style={{ fontSize: 11, color: C.text3 }}>{p.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: C.text3, fontStyle: "italic" }}>
                  Nenhum repasse foi solicitado ainda pra essa tela — assim que houver, o histórico aparece aqui.
                </div>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Cenários de Crescimento
            </div>
            <SimulationNotice text="Não existe hoje um modelo de previsão de receita — os cenários abaixo são exemplos ilustrativos de quanto oportunidades de exemplo poderiam representar, não uma projeção calculada a partir dos seus dados." />
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {GROWTH_SCENARIOS.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: s.highlight ? C.blueLt : C.gray50, border: s.highlight ? `1px solid ${C.blueBd}` : "1px solid transparent" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.scenario}</div>
                      <div style={{ fontSize: 12, color: C.text2 }}>{s.desc}</div>
                    </div>
                    {s.highlight && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: C.blueBd, color: C.blue }}>Exemplo</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px", textAlign: "center", marginTop: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Quer maximizar sua receita?
          </div>
          <div style={{ fontSize: 13, color: C.text2, marginBottom: 20 }}>
            Nossa equipe pode te ajudar a avaliar oportunidades reais de receita pra sua tela.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href={`/dashboard/local/${code}`} style={{ padding: "10px 24px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.text2, textDecoration: "none" }}>
              ← Voltar ao dashboard
            </Link>
            <a href="https://wa.me/5511962050987?text=Quero+ativar+as+oportunidades+do+AI+Revenue+Center" target="_blank" rel="noreferrer" style={{ padding: "10px 24px", borderRadius: 8, background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              💬 Falar com especialista
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
