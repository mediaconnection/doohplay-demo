import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Zap, Shield, TrendingUp, Star, ChevronDown, ChevronUp, Calculator, Building2, Users, Tv } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const plans = [
  {
    id: "starter", name: "Starter", subtitle: "Perfeito para começar",
    price: 97, priceAnnual: 82, color: T.success,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    borderGlow: "shadow-[0_0_30px_rgba(0,220,130,0.15)]",
    icon: Tv, screens: 1, aiCredits: 30, mediaLimit: "500 MB",
    features: [
      { label: "1 tela gerenciada", included: true },
      { label: "Studio de criação", included: true },
      { label: "30 gerações de IA/mês", included: true },
      { label: "Canal DOOHPLAY (12 canais)", included: true },
      { label: "Prova de exibição (ProofChain)", included: true },
      { label: "Painel de widgets básico", included: true },
      { label: "Suporte por e-mail", included: true },
      { label: "Relatórios avançados", included: false },
      { label: "API de integração", included: false },
      { label: "Sorteio ponderado de anúncios", included: false },
      { label: "Formatos extras (lateral, faixa, flutuante)", included: false },
      { label: "Suporte dedicado", included: false },
    ],
    cta: "Começar grátis por 14 dias", badge: null,
  },
  {
    id: "pro", name: "Pro", subtitle: "Para negócios em crescimento",
    price: 290, priceAnnual: 245, color: T.primary,
    gradient: "from-blue-500/20 to-blue-500/5",
    borderGlow: "shadow-[0_0_40px_rgba(79,110,247,0.25)]",
    icon: TrendingUp, screens: 5, aiCredits: 150, mediaLimit: "5 GB",
    features: [
      { label: "Até 5 telas gerenciadas", included: true },
      { label: "Studio de criação avançado", included: true },
      { label: "150 gerações de IA/mês", included: true },
      { label: "Canal DOOHPLAY (12 canais)", included: true },
      { label: "ProofChain + Polygon Mainnet", included: true },
      { label: "Painel de widgets completo", included: true },
      { label: "Relatórios avançados", included: true },
      { label: "API de integração", included: true },
      { label: "Sorteio ponderado de anúncios", included: true },
      { label: "Formatos extras (lateral, faixa, flutuante)", included: true },
      { label: "Suporte prioritário (chat)", included: true },
      { label: "Suporte dedicado", included: false },
    ],
    cta: "Assinar Pro", badge: "MAIS POPULAR",
  },
  {
    id: "business", name: "Business", subtitle: "Escala total, zero limites",
    price: 620, priceAnnual: 527, color: T.gold,
    gradient: "from-yellow-500/20 to-yellow-500/5",
    borderGlow: "shadow-[0_0_50px_rgba(255,215,0,0.2)]",
    icon: Building2, screens: 20, aiCredits: 500, mediaLimit: "50 GB",
    features: [
      { label: "Até 20 telas (+ R$150/tela extra)", included: true },
      { label: "Studio com IA generativa ilimitada*", included: true },
      { label: "500 gerações de IA/mês", included: true },
      { label: "Canal DOOHPLAY personalizado", included: true },
      { label: "ProofChain + Auditoria jurídica", included: true },
      { label: "Widgets com dados proprietários", included: true },
      { label: "Relatórios + exportação BI", included: true },
      { label: "API completa + Webhooks", included: true },
      { label: "Sorteio ponderado + OpenRTB*", included: true },
      { label: "Todos os formatos + customizados", included: true },
      { label: "Suporte dedicado 24/7", included: true },
      { label: "SLA garantido 99,9%", included: true },
    ],
    cta: "Falar com vendas", badge: "ENTERPRISE",
  },
];

const competitors = [
  { name: "DOOHPLAY", starter: true, proofChain: true, ai: true, android: true, pricing: "R$97–620", highlight: true },
  { name: "Broadsign", starter: false, proofChain: false, ai: false, android: true, pricing: "USD 500+" },
  { name: "Vistar", starter: false, proofChain: false, ai: false, android: false, pricing: "USD 1.000+" },
  { name: "ScreenCloud", starter: true, proofChain: false, ai: false, android: true, pricing: "USD 20/tela" },
  { name: "Yodeck", starter: true, proofChain: false, ai: false, android: true, pricing: "USD 10/tela" },
];

