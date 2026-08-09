import { useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, TrendingUp,
  Globe, DollarSign, Zap, Users, Shield, Map, Award
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const ARR_DATA = [
  { q: "Q1'24", arr: 120 }, { q: "Q2'24", arr: 280 }, { q: "Q3'24", arr: 520 },
  { q: "Q4'24", arr: 890 }, { q: "Q1'25", arr: 1420 }, { q: "Q2'25", arr: 2180 },
  { q: "Q3'25", arr: 3100 }, { q: "Q4'25E", arr: 4800 },
];

const TAM_DATA = [
  { name: "DOOH Global", value: 42000, color: T.primary  },
  { name: "DOOH Brasil",  value: 4200,  color: T.accent   },
  { name: "DOOHPLAY SAM", value: 1800,  color: T.success  },
  { name: "DOOHPLAY SOM", value: 420,   color: T.gold     },
];

const UNIT_DATA = [
  { plan: "Starter",    mrr: 97,  customers: 840, arr: 97*840/1000  },
  { plan: "Growth",     mrr: 290, customers: 320, arr: 290*320/1000 },
  { plan: "Enterprise", mrr: 620, customers: 89,  arr: 620*89/1000  },
];

const ROADMAP = [
  { q: "Q3 2025", label: "Lançamento", items: ["MVP Android player","WhatsApp OTP","ProofChain v1","Planos SaaS"],         done: true  },
  { q: "Q4 2025", label: "Tração",     items: ["Programmatic RTB","DSP integrations","API pública","White Label v1"],      done: true  },
  { q: "Q1 2026", label: "Escala",     items: ["Expansion: SP → BR","Gemini IA v2","Audience data","Series A"],            done: false },
  { q: "Q3 2026", label: "Unicórnio",  items: ["LATAM expansion","Polygon mainnet","M&A publishers","IPO pipeline"],      done: false },
];

const SLIDES = [
  "cover", "problem", "solution", "tam", "traction", "unit-economics", "roadmap", "team", "ask"
] as const;
type Slide = typeof SLIDES[number];

export default function PitchDeck({ onBack }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = SLIDES[slideIdx];
  const prev = () => setSlideIdx(i => Math.max(0, i - 1));
  const next = () => setSlideIdx(i => Math.min(SLIDES.length - 1, i + 1));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: T.panel + "F0", borderColor: T.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Award size={16} style={{ color: T.gold }} />
            </div>
            <span className="font-black">DOOHPLAY — Investor Pitch</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold" style={{ color: T.textSub }}>{slideIdx + 1} / {SLIDES.length}</span>
          <div className="flex gap-1">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === slideIdx ? T.primary : T.border, transform: i === slideIdx ? "scale(1.3)" : "scale(1)" }} />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={prev} disabled={slideIdx === 0} className="p-2 rounded-lg" style={{ opacity: slideIdx === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={16} style={{ color: T.textSub }} />
            </button>
            <button onClick={next} disabled={slideIdx === SLIDES.length - 1} className="p-2 rounded-lg" style={{ opacity: slideIdx === SLIDES.length - 1 ? 0.3 : 1 }}>
              <ChevronRight size={16} style={{ color: T.textSub }} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ minHeight: "calc(100vh - 73px)" }}>
        <div className="w-full max-w-5xl">

          {slide === "cover" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
                style={{ background: T.gold + "15", color: T.gold, border: `1px solid ${T.gold}30` }}>
                <Award size={14} /> Series A · Julho 2025
              </div>
              <h1 className="font-black mb-4" style={{ fontSize: 72, lineHeight: 1, color: T.text }}>DOOHPLAY</h1>
              <p className="text-xl mb-2" style={{ color: T.textSub }}>A plataforma que transforma anúncios físicos em dados digitais</p>
              <p className="mb-10" style={{ color: T.textSub, fontSize: 15 }}>SaaS B2B para gestão, venda e certificação de inventário DOOH — com IA, blockchain e WhatsApp OTP</p>
              <div className="flex items-center justify-center gap-8">
                {[
                  { label: "ARR projetado 2025", value: "R$4.8M",   color: T.gold    },
                  { label: "Telas ativas",        value: "1.247",    color: T.primary },
                  { label: "NPS",                 value: "72",       color: T.success },
                  { label: "Captação",            value: "R$12M",    color: T.accent  },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                    <div className="font-black text-3xl" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === "problem" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.danger }}>O PROBLEMA</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>O mercado DOOH é analógico num mundo digital</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "Zero rastreabilidade",     desc: "Anunciantes pagam por impressões que não conseguem verificar. Nenhuma prova de que o anúncio realmente foi exibido.", icon: Shield,  color: T.danger  },
                  { title: "Compra manual e lenta",    desc: "Negociações por e-mail, planilhas Excel, telefone. Um plano de mídia DOOH demora 2 semanas para ser executado.", icon: Map,     color: T.warning },
                  { title: "Dados em silos",           desc: "Cada publisher tem seu próprio sistema. Agências trabalham com 10+ ferramentas diferentes para gestão de inventário.", icon: Globe,   color: T.primary },
                ].map((p, i) => (
                  <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: p.color + "30" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: p.color + "20" }}>
                      <p.icon size={20} style={{ color: p.color }} />
                    </div>
                    <div className="font-black mb-2" style={{ color: T.text }}>{p.title}</div>
                    <div className="text-sm" style={{ color: T.textSub }}>{p.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl text-center" style={{ background: T.danger + "10", border: `1px solid ${T.danger}20` }}>
                <span className="font-black text-lg" style={{ color: T.danger }}>R$4.2 bilhões</span>
                <span style={{ color: T.textSub }}> em gastos com DOOH no Brasil em 2024 — sem nenhuma auditoria confiável</span>
              </div>
            </div>
          )}

          {slide === "solution" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.success }}>A SOLUÇÃO</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>Uma plataforma completa para o ciclo DOOH</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "ProofChain™",        desc: "Prova criptográfica de exibição com 4 camadas: RSA-SHA256 → Merkle → Polygon → TSA RFC3161. Primeiro do Brasil.", icon: Shield,    color: T.success, badge: "EXCLUSIVO" },
                  { title: "Programmatic DOOH",  desc: "DSP próprio com RTB em tempo real. Compra e venda de inventário em segundos, não semanas.",                             icon: Zap,       color: T.primary, badge: "PATENTED"  },
                  { title: "Gemini AI Copilot",  desc: "IA que gera planos de mídia, otimiza campanhas e prevê performance — integrado ao Google Gemini 2.0.",                 icon: TrendingUp, color: T.accent,  badge: "AI-FIRST"  },
                  { title: "WhatsApp OTP Auth",  desc: "Login sem senha via WhatsApp. Barreira de entrada zero para publishers e anunciantes.",                                   icon: Users,     color: T.gold,    badge: "NO-CODE"   },
                ].map((s, i) => (
                  <div key={i} className="p-5 rounded-2xl border flex items-start gap-4" style={{ background: T.card, borderColor: s.color + "25" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.color + "20" }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black" style={{ color: T.text }}>{s.title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-black" style={{ background: s.color + "25", color: s.color }}>{s.badge}</span>
                      </div>
                      <div className="text-sm" style={{ color: T.textSub }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === "tam" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.primary }}>MERCADO</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>TAM de US$42B e crescendo 14% ao ano</h2>
              <div className="grid grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={TAM_DATA} layout="vertical" barSize={28}>
                    <XAxis type="number" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}B`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`$${(v/1000).toFixed(1)}B`, ""]} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {TAM_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {[
                    { label: "TAM Global",   value: "$42B",   sub: "DOOH mundial 2024",              color: T.primary },
                    { label: "SAM Brasil",   value: "R$4.2B", sub: "Mercado DOOH brasileiro",        color: T.accent  },
                    { label: "SAM DOOHPLAY", value: "R$1.8B", sub: "Segmento SaaS + programmatic",   color: T.success },
                    { label: "SOM 2025E",    value: "R$420M", sub: "Meta de captura de mercado",     color: T.gold    },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                      <div>
                        <div className="font-black text-xs" style={{ color: T.textSub }}>{m.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{m.sub}</div>
                      </div>
                      <div className="font-black text-xl" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {slide === "traction" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.success }}>TRAÇÃO</div>
              <h2 className="font-black text-4xl mb-6" style={{ color: T.text }}>39× crescimento em ARR em 12 meses</h2>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: "MRR atual",    value: "R$400k",  change: "+38% m/m",        color: T.gold    },
                  { label: "Clientes",     value: "1.249",   change: "+22 essa semana", color: T.primary },
                  { label: "Telas ativas", value: "1.247",   change: "+8 hoje",          color: T.success },
                  { label: "Churn",        value: "1.2%",    change: "Best in class",    color: T.accent  },
                ].map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs font-bold" style={{ color: T.success }}>{m.change}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ARR_DATA}>
                  <defs>
                    <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.gold} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="q" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${v}k`, "ARR"]} />
                  <Area type="monotone" dataKey="arr" stroke={T.gold} fill="url(#arrGrad)" strokeWidth={2.5} dot={{ fill: T.gold, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {slide === "unit-economics" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.accent }}>UNIT ECONOMICS</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>CAC 3.2× menor que o setor. LTV/CAC de 18×</h2>
              <div className="grid grid-cols-2 gap-8 items-start">
                <div className="space-y-3">
                  {[
                    { label: "CAC médio",            value: "R$290",      note: "Payback em 1 mês (Growth)",  color: T.primary },
                    { label: "LTV médio (3 anos)",   value: "R$5.220",    note: "Churn de 1.2%",              color: T.gold    },
                    { label: "LTV/CAC",              value: "18×",        note: "Top 5% SaaS global",         color: T.success },
                    { label: "Gross Margin",         value: "82%",        note: "Infrastructure eficiente",   color: T.accent  },
                    { label: "NRR (Net Rev. Ret.)",  value: "128%",       note: "Expansão orgânica de contas", color: T.warning },
                    { label: "Burn múltiplo",        value: "0.8×",       note: "Eficiência de capital rara", color: T.success },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                      <div>
                        <div className="font-bold text-sm" style={{ color: T.text }}>{m.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{m.note}</div>
                      </div>
                      <div className="font-black text-xl" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>RECEITA POR PLANO (ARR projetado)</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={UNIT_DATA} barSize={48}>
                      <XAxis dataKey="plan" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} />
                      <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${v.toFixed(0)}k`, "ARR"]} />
                      <Bar dataKey="arr" radius={[6, 6, 0, 0]}>
                        {UNIT_DATA.map((_, i) => <Cell key={i} fill={[T.primary, T.accent, T.gold][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {slide === "roadmap" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.primary }}>ROADMAP</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>De MVP a unicórnio em 18 meses</h2>
              <div className="grid grid-cols-4 gap-4">
                {ROADMAP.map((r, i) => (
                  <div key={i} className="relative">
                    <div className={`p-5 rounded-2xl border h-full ${r.done ? "" : "opacity-75"}`}
                      style={{ background: r.done ? T.success + "08" : T.card, borderColor: r.done ? T.success + "30" : T.border }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: r.done ? T.success : T.textSub }} />
                        <span className="text-xs font-black" style={{ color: r.done ? T.success : T.textSub }}>{r.q}</span>
                      </div>
                      <div className="font-black text-base mb-3" style={{ color: T.text }}>{r.label}</div>
                      <div className="space-y-1.5">
                        {r.items.map(item => (
                          <div key={item} className="flex items-start gap-1.5 text-xs" style={{ color: T.textSub }}>
                            <span style={{ color: r.done ? T.success : T.border }}>•</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    {i < 3 && <div className="absolute top-8 -right-2.5 w-5 h-px" style={{ background: T.border }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === "team" && (
            <div>
              <div className="text-xs font-black mb-2" style={{ color: T.accent }}>TIME</div>
              <h2 className="font-black text-4xl mb-8" style={{ color: T.text }}>Fundadores com skin in the game</h2>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { name: "Carlos Mendes",  role: "CEO & Co-founder", bg: T.primary, prev: "Ex-Google · Ex-OLX",          exp: "12 anos em adtech"     },
                  { name: "Ana Lima",       role: "CTO & Co-founder", bg: T.accent,  prev: "Ex-iFood · Ex-Nubank",       exp: "10 anos em infra SaaS" },
                  { name: "Felipe Torres", role: "CPO & Co-founder", bg: T.success, prev: "Ex-Globo · Ex-Clear Channel", exp: "8 anos em DOOH"        },
                ].map((m, i) => (
                  <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white mb-4" style={{ background: m.bg }}>
                      {m.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="font-black" style={{ color: T.text }}>{m.name}</div>
                    <div className="text-sm font-bold mb-2" style={{ color: m.bg }}>{m.role}</div>
                    <div className="text-xs mb-1" style={{ color: T.textSub }}>{m.prev}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.exp}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Headcount",      value: "18 pessoas",          color: T.primary },
                  { label: "Advisors",        value: "Sequoia, Monashees", color: T.gold    },
                  { label: "Patents pending", value: "3 patentes",          color: T.success },
                ].map((m, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl text-center" style={{ background: T.panel }}>
                    <div className="font-black" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === "ask" && (
            <div className="text-center py-8">
              <div className="text-xs font-black mb-2" style={{ color: T.gold }}>CAPTAÇÃO</div>
              <h2 className="font-black mb-4" style={{ fontSize: 56, color: T.text }}>R$12 milhões · Series A</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: T.textSub }}>Para escalar a equipe de vendas, expandir a rede de telas para 5.000+ em 12 meses e lançar o produto em 3 países da LATAM.</p>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { label: "40% — Go-to-Market",    value: "R$4.8M",  color: T.primary },
                  { label: "35% — Produto & Eng.",  value: "R$4.2M",  color: T.accent  },
                  { label: "25% — Expansão LATAM", value: "R$3.0M",  color: T.gold    },
                ].map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="font-black text-2xl mb-1" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="px-8 py-4 rounded-2xl" style={{ background: T.gold + "15", border: `1px solid ${T.gold}30` }}>
                  <div className="font-black text-2xl" style={{ color: T.gold }}>Valuation: R$60M</div>
                  <div className="text-sm" style={{ color: T.textSub }}>Pre-money · 15× ARR projetado 2025</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 py-3 border-t" style={{ borderColor: T.border }}>
        {SLIDES.map((s, i) => (
          <button key={s} onClick={() => setSlideIdx(i)}
            className="text-xs font-bold capitalize transition-all"
            style={{ color: i === slideIdx ? T.primary : T.textSub }}>
            {s.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
