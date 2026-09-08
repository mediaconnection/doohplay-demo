import { useState } from "react";
import { ArrowLeft, CheckCircle, Circle, Lock, Star, TrendingUp, Globe, DollarSign, Users, Zap, Shield, Building2, ChevronRight, Flag } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const PHASES = [
  {
    id: "now",
    label: "AGORA",
    period: "Jul–Set 2026",
    title: "Fechar os 3 clientes",
    subtitle: "Validação comercial real",
    status: "active",
    color: T.success,
    valuation: "—",
    milestone: "1 → 4 clientes ativos",
    icon: Flag,
    tasks: [
      { text: "Melhorar UX da geração de IA no Studio (fluxo mais guiado)", done: false, priority: "critical" },
      { text: "Transição de imagem configurável por vídeo", done: false, priority: "critical" },
      { text: "Confirmar widget_position left/bottom em produção", done: false, priority: "high" },
      { text: "Rodar migração SQL phase33 no Supabase", done: false, priority: "high" },
      { text: "Revogar token brapi.dev (risco de segurança)", done: false, priority: "medium" },
      { text: "Confirmar widgets câmbio e loteria visualmente em produção", done: false, priority: "high" },
      { text: "Levantar custo real de infra por tela/mês", done: false, priority: "medium" },
    ],
  },
  {
    id: "preseed",
    label: "PRÉ-SEED",
    period: "Out–Dez 2026",
    title: "50 telas · R$2M captados",
    subtitle: "Primeira rodada de investimento",
    status: "upcoming",
    color: T.primary,
    valuation: "R$8–15M",
    milestone: "50 telas · 3 cidades",
    icon: DollarSign,
    tasks: [
      { text: "Escalar para 50 telas ativas em 3 cidades (SP, RJ, BH)", done: false, priority: "critical" },
      { text: "Contratar CTO/Tech Lead para desacoplar fundador do código", done: false, priority: "critical" },
      { text: "Captar R$2M em pre-seed (angels, aceleradoras)", done: false, priority: "critical" },
      { text: "Data room completo: cap table, modelo 36m, auditoria segurança", done: false, priority: "high" },
      { text: "Resolver enquadramento fiscal ISS vs. ICMS com contador", done: false, priority: "high" },
      { text: "Contratar Head of Sales (foco em agências)", done: false, priority: "high" },
      { text: "Definir timeline pre-seed vs. velocidade", done: false, priority: "medium" },
    ],
  },
  {
    id: "product",
    label: "PRODUTO",
    period: "Jan–Jun 2027",
    title: "OpenRTB live · Demand side",
    subtitle: "De software de sinalização para mídia",
    status: "upcoming",
    color: T.accent,
    valuation: "R$25–50M",
    milestone: "OpenRTB 2.5 · 3 DSPs",
    icon: Zap,
    tasks: [
      { text: "Implementar OpenRTB 2.5 completo (servidor de bid)", done: false, priority: "critical" },
      { text: "Integrar Google DV360 e The Trade Desk como primeiros DSPs", done: false, priority: "critical" },
      { text: "Lançar SSP próprio ou parceria Broadsign Ads / Vistar", done: false, priority: "high" },
      { text: "Lançar Audience Insights API (dado como produto)", done: false, priority: "high" },
      { text: "Contratar Head of Growth (aquisição B2C em escala)", done: false, priority: "high" },
      { text: "Formalizar recursos Relatórios/Prioridade/Suporte nos planos", done: false, priority: "medium" },
      { text: "Configurar backup automático do banco", done: false, priority: "medium" },
    ],
  },
  {
    id: "seed",
    label: "SEED",
    period: "Jul–Dez 2027",
    title: "900 telas · R$15M captados",
    subtitle: "Escala nacional confirmada",
    status: "locked",
    color: T.warning,
    valuation: "R$60–120M",
    milestone: "900 telas · 5 estados",
    icon: TrendingUp,
    tasks: [
      { text: "Escalar para 900 telas em 5 estados brasileiros", done: false, priority: "critical" },
      { text: "ARR > R$1,2M documentado e auditável", done: false, priority: "critical" },
      { text: "Captar R$15M Seed (VCs especializados em SaaS/AdTech)", done: false, priority: "critical" },
      { text: "Primeira receita de mídia programática significativa", done: false, priority: "high" },
      { text: "Time C-level completo (CEO, CTO, CRO, CMO)", done: false, priority: "high" },
      { text: "Auditoria Big 4 para due diligence Series A", done: false, priority: "medium" },
    ],
  },
  {
    id: "latam",
    label: "LATAM",
    period: "2028",
    title: "México + Colombia + Argentina",
    subtitle: "Primeiro DOOH unicórnio LATAM",
    status: "locked",
    color: "#E91E63",
    valuation: "R$200–500M",
    milestone: "6.200 telas · 4 países",
    icon: Globe,
    tasks: [
      { text: "Operação México: parceria com distribuidor local", done: false, priority: "critical" },
      { text: "Operação Colombia: Bogotá e Medellín", done: false, priority: "critical" },
      { text: "Compliance: LGPD equivalente em cada mercado", done: false, priority: "high" },
      { text: "OpenRTB multi-currency (USD, MXN, COP)", done: false, priority: "high" },
      { text: "Primeira conversa de aquisição estratégica (JCDecaux/WPP)", done: false, priority: "medium" },
    ],
  },
  {
    id: "series-a",
    label: "SERIES A",
    period: "2028–2029",
    title: "R$80M captados · IPO track",
    subtitle: "Preparação para liquidez",
    status: "locked",
    color: T.gold,
    valuation: "R$800M–2B",
    milestone: "15k telas · 6 países",
    icon: Star,
    tasks: [
      { text: "Captar R$80M Series A (Tiger Global, SoftBank, IFC)", done: false, priority: "critical" },
      { text: "ARR > R$8M com NRR > 120%", done: false, priority: "critical" },
      { text: "Contrato com agência de médio porte (50-200 telas)", done: false, priority: "high" },
      { text: "Programa de emissão de carbono / ESG auditado", done: false, priority: "medium" },
      { text: "S-1 ou prospecto B3 em elaboração", done: false, priority: "medium" },
    ],
  },
  {
    id: "unicorn",
    label: "UNICÓRNIO",
    period: "2030–2031",
    title: "IPO · Valuation R$1B+",
    subtitle: "DOOHPLAY Unicorn",
    status: "locked",
    color: T.gold,
    valuation: "R$1–5B",
    milestone: "62k telas · LATAM líder",
    icon: Star,
    tasks: [
      { text: "62.000+ telas ativas na América Latina", done: false, priority: "critical" },
      { text: "ARR > R$85M · Margem EBITDA > 25%", done: false, priority: "critical" },
      { text: "IPO na B3 ou NYSE/NASDAQ", done: false, priority: "critical" },
      { text: "Dado de audiência como produto: R$9M ARR separado", done: false, priority: "high" },
    ],
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: T.danger,
  high: T.warning,
  medium: T.textSub,
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
};

interface Props { onBack: () => void; }

export default function UnicornRoadmap({ onBack }: Props) {
  const [activePhase, setActivePhase] = useState("now");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const phase = PHASES.find(p => p.id === activePhase) ?? PHASES[0];
  const PhaseIcon = phase.icon;

  const toggleTask = (key: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Star size={16} style={{ color: T.gold }} /> Roteiro do Unicórnio
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.gold + "40", color: T.gold }}>
            2026 → 2031
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-stretch gap-0 overflow-x-auto pb-4">
            {PHASES.map((p, i) => {
              const Icon = p.icon;
              const isActive = activePhase === p.id;
              const isLocked = p.status === "locked";
              return (
                <div key={p.id} className="flex items-stretch flex-shrink-0">
                  <button
                    onClick={() => setActivePhase(p.id)}
                    className="flex flex-col items-center p-4 rounded-2xl border transition-all text-center w-36"
                    style={{
                      background: isActive ? p.color + "20" : T.card,
                      borderColor: isActive ? p.color + "60" : T.border,
                      opacity: isLocked && !isActive ? 0.6 : 1,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: p.color + "25" }}>
                      {isLocked ? <Lock size={16} style={{ color: p.color }} /> : <Icon size={16} style={{ color: p.color }} />}
                    </div>
                    <div className="text-xs font-black mb-0.5" style={{ color: p.color }}>{p.label}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{p.period}</div>
                    <div className="mt-2 text-xs font-bold" style={{ color: isActive ? p.color : T.textSub }}>{p.valuation}</div>
                  </button>
                  {i < PHASES.length - 1 && (
                    <div className="flex items-center px-1">
                      <ChevronRight size={14} style={{ color: T.textSub, opacity: 0.4 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: phase.color + "30" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: phase.color + "25" }}>
                  <PhaseIcon size={22} style={{ color: phase.color }} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: phase.color }}>{phase.label}</div>
                  <div className="font-black text-lg leading-tight">{phase.title}</div>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: T.textSub }}>{phase.subtitle}</p>
              <div className="space-y-3">
                {[
                  { label: "Período", value: phase.period },
                  { label: "Valuation alvo", value: phase.valuation, color: phase.color },
                  { label: "Marco-chave", value: phase.milestone },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-sm border-b pb-2" style={{ borderColor: T.border }}>
                    <span style={{ color: T.textSub }}>{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color || T.text }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Progresso nesta fase</span>
                <span className="text-sm font-bold" style={{ color: phase.color }}>
                  {phase.tasks.filter((_, j) => completedTasks.has(`${phase.id}-${j}`)).length}/{phase.tasks.length}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: T.border }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${(phase.tasks.filter((_, j) => completedTasks.has(`${phase.id}-${j}`)).length / phase.tasks.length) * 100}%`,
                  background: phase.color,
                }} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Tarefas desta fase</h2>
              <div className="flex gap-2 text-xs">
                {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 rounded-full" style={{ background: PRIORITY_COLOR[k] + "20", color: PRIORITY_COLOR[k] }}>{v}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {phase.tasks.map((task, j) => {
                const key = `${phase.id}-${j}`;
                const done = completedTasks.has(key);
                return (
                  <button
                    key={j}
                    onClick={() => toggleTask(key)}
                    className="w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all hover:opacity-90"
                    style={{
                      background: done ? phase.color + "08" : T.card,
                      borderColor: done ? phase.color + "30" : T.border,
                    }}
                  >
                    {done
                      ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: phase.color }} />
                      : <Circle size={18} className="mt-0.5 flex-shrink-0" style={{ color: T.textSub + "60" }} />
                    }
                    <div className="flex-1">
                      <span className="text-sm" style={{ color: done ? T.textSub : T.text, textDecoration: done ? "line-through" : "none" }}>
                        {task.text}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: PRIORITY_COLOR[task.priority] + "20", color: PRIORITY_COLOR[task.priority] }}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
