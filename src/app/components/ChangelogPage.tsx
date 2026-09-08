import { useState } from "react";
import { ArrowLeft, Zap, Shield, Star, Wrench, TrendingUp, ChevronDown } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ChangeType = "feature" | "improvement" | "fix" | "security" | "breaking";

interface Change { type: ChangeType; text: string; }
interface Release { version: string; date: string; title: string; summary: string; changes: Change[]; highlight?: boolean; }

const CHANGE_CFG: Record<ChangeType, { label: string; color: string; icon: typeof Zap }> = {
  feature:     { label: "Novo",       color: T.primary, icon: Zap       },
  improvement: { label: "Melhoria",   color: T.success, icon: TrendingUp },
  fix:         { label: "Correção",   color: T.warning, icon: Wrench     },
  security:    { label: "Segurança",  color: T.accent,  icon: Shield     },
  breaking:    { label: "Atenção",    color: T.danger,  icon: Star       },
};

const RELEASES: Release[] = [
  {
    version: "0.7.1", date: "23 Jul 2026", title: "DOOHPLAY Player estável + ProofChain v4",
    summary: "Lançamento do Player Android estável com suporte a ProofChain 4 camadas e geração de impressões em tempo real.",
    highlight: true,
    changes: [
      { type: "feature",     text: "Player Android v0.7.1 — estável para produção" },
      { type: "feature",     text: "ProofChain v4: RSA-SHA256 → Merkle → Polygon → TSA RFC3161" },
      { type: "feature",     text: "Inventory Manager: mapa de calor de horários e preços dinâmicos" },
      { type: "feature",     text: "White Label Portal: branding personalizado e gestão de revendedores" },
      { type: "feature",     text: "Tax Center: emissão automática de NFS-e e DAS" },
      { type: "improvement", text: "Dashboard do proprietário com métricas em tempo real" },
      { type: "improvement", text: "IA Gemini para geração de criativos — 30 gerações/mês no plano Pro" },
      { type: "fix",         text: "Correção de re-conexão do player após queda de rede" },
      { type: "security",    text: "2FA via WhatsApp OTP em todos os logins" },
    ],
  },
  {
    version: "0.7.0", date: "10 Jul 2026", title: "Marketplace + Contratos Digitais",
    summary: "Introdução do marketplace de telas e fluxo completo de contratos digitais com assinatura eletrônica.",
    changes: [
      { type: "feature",     text: "Marketplace de telas para anunciantes descobrirem inventário" },
      { type: "feature",     text: "ContractManager: contratos digitais com assinatura e ProofChain" },
      { type: "feature",     text: "FranchiseManager: gerenciamento centralizado de redes com múltiplas unidades" },
      { type: "feature",     text: "Leaderboard: ranking gamificado de proprietários por receita" },
      { type: "improvement", text: "Playlist Manager com drag-and-drop e boost de CPM por slot" },
      { type: "fix",         text: "Notificações em tempo real corrigidas (erro de sintaxe na linha 46)" },
    ],
  },
  {
    version: "0.6.5", date: "20 Jun 2026", title: "IA Assistant + Mapa da Rede",
    summary: "Assistente DOOH AI com conhecimento do produto e mapa interativo do Brasil.",
    changes: [
      { type: "feature",     text: "DOOH AI Assistant: chat com conhecimento especializado em DOOH" },
      { type: "feature",     text: "Mapa do Brasil interativo com 15 cidades e pins de telas" },
      { type: "feature",     text: "Self-Serve Advertiser: fluxo guiado de 6 passos para anunciantes" },
      { type: "feature",     text: "Playlist Manager com pesos por slot e drag-and-drop" },
      { type: "improvement", text: "Performance da tela de Analytics — carregamento 3x mais rápido" },
    ],
  },
  {
    version: "0.6.0", date: "01 Jun 2026", title: "Programa de Indicações + Metas",
    summary: "Sistema de gamificação com metas mensais, XP, conquistas e programa de indicações com comissões.",
    changes: [
      { type: "feature",     text: "ReferralProgram: comissões R$30–R$186/mês por indicação" },
      { type: "feature",     text: "GoalsTracker: metas mensais com gráficos e sugestões de IA" },
      { type: "feature",     text: "OnboardingChecklist: guia gamificado com 4 fases e sistema de XP" },
      { type: "feature",     text: "WhatsApp Center: chat business integrado com templates" },
      { type: "feature",     text: "Report Exporter: 7 formatos de relatório com geração animada" },
      { type: "improvement", text: "Client Dashboard redesenhado com acesso rápido a 12+ módulos" },
    ],
  },
  {
    version: "0.5.5", date: "15 Mai 2026", title: "DevTools + Status Page",
    summary: "Centro para desenvolvedores com geração de API keys, documentação e page de status em tempo real.",
    changes: [
      { type: "feature",     text: "API Center: keys, docs, sandbox e usage analytics" },
      { type: "feature",     text: "Status Page: uptime 99.9% com histórico de 90 dias" },
      { type: "feature",     text: "RevenueOptimizer: sugestões de IA para aumento de CPM" },
      { type: "improvement", text: "Billing Center com histórico de faturas e upgrade de plano" },
      { type: "security",    text: "Rate limiting na API: 1.000 req/min no plano Pro" },
    ],
  },
  {
    version: "0.5.0", date: "01 Mai 2026", title: "Plataforma Enterprise + ProofChain",
    summary: "Lançamento da versão Enterprise com ProofChain, audit trail e dashboard executivo.",
    changes: [
      { type: "feature",     text: "ProofChain Center: visualização das 4 camadas de verificação" },
      { type: "feature",     text: "Blockchain Explorer: explorador de transações on-chain" },
      { type: "feature",     text: "Executive Command Center: NOC em tempo real" },
      { type: "feature",     text: "Unicorn Roadmap: milestones de crescimento para R$1B" },
      { type: "breaking",    text: "API v1 descontinuada — migrar para v2 até Out/2026" },
    ],
  },
];

