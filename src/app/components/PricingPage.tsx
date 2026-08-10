import { CheckCircle2, ArrowLeft, Zap, Star, Building2 } from "lucide-react";
import { Logo } from "./shared/Logo";

const plans = [
  {
    id: "local",
    icon: Zap,
    name: "DOOHPLAY Local",
    tagline: "Para pequenos negócios",
    description: "A forma mais simples de monetizar sua TV e exibir promoções da sua loja.",
    price: "Grátis",
    priceSub: "para começar",
    priceDetail: "Comissão sobre receita de anúncios",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    cta: "Começar grátis",
    features: [
      "1 tela incluída",
      "Monetização com anúncios",
      "Conteúdo automático gratuito",
      "Gestão pelo celular",
      "Relatórios básicos",
      "Suporte por email",
      "Pagamento mensal garantido",
    ],
    notIncluded: ["Múltiplas unidades", "Campanhas personalizadas", "API & integrações", "Proof-of-Play blockchain"],
  },
  {
    id: "business",
    icon: Star,
    name: "DOOHPLAY Business",
    tagline: "Para redes e franquias",
    description: "Gestão centralizada de múltiplas unidades, campanhas por região e relatórios avançados.",
    price: "R$ 299",
    priceSub: "por tela / mês",
    priceDetail: "Mínimo 3 telas · Faturamento anual",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    cta: "Ver plano Business",
    recommended: true,
    features: [
      "Telas ilimitadas por rede",
      "Gestão por unidade e região",
      "Campanhas personalizadas",
      "Mapa de unidades",
      "SLA e alertas operacionais",
      "Relatórios avançados",
      "Calendário de campanhas",
      "Suporte prioritário",
      "Onboarding dedicado",
    ],
    notIncluded: ["ProofChain blockchain", "API enterprise", "Audit certificate"],
  },
  {
    id: "enterprise",
    icon: Building2,
    name: "DOOHPLAY Enterprise",
    tagline: "Para agências e grandes anunciantes",
    description: "Inventário DOOH auditável, ProofChain blockchain, ICP Brasil e API enterprise.",
    price: "Sob consulta",
    priceSub: "contrato customizado",
    priceDetail: "SLA garantido · Suporte 24/7",
    color: "#00A3FF",
    bg: "#E0F2FE",
    border: "#BAE6FD",
    cta: "Falar com Enterprise",
    features: [
      "Telas e rede ilimitadas",
      "ProofChain blockchain",
      "ICP Brasil certificado",
      "Trust Score em tempo real",
      "Proof-of-Play auditável",
      "API & webhooks",
      "Retail Media Analytics",
      "Heatmap de inventário",
      "Audit Certificate PDF",
      "SLA 99.9% garantido",
      "Suporte 24/7 dedicado",
      "Integração com DMP/DSP",
    ],
    notIncluded: [],
  },
];

interface PricingPageProps {
  onBack: () => void;
  onSelect: (tier: "local" | "business" | "enterprise") => void;
}

export default function PricingPage({ onBack, onSelect }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft size={18} />
          </button>
          <Logo />
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">Entrar</button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-4">
            Planos e Preços
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Escolha o plano ideal para você
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Do pequeno comércio à maior rede DOOH do Brasil. Comece grátis, escale quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-2xl border-2 p-6 flex flex-col"
              style={{
                borderColor: plan.recommended ? plan.color : "#E2E8F0",
                background: plan.recommended ? plan.bg : "#ffffff",
                boxShadow: plan.recommended ? `0 0 0 4px ${plan.color}15` : undefined,
              }}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: plan.color }}>
                    ⭐ Recomendado
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: plan.bg, border: `1px solid ${plan.border}` }}>
                  <plan.icon size={20} style={{ color: plan.color }} />
                </div>
                <h2 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{plan.name}</h2>
                <p className="text-xs text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.priceSub}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.priceDetail}</p>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground line-through opacity-50">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelect(plan.id as "local" | "business" | "enterprise")}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={plan.recommended
                  ? { backgroundColor: plan.color, color: "white" }
                  : { backgroundColor: "transparent", color: plan.color, border: `2px solid ${plan.color}` }
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ / Trust section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Todas as contas incluem suporte, atualizações automáticas e conformidade com LGPD.</p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap">
            {["Sem contrato de fidelidade", "Cancele quando quiser", "Pagamentos via PIX ou boleto", "NF eletrônica incluída"].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#22C55E]" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
