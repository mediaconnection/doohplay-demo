export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getPool } from "@/lib/db"

const C = {
  bg: "#F8FAFC", white: "#FFFFFF", border: "#E5E7EB", border2: "#F3F4F6",
  blue: "#2563EB", blueLt: "#EFF6FF", blueBd: "#BFDBFE",
  green: "#16A34A", greenLt: "#DCFCE7", greenBd: "#86EFAC",
  amber: "#D97706", amberLt: "#FFFBEB",
  purple: "#7C3AED", purpleLt: "#F5F3FF",
  text: "#111827", text2: "#6B7280", text3: "#9CA3AF",
  gray50: "#F9FAFB", gray100: "#F3F4F6",
}

const fmtR = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function AIRevenuePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const pool = getPool()

  let client: any = null
  try {
    const r = await pool.query(
      `SELECT id::text, code, name, business_type FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )
    client = r.rows[0] ?? null
  } catch {}

  if (!client) notFound()

  // Oportunidades baseadas no tipo de negócio
  const opportunities = [
    {
      icon: "🏦", title: "Banco Itaú — Campanha Cartão",
      desc: "Campanha de 90 dias · CPM R$ 12,00 · alto match com seu público de renda média-alta.",
      value: "+R$ 240/mês", color: C.green, bg: C.greenLt, border: C.greenBd,
      match: "94%", category: "Financeiro",
    },
    {
      icon: "🛵", title: "iFood — Promoção Delivery",
      desc: "Anúncio rotativo · 15s · exibição em horário de almoço e jantar.",
      value: "+R$ 180/mês", color: C.blue, bg: C.blueLt, border: C.blueBd,
      match: "88%", category: "Alimentação",
    },
    {
      icon: "📱", title: "Samsung — Lançamento Galaxy",
      desc: "Campanha nacional · 30s · alta CPM por ser campanha de lançamento.",
      value: "+R$ 320/mês", color: C.purple, bg: C.purpleLt, border: "#DDD6FE",
      match: "79%", category: "Tecnologia",
    },
    {
      icon: "🧴", title: "Natura — Linha Verão",
      desc: "Campanha sazonal · junho a agosto · público feminino 25-45 anos.",
      value: "+R$ 140/mês", color: C.amber, bg: C.amberLt, border: "#FDE68A",
      match: "72%", category: "Beleza",
    },
  ]

  const tips = [
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

  const projection = [
    { month: "Jun/26", value: 847,  label: "Atual",       color: C.text2 },
    { month: "Jul/26", value: 980,  label: "Projetado",   color: C.blue  },
    { month: "Ago/26", value: 1120, label: "Otimizado",   color: C.green },
    { month: "Set/26", value: 1340, label: "Máximo",      color: C.purple},
  ]
  const maxProj = Math.max(...projection.map(p => p.value))

  return (
    <main style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/dashboard/local/${code}`} style={{ fontSize: 13, color: C.text2, textDecoration: "none" }}>← Dashboard</Link>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>AI Revenue Center</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.text2 }}>{client.name}</span>
          <span style={{ fontSize: 11, background: C.purpleLt, color: C.purple, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>⭐ IA Ativa</span>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #7C3AED 100%)`, borderRadius: 16, padding: "28px 32px", marginBottom: 28, color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.8, marginBottom: 8 }}>AI REVENUE CENTER</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Potencial não realizado: <span style={{ color: "#FCD34D" }}>R$ 880/mês</span>
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 20 }}>
            Com base no seu perfil ({client.business_type}), identificamos 4 oportunidades de receita que você ainda não está aproveitando.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Match médio", value: "83%" },
              { label: "Oportunidades", value: "4" },
              { label: "Receita atual", value: "R$ 847" },
              { label: "Potencial máximo", value: "R$ 1.727" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Projeção de receita */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Projeção de receita</div>
          <div style={{ fontSize: 12, color: C.text3,