interface Props { onBack: () => void; }

export default function ChangelogPage({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>("0.7.1");
  const [filter, setFilter] = useState<ChangeType | "all">("all");

  const filteredReleases = RELEASES.map(r => ({
    ...r,
    changes: filter === "all" ? r.changes : r.changes.filter(c => c.type === filter),
  })).filter(r => r.changes.length > 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Zap size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Novidades</h1>
              <p className="text-xs" style={{ color: T.textSub }}>DOOHPLAY Player v0.7.1 — versão atual</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto">
          {([["all","Todos"] as const, ...Object.entries(CHANGE_CFG).map(([k, v]) => [k, v.label] as const)]).map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k as any)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all"
              style={{ borderColor: filter === k ? T.primary : "transparent", color: filter === k ? T.primary : T.textSub }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-3">
        {filteredReleases.map(release => {
          const isExpanded = expanded === release.version;
          return (
            <div key={release.version} className="rounded-2xl border overflow-hidden"
              style={{ background: T.card, borderColor: release.highlight ? T.primary + "30" : T.border }}>
              <button className="w-full flex items-start gap-4 p-5 text-left"
                onClick={() => setExpanded(isExpanded ? null : release.version)}>
                <div className="flex-shrink-0">
                  <div className="font-black text-sm px-3 py-1 rounded-xl"
                    style={{ background: release.highlight ? T.primary + "20" : T.panel, color: release.highlight ? T.primary : T.textSub }}>
                    v{release.version}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{release.title}</span>
                    {release.highlight && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: T.primary + "20", color: T.primary }}>Atual</span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{release.date} · {release.changes.length} atualizações</div>
                  {!isExpanded && <p className="text-xs mt-1.5 line-clamp-1" style={{ color: T.textSub }}>{release.summary}</p>}
                </div>
                <ChevronDown size={16} style={{ color: T.textSub, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginTop: 2 }} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: T.border }}>
                  <p className="text-sm pt-4" style={{ color: T.textSub }}>{release.summary}</p>
                  <div className="space-y-2">
                    {release.changes.map((c, i) => {
                      const cfg = CHANGE_CFG[c.type];
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: cfg.color + "15" }}>
                            <Icon size={12} style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-bold mr-2 px-1.5 py-0.5 rounded-full"
                              style={{ background: cfg.color + "15", color: cfg.color }}>{cfg.label}</span>
                            <span className="text-sm">{c.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
