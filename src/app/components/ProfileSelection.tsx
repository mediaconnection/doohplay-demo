import { useState, useEffect } from "react";
import { Monitor, Network, Building2, CheckCircle2, ArrowRight, Tv, Shield, Zap, Globe, BarChart2, Activity, ChevronRight } from "lucide-react";
import { Logo } from "./shared/Logo";

interface ProfileSelectionProps {
  onSelect: (tier: string) => void;
}

const profiles = [
  {
    id: "local",
    icon: Monitor,
    title: "Sou um comércio local",
    subtitle: "Padaria, bar, clínica, salão, academia",
    description: "Quero exibir promoções, conteúdo e ganhar dinheiro com anúncios na minha TV.",
    benefits: ["Monetize sua TV sem investimento", "Conteúdo automático e grátis", "Pagamento mensal garantido", "Gestão simples pelo celular"],
    cta: "Acessar Dashboard Local",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge: "Mais popular",
    stats: [{ label: "Receita média/mês", value: "R$ 650" }, { label: "TV Online", value: "99.2%" }],
    preview: { title: "Padaria São Paulo", kpis: [{ label: "Receita Jun", value: "R$ 847" }, { label: "TV Online", value: "✓" }, { label: "Anúncios", value: "3 ativos" }] },
  },
  {
    id: "business",
    icon: Network,
    title: "Tenho uma rede de lojas",
    subtitle: "Franquias, redes regionais, múltiplas unidades",
    description: "Quero gerenciar várias telas, campanhas e unidades em um só lugar.",
    benefits: ["Gestão centralizada de telas", "Campanhas por região", "Relatórios por unidade", "SLA e alertas operacionais"],
    cta: "Acessar Dashboard Business",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    badge: "Recomendado",
    stats: [{ label: "Telas gerenciadas", value: "24" }, { label: "Receita mensal", value: "R$ 12.4K" }],
    preview: { title: "Rede Café & Padarias", kpis: [{ label: "Unidades", value: "8 ativas" }, { label: "Telas", value: "20/24" }, { label: "Receita", value: "R$ 12.4K" }] },
  },
  {
    id: "enterprise",
    icon: Building2,
    title: "Sou agência ou anunciante",
    subtitle: "Agências, grandes anunciantes, operadores DOOH",
    description: "Quero comprar mídia, acompanhar campanhas e acessar auditoria Proof-of-Play.",
    benefits: ["Proof-of-Play auditável", "Blockchain & ICP Brasil", "API e integrações avançadas", "Trust Score em tempo real"],
    cta: "Acessar Dashboard Enterprise",
    color: "#00A3FF",
    bg: "#E0F2FE",
    border: "#BAE6FD",
    badge: "Enterprise",
    stats: [{ label: "Impressões/dia", value: "4.2M" }, { label: "Trust Score", value: "97.3" }],
    preview: { title: "AgênciaMídia SA", kpis: [{ label: "Impressões", value: "4.2M" }, { label: "SLA", value: "98.7%" }, { label: "Trust", value: "97.3" }] },
  },
];

const globalStats = [
  { label: "Telas ativas na rede", value: "12.847", icon: Tv, color: "#2563EB" },
  { label: "Impressões hoje", value: "84.2M", icon: Activity, color: "#22C55E" },
  { label: "Trust Score médio", value: "96.8", icon: Shield, color: "#00A3FF" },
  { label: "Receita gerada (Jun)", value: "R$ 8.4M", icon: BarChart2, color: "#FF6B00" },
];

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

export default function ProfileSelection({ onSelect }: ProfileSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-card px-6 md:px-8 py-4 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 md:gap-6">
          <button onClick={() => onSelect("install")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Instalar Tela</button>
          <button onClick={() => onSelect("pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Planos</button>
          <button onClick={() => onSelect("components")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">Design System</button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors">Entrar</button>
        </nav>
      </header>

      {/* Stats banner */}
      <div className="bg-[#020617] py-3 px-6 overflow-x-auto">
        <div className="flex items-center gap-8 min-w-max mx-auto max-w-5xl justify-center">
          {globalStats.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-xs text-white/60">{s.label}:</span>
              <span className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16">
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Digital Signage · Retail Media · Proof-of-Play · Blockchain
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            Como você pretende usar o{" "}
            <span style={{ color: "#2563EB" }}>DOOHPLAY?</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Escolha seu perfil e acesse a experiência certa para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
          {profiles.map((profile) => {
            const isHovered = hoveredCard === profile.id;
            return (
              <div
                key={profile.id}
                className="bg-card border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 flex flex-col group relative"
                style={{
                  borderColor: isHovered ? profile.color : "#E2E8F0",
                  transform: isHovered ? "translateY(-4px)" : "none",
                  boxShadow: isHovered ? `0 20px 60px ${profile.color}20` : "none",
                }}
                onMouseEnter={() => setHoveredCard(profile.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {profile.badge && (
                  <div className="absolute -top-3.5 left-5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: profile.color }}>
                      {profile.badge === "Recomendado" ? "⭐ " : ""}{profile.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: profile.bg }}>
                  <profile.icon size={24} style={{ color: profile.color }} />
                </div>

                <h3 className="font-bold text-foreground mb-0.5" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{profile.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{profile.subtitle}</p>
                <p className="text-sm text-foreground mb-4">{profile.description}</p>

                {/* Dashboard mini preview */}
                <div className="rounded-xl p-3 mb-4 border" style={{ backgroundColor: profile.bg, borderColor: profile.border }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.color }} />
                    <p className="text-xs font-semibold truncate" style={{ color: profile.color }}>{profile.preview.title}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {profile.preview.kpis.map((kpi, i) => (
                      <div key={i} className="text-center">
                        <p className="font-bold text-xs" style={{ color: profile.color, fontFamily: "'Inter Tight', sans-serif" }}>{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{kpi.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-4">
                  {profile.stats.map((s, i) => (
                    <div key={i} className="flex-1 bg-secondary rounded-lg px-2 py-2 text-center">
                      <p className="font-bold text-xs text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {profile.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={13} className="shrink-0" style={{ color: profile.color }} />
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelect(profile.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.cta}
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Navigation links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <button onClick={() => onSelect("install")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Tv size={14} /> Instalar uma tela
          </button>
          <span className="hidden md:block">·</span>
          <button onClick={() => onSelect("pricing")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Zap size={14} /> Ver todos os planos
          </button>
          <span className="hidden md:block">·</span>
          <button onClick={() => onSelect("components")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Globe size={14} /> Design System
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span>© 2026 DOOHPLAY. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>LGPD Compliance</span>
            <span>·</span>
            <span>ICP Brasil</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#22C55E]"><Activity size={11} /> 99.9% uptime</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