const faqs = [
  { q: "O que é ProofChain?", a: "ProofChain é nosso sistema de prova criptográfica em 4 camadas: assinatura RSA-SHA256, árvore Merkle, registro na Polygon Mainnet e timestamp TSA RFC3161. Cada exibição gera uma prova imutável, auditável por qualquer parte." },
  { q: "Posso adicionar mais telas além do limite do plano?", a: "Sim. No plano Business, cada tela adicional custa R$150/mês. Nos planos Starter e Pro, basta fazer upgrade." },
  { q: "O app Android está incluído?", a: "Sim. O app Android nativo (v0.7.1) com cache offline, boot automático e watchdog está disponível em todos os planos sem custo adicional." },
  { q: "Como funciona o login por WhatsApp?", a: "Enviamos um OTP pelo WhatsApp para o número cadastrado. Sem senha para lembrar, acesso seguro em segundos." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Planos mensais podem ser cancelados a qualquer momento. Planos anuais têm política de reembolso proporcional nos primeiros 30 dias." },
  { q: "Vocês têm plano para redes com 50+ telas?", a: "Sim. Entre em contato para um plano Enterprise personalizado com gestão centralizada, SLA dedicado e integração OpenRTB para redes de médio e grande porte." },
];

interface Props { onBack: () => void; }

export default function PaymentPlans({ onBack }: Props) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tvCount, setTvCount] = useState(3);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [animatedRevenue, setAnimatedRevenue] = useState(0);

  const roiEstimate = Math.round(tvCount * 380 * 0.6);

  useEffect(() => {
    const target = roiEstimate;
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedRevenue(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [roiEstimate]);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
            <span className="text-sm font-medium">1 cliente ativo · 3 em negociação</span>
          </div>
          <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: T.border, color: T.textSub }}>
            <Shield size={14} style={{ color: T.success }} />
            14 dias grátis, sem cartão
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: T.accent + "20", color: T.accent, borderColor: T.accent + "40" }}>
            <Zap size={12} /> Preços em BRL · Faturamento local · NFe incluso
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Planos que crescem<br />
            <span style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>com o seu negócio</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: T.textSub }}>Do primeiro estabelecimento a redes com centenas de telas — cada plano inclui ProofChain, app Android e Canal DOOHPLAY.</p>
          <div className="inline-flex items-center gap-4 mt-8 p-1 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
            <button onClick={() => setBilling("monthly")} className="px-5 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: billing === "monthly" ? T.primary : "transparent", color: billing === "monthly" ? "#fff" : T.textSub }}>Mensal</button>
            <button onClick={() => setBilling("annual")} className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2" style={{ background: billing === "annual" ? T.primary : "transparent", color: billing === "annual" ? "#fff" : T.textSub }}>
              Anual
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: T.success + "25", color: T.success }}>-15%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === "annual" ? plan.priceAnnual : plan.price;
            const isPopular = plan.badge === "MAIS POPULAR";
            return (
              <div key={plan.id} className={`relative rounded-2xl border transition-all cursor-pointer ${isPopular ? plan.borderGlow : ""}`}
                style={{ background: isPopular ? `linear-gradient(160deg, ${T.card}, ${T.panel})` : T.card, borderColor: isPopular ? plan.color + "60" : T.border, transform: isPopular ? "scale(1.03)" : "scale(1)" }}
                onClick={() => setSelectedPlan(plan.id)}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider"
                    style={{ background: isPopular ? T.primary : T.gold, color: isPopular ? "#fff" : "#000" }}>{plan.badge}</div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.color + "20" }}><Icon size={20} style={{ color: plan.color }} /></div>
                    <div><div className="font-bold text-lg">{plan.name}</div><div className="text-xs" style={{ color: T.textSub }}>{plan.subtitle}</div></div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-sm" style={{ color: T.textSub }}>R$</span>
                      <span className="text-5xl font-black tracking-tight">{price}</span>
                      <span className="text-sm mb-1" style={{ color: T.textSub }}>/mês</span>
                    </div>
                    {billing === "annual" && <div className="text-xs mt-1" style={{ color: T.success }}>Economize R${(plan.price - plan.priceAnnual) * 12}/ano</div>}
                    <div className="mt-3 flex gap-3 text-xs" style={{ color: T.textSub }}>
                      <span>📺 {plan.screens} {plan.screens === 1 ? "tela" : "telas"}</span>
                      <span>🤖 {plan.aiCredits} IA/mês</span>
                      <span>💾 {plan.mediaLimit}</span>
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-xl font-semibold text-sm mb-6 transition-all hover:opacity-90"
                    style={{ background: isPopular ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : plan.color + "20", color: isPopular ? "#fff" : plan.color, border: isPopular ? "none" : `1px solid ${plan.color}40` }}>{plan.cta}</button>
                  <div className="space-y-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        {f.included ? <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} /> : <X size={15} className="mt-0.5 flex-shrink-0 opacity-30" style={{ color: T.textSub }} />}
                        <span style={{ color: f.included ? T.text : T.textSub, opacity: f.included ? 1 : 0.4 }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl border p-8 mb-16" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}><Calculator size={20} style={{ color: T.warning }} /></div>
            <div><h2 className="text-xl font-bold">Calculadora de ROI</h2><p className="text-sm" style={{ color: T.textSub }}>Estime seu retorno com mídia DOOH</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: T.textSub }}>Número de telas</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={1} max={50} value={tvCount} onChange={(e) => setTvCount(Number(e.target.value))} className="flex-1 accent-blue-500" style={{ accentColor: T.primary }} />
                  <div className="w-14 text-center font-bold text-xl">{tvCount}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[{ label: "Telas ativas", value: tvCount }, { label: "Impressões/mês", value: `${(tvCount * 8400).toLocaleString("pt-BR")}` }, { label: "CPM estimado", value: "R$45" }, { label: "Uptime projetado", value: "99,2%" }].map((stat) => (
                  <div key={stat.label} className="rounded-xl p-4 border" style={{ background: T.panel, borderColor: T.border }}>
                    <div style={{ color: T.textSub }}>{stat.label}</div>
                    <div className="font-bold text-lg mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center rounded-2xl border p-8 text-center" style={{ background: T.panel, borderColor: T.success + "40" }}>
              <div className="text-sm mb-2" style={{ color: T.textSub }}>Receita estimada de mídia/mês</div>
              <div className="text-6xl font-black mb-2" style={{ color: T.success }}>R${animatedRevenue.toLocaleString("pt-BR")}</div>
              <div className="text-sm" style={{ color: T.textSub }}>com {tvCount} tela{tvCount > 1 ? "s" : ""} no plano Pro</div>
              <div className="mt-4 text-xs px-4 py-2 rounded-full" style={{ background: T.success + "15", color: T.success }}>ROI médio: {Math.round((roiEstimate / 290) * 100 - 100)}% acima do custo do plano</div>
            </div>
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Como nos comparamos</h2>
          <p className="text-sm mb-8" style={{ color: T.textSub }}>DOOHPLAY vs. principais plataformas do mercado</p>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <table className="w-full text-sm">
              <thead><tr style={{ background: T.panel }}>{["Plataforma","Plano acessível","Prova criptográfica","IA generativa","App Android","Preço base"].map(h => (<th key={h} className="text-left p-4 font-medium" style={{ color: T.textSub }}>{h}</th>))}</tr></thead>
              <tbody>
                {competitors.map((c, i) => (
                  <tr key={i} className="border-t transition-colors hover:opacity-90" style={{ borderColor: T.border, background: c.highlight ? `linear-gradient(90deg, ${T.primary}10, ${T.accent}08)` : T.card }}>
                    <td className="p-4 font-semibold flex items-center gap-2">{c.highlight && <Star size={14} style={{ color: T.warning }} />}{c.name}{c.highlight && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.primary + "25", color: T.primary }}>você está aqui</span>}</td>
                    {[c.starter, c.proofChain, c.ai, c.android].map((v, j) => (<td key={j} className="text-center p-4">{v ? <Check size={16} className="mx-auto" style={{ color: T.success }} /> : <X size={16} className="mx-auto opacity-30" style={{ color: T.textSub }} />}</td>))}
                    <td className="text-center p-4 font-mono text-xs" style={{ color: c.highlight ? T.success : T.textSub }}>{c.pricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[{ metric: "1 cliente", label: "ativo em produção", sub: "Barbearia Zimerman · em teste", icon: Users, color: T.success }, { metric: "3 clientes", label: "em negociação", sub: "Fechamento condicionado a melhorias de UX", icon: TrendingUp, color: T.primary }, { metric: "100/100", label: "score ProofChain", sub: "4 camadas · RSA + Merkle + Polygon + TSA", icon: Shield, color: T.accent }].map((s, i) => {
            const Icon = s.icon;
            return (<div key={i} className="rounded-2xl border p-6 text-center" style={{ background: T.card, borderColor: T.border }}><Icon size={24} className="mx-auto mb-3" style={{ color: s.color }} /><div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.metric}</div><div className="font-medium mb-1">{s.label}</div><div className="text-xs" style={{ color: T.textSub }}>{s.sub}</div></div>);
          })}
        </div>
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: T.border }}>
                <button className="w-full flex items-center justify-between p-5 text-left font-medium transition-colors hover:opacity-90" style={{ background: openFaq === i ? T.panel : T.card }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={16} style={{ color: T.textSub }} /> : <ChevronDown size={16} style={{ color: T.textSub }} />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 pt-2 text-sm leading-relaxed" style={{ background: T.panel, color: T.textSub }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-12 text-center" style={{ background: `linear-gradient(135deg, ${T.primary}15, ${T.accent}10)`, borderColor: T.primary + "30" }}>
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="mb-8" style={{ color: T.textSub }}>14 dias grátis, sem cartão de crédito. App Android incluso.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>Começar grátis</button>
            <button className="px-8 py-3.5 rounded-xl font-semibold border transition-all hover:opacity-90" style={{ borderColor: T.border, color: T.textSub }}>Falar com vendas</button>
          </div>
          <p className="text-xs mt-6" style={{ color: T.textSub }}>* Limites de IA indicam gerações incluídas no plano. Créditos adicionais disponíveis separadamente.</p>
        </div>
      </div>
    </div>
  );
}
