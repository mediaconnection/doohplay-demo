import { useState, Fragment } from "react";
import { ArrowLeft, Shield, Check, X, Lock, Tv, Building2, Megaphone, Users, Star, ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const PROFILES = [
  { id: "owner_starter", label: "Dono · Starter", color: T.success, icon: Tv, short: "S" },
  { id: "owner_pro", label: "Dono · Pro", color: T.primary, icon: Tv, short: "P" },
  { id: "owner_business", label: "Dono · Business", color: T.gold, icon: Tv, short: "B" },
  { id: "advertiser", label: "Anunciante", color: "#E91E63", icon: Megaphone, short: "A" },
  { id: "agency", label: "Agência", color: T.accent, icon: Building2, short: "AG" },
  { id: "partner", label: "Parceiro", color: T.warning, icon: Star, short: "PR" },
  { id: "admin", label: "Admin DOOHPLAY", color: T.danger, icon: Shield, short: "ADM" },
];

type Access = "full" | "limited" | "readonly" | "none" | "upgrade";

interface Feature {
  id: string;
  category: string;
  name: string;
  description: string;
  access: Record<string, Access>;
  gateNote?: string;
}

const FEATURES: Feature[] = [
  // Studio
  { id: "studio_basic", category: "Studio", name: "Studio básico", description: "Editor de conteúdo, templates, upload de mídia",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "studio_ai", category: "Studio", name: "Geração de IA (30/mês)", description: "30 gerações Gemini/mês",
    access: { owner_starter: "limited", owner_pro: "none", owner_business: "none", advertiser: "none", agency: "none", partner: "none", admin: "full" },
    gateNote: "Starter: 30/mês · Pro: 150/mês · Business: 500/mês" },
  { id: "studio_ai_pro", category: "Studio", name: "Geração de IA (150/mês)", description: "150 gerações Gemini/mês",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "studio_formats", category: "Studio", name: "Formatos extras (lateral, faixa, flutuante)", description: "Além do fullscreen padrão",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "full", agency: "full", partner: "none", admin: "full" } },
  // Player
  { id: "player_weighted", category: "Player", name: "Sorteio ponderado de anúncios", description: "60/20/15/5% por categoria",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "player_channel", category: "Player", name: "Canal DOOHPLAY (12 canais)", description: "Conteúdo segmentado por negócio",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "limited", advertiser: "none", agency: "none", partner: "none", admin: "full" },
    gateNote: "Business: Canal personalizado com identidade da marca" },
  { id: "player_widgets", category: "Player", name: "Widgets básicos (clima, câmbio)", description: "Painel de dados ao vivo",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "player_widgets_custom", category: "Player", name: "Widgets com dados proprietários", description: "Integração de dados próprios via API",
    access: { owner_starter: "upgrade", owner_pro: "upgrade", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  // ProofChain
  { id: "proof_basic", category: "ProofChain", name: "Prova de exibição básica", description: "RSA-SHA256 + Merkle",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "full", advertiser: "readonly", agency: "readonly", partner: "none", admin: "full" } },
  { id: "proof_polygon", category: "ProofChain", name: "Registro Polygon Mainnet", description: "Imutabilidade on-chain",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "readonly", agency: "readonly", partner: "none", admin: "full" } },
  { id: "proof_legal", category: "ProofChain", name: "Auditoria jurídica (TSA + DPA)", description: "Validade jurídica ICP-Brasil",
    access: { owner_starter: "upgrade", owner_pro: "upgrade", owner_business: "full", advertiser: "full", agency: "full", partner: "none", admin: "full" } },
  // Screens
  { id: "screens_1", category: "Telas", name: "1 tela gerenciada", description: "Limite do plano Starter",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "screens_5", category: "Telas", name: "Até 5 telas", description: "Limite do plano Pro",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "screens_20", category: "Telas", name: "Até 20 telas (+R$150 extra)", description: "Limite do plano Business",
    access: { owner_starter: "upgrade", owner_pro: "upgrade", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  // Reporting
  { id: "reports_basic", category: "Relatórios", name: "Relatórios básicos", description: "Impressões, uptime, exibições",
    access: { owner_starter: "full", owner_pro: "full", owner_business: "full", advertiser: "full", agency: "full", partner: "limited", admin: "full" } },
  { id: "reports_advanced", category: "Relatórios", name: "Relatórios avançados + exportação BI", description: "Download CSV/Excel, integração BI",
    access: { owner_starter: "upgrade", owner_pro: "full", owner_business: "full", advertiser: "full", agency: "full", partner: "none", admin: "full" } },
  { id: "reports_audience", category: "Relatórios", name: "Audience Intelligence", description: "Dados de audiência anonimizados",
    access: { owner_starter: "upgrade", owner_pro: "upgrade", owner_business: "full", advertiser: "full", agency: "full", partner: "none", admin: "full" } },
  // API
  { id: "api_basic", category: "API & Integrações", name: "Integrações básicas (iFood, TOTVS, Bling)", description: "Conectores pré-configurados",
    access: { owner_starter: "none", owner_pro: "full", owner_business: "full", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "api_full", category: "API & Integrações", name: "API completa + Webhooks", description: "REST API com autenticação JWT",
    access: { owner_starter: "upgrade", owner_pro: "limited", owner_business: "full", advertiser: "none", agency: "full", partner: "none", admin: "full" } },
  { id: "api_openrtb", category: "API & Integrações", name: "OpenRTB 2.5 (DSP)", description: "Integração com DV360, The Trade Desk",
    access: { owner_starter: "none", owner_pro: "none", owner_business: "none", advertiser: "full", agency: "full", partner: "none", admin: "full" } },
  // Admin
  { id: "admin_enterprise", category: "Enterprise", name: "Enterprise Dashboard", description: "Todos os módulos de gestão",
    access: { owner_starter: "none", owner_pro: "none", owner_business: "none", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "admin_investor", category: "Enterprise", name: "Investor Data Room", description: "ARR, unit economics, tese de saída",
    access: { owner_starter: "none", owner_pro: "none", owner_business: "none", advertiser: "none", agency: "none", partner: "none", admin: "full" } },
  { id: "partner_portal", category: "Parceiros", name: "Partner Portal", description: "Simulador de comissão, ranking, materiais",
    access: { owner_starter: "none", owner_pro: "none", owner_business: "none", advertiser: "none", agency: "none", partner: "full", admin: "full" } },
];

const categories = [...new Set(FEATURES.map(f => f.category))];

const ACCESS_CONFIG: Record<Access, { label: string; color: string; icon: React.ReactNode }> = {
  full: { label: "Completo", color: T.success, icon: <Check size={12} /> },
  limited: { label: "Limitado", color: T.warning, icon: <Check size={12} /> },
  readonly: { label: "Somente leitura", color: T.primary, icon: <Eye size={12} /> },
  upgrade: { label: "Upgrade", color: T.textSub, icon: <Lock size={12} /> },
  none: { label: "Sem acesso", color: T.border, icon: <X size={10} /> },
};

interface Props { onBack: () => void; }

export default function AccessControl({ onBack }: Props) {
  const [tab, setTab] = useState<"matrix" | "profiles" | "gates">("matrix");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categories));
  const [filterProfile, setFilterProfile] = useState<string | null>(null);
  const [highlightUpgrade, setHighlightUpgrade] = useState(false);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const visibleProfiles = filterProfile ? PROFILES.filter(p => p.id === filterProfile) : PROFILES;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Shield size={16} style={{ color: T.primary }} /> Controle de Acesso
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.border, color: T.textSub }}>
            {FEATURES.length} features · {PROFILES.length} perfis
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "matrix", label: "Matriz de permissões" },
            { id: "profiles", label: "Perfis detalhados" },
            { id: "gates", label: "Gates de upgrade" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: tab === t.id ? T.primary : T.card, color: tab === t.id ? "#fff" : T.textSub, border: `1px solid ${tab === t.id ? T.primary : T.border}` }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Matrix */}
        {tab === "matrix" && (
          <div>
            {/* Legend + filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-3">
                {Object.entries(ACCESS_CONFIG).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 text-xs">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: v.color + "25", color: v.color }}>{v.icon}</div>
                    <span style={{ color: T.textSub }}>{v.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHighlightUpgrade(h => !h)}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={{ borderColor: highlightUpgrade ? T.warning : T.border, color: highlightUpgrade ? T.warning : T.textSub, background: highlightUpgrade ? T.warning + "10" : T.card }}>
                  Destacar upgrades
                </button>
              </div>
            </div>

            {/* Profile filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setFilterProfile(null)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{ background: !filterProfile ? T.primary : T.card, borderColor: !filterProfile ? T.primary : T.border, color: !filterProfile ? "#fff" : T.textSub }}>
                Todos
              </button>
              {PROFILES.map(p => (
                <button key={p.id} onClick={() => setFilterProfile(filterProfile === p.id ? null : p.id)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{ background: filterProfile === p.id ? p.color + "20" : T.card, borderColor: filterProfile === p.id ? p.color : T.border, color: filterProfile === p.id ? p.color : T.textSub }}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: T.panel }}>
                      <th className="text-left p-4 font-medium w-64" style={{ color: T.textSub }}>Feature</th>
                      {visibleProfiles.map(p => {
                        const Icon = p.icon;
                        return (
                          <th key={p.id} className="text-center p-3 min-w-24" style={{ color: p.color }}>
                            <div className="flex flex-col items-center gap-1">
                              <Icon size={14} />
                              <span className="text-xs">{p.short}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <Fragment key={cat}>
                        <tr className="cursor-pointer" style={{ background: T.panel }} onClick={() => toggleCat(cat)}>
                          <td colSpan={visibleProfiles.length + 1} className="p-3 font-bold text-xs flex items-center gap-2" style={{ color: T.textSub }}>
                            {expandedCats.has(cat) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {cat}
                            <span className="ml-1 font-normal">({FEATURES.filter(f => f.category === cat).length})</span>
                          </td>
                        </tr>
                        {expandedCats.has(cat) && FEATURES.filter(f => f.category === cat).map((feature, fi) => (
                          <tr key={feature.id} className="border-t" style={{ borderColor: T.border, background: fi % 2 === 0 ? T.card : T.bg }}>
                            <td className="p-3 pr-6">
                              <div className="font-medium mb-0.5" style={{ color: T.text }}>{feature.name}</div>
                              <div style={{ color: T.textSub }}>{feature.description}</div>
                              {feature.gateNote && (
                                <div className="mt-1 text-xs" style={{ color: T.warning }}>⚠ {feature.gateNote}</div>
                              )}
                            </td>
                            {visibleProfiles.map(p => {
                              const access = feature.access[p.id] as Access;
                              const cfg = ACCESS_CONFIG[access];
                              const isUpgrade = access === "upgrade";
                              return (
                                <td key={p.id} className="text-center p-3">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all"
                                    style={{
                                      background: cfg.color + (access === "none" ? "15" : "25"),
                                      color: cfg.color,
                                      outline: highlightUpgrade && isUpgrade ? `2px solid ${T.warning}` : "none",
                                    }}>
                                    {cfg.icon}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profiles detail */}
        {tab === "profiles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROFILES.map(p => {
              const Icon = p.icon;
              const profileFeatures = FEATURES.filter(f => f.access[p.id] !== "none" && f.access[p.id] !== "upgrade");
              const upgradeFeatures = FEATURES.filter(f => f.access[p.id] === "upgrade");
              return (
                <div key={p.id} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: p.color + "30" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.color + "20" }}>
                      <Icon size={18} style={{ color: p.color }} />
                    </div>
                    <div>
                      <div className="font-bold">{p.label}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{profileFeatures.length} features ativas</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {profileFeatures.slice(0, 8).map(f => (
                      <div key={f.id} className="flex items-center gap-2 text-xs">
                        <Check size={11} style={{ color: p.color }} className="flex-shrink-0" />
                        <span style={{ color: T.textSub }}>{f.name}</span>
                      </div>
                    ))}
                    {profileFeatures.length > 8 && (
                      <div className="text-xs" style={{ color: T.textSub }}>+{profileFeatures.length - 8} mais...</div>
                    )}
                  </div>

                  {upgradeFeatures.length > 0 && (
                    <div className="border-t pt-4" style={{ borderColor: T.border }}>
                      <div className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: T.warning }}>
                        <Lock size={10} /> {upgradeFeatures.length} features bloqueadas (upgrade)
                      </div>
                      {upgradeFeatures.slice(0, 3).map(f => (
                        <div key={f.id} className="flex items-center gap-2 text-xs mb-1">
                          <Lock size={10} style={{ color: T.textSub }} />
                          <span style={{ color: T.textSub + "80" }}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Gates */}
        {tab === "gates" && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 mb-6" style={{ background: T.card, borderColor: T.warning + "30" }}>
              <div className="flex items-start gap-3">
                <AlertCircle size={20} style={{ color: T.warning }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Status atual dos gates</div>
                  <p className="text-sm" style={{ color: T.textSub }}>
                    Os gates abaixo estão <span style={{ color: T.warning }}>definidos como regra</span> mas ainda não têm enforcement técnico no produto. Cada item marcado como "pendente" é um gap entre o que os planos prometem e o que o código verifica.
                  </p>
                </div>
              </div>
            </div>

            {[
              { feature: "Cota de IA por plano (30/150/500)", status: "pending", effort: "Médio", impact: "Alto", path: "Verificar contador no Supabase antes de chamar Gemini API" },
              { feature: "Limite de telas por plano (1/5/20)", status: "pending", effort: "Baixo", impact: "Alto", path: "Query COUNT(screens) WHERE client_id = X antes de criar nova tela" },
              { feature: "Formatos extras bloqueados no Starter", status: "pending", effort: "Baixo", impact: "Médio", path: "Flag no JWT ou perfil do cliente verificada no Studio" },
              { feature: "Sorteio ponderado bloqueado no Starter", status: "pending", effort: "Médio", impact: "Médio", path: "Checar plano antes de ativar algoritmo de peso no player" },
              { feature: "API bloqueada no Starter", status: "pending", effort: "Baixo", impact: "Alto", path: "Middleware de autenticação verifica plano antes de responder" },
              { feature: "Relatórios avançados no Starter/Pro", status: "pending", effort: "Baixo", impact: "Médio", path: "Gate no endpoint /reports/export verifica plano" },
              { feature: "Canal DOOHPLAY personalizado (Business)", status: "pending", effort: "Alto", impact: "Médio", path: "Campo channel_config no schema do cliente, só editável em Business" },
              { feature: "Widgets proprietários (Business only)", status: "pending", effort: "Alto", impact: "Baixo", path: "Tipo de widget 'custom_api' bloqueado para planos < Business" },
              { feature: "ProofChain Polygon (Pro+)", status: "implemented", effort: "—", impact: "Alto", path: "Já conectado ao play_log desde 06/07" },
              { feature: "Login WhatsApp OTP", status: "implemented", effort: "—", impact: "Alto", path: "Implementado e testado em produção" },
            ].map((gate, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border" style={{
                background: T.card,
                borderColor: gate.status === "implemented" ? T.success + "30" : T.border,
              }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: gate.status === "implemented" ? T.success + "20" : T.warning + "20" }}>
                  {gate.status === "implemented"
                    ? <Check size={10} style={{ color: T.success }} />
                    : <Lock size={10} style={{ color: T.warning }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{gate.feature}</div>
                  {gate.status === "pending" && (
                    <div className="text-xs mb-1" style={{ color: T.textSub }}><span style={{ color: T.primary }}>Como implementar:</span> {gate.path}</div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {gate.status === "pending" && (
                    <>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: gate.effort === "Baixo" ? T.success + "15" : gate.effort === "Médio" ? T.warning + "15" : T.danger + "15", color: gate.effort === "Baixo" ? T.success : gate.effort === "Médio" ? T.warning : T.danger }}>
                        {gate.effort} esforço
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.primary + "15", color: T.primary }}>
                        {gate.impact} impacto
                      </span>
                    </>
                  )}
                  {gate.status === "implemented" && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.success + "15", color: T.success }}>Implementado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
