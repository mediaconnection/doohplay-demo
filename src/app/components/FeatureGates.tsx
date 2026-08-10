import { useState } from "react";
import { ArrowLeft, Lock, Zap, CheckCircle, AlertCircle, TrendingUp, Shield, Tv, ChevronRight, Star, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const PLANS = [
  { id: "starter", name: "Starter", price: 97, color: T.success },
  { id: "pro", name: "Pro", price: 290, color: T.primary },
  { id: "business", name: "Business", price: 620, color: T.gold },
];

interface Gate {
  id: string;
  feature: string;
  description: string;
  minPlan: "pro" | "business";
  category: string;
  triggerMessage: string;
  upgradeMessage: string;
  status: "enforced" | "pending";
  effort: "low" | "medium" | "high";
}

const GATES: Gate[] = [
  { id: "ai_quota", feature: "Geração de IA", description: "Cota de gerações por plano (30/150/500/mês)", minPlan: "pro", category: "Studio", triggerMessage: "Você atingiu seu limite de 30 gerações este mês.", upgradeMessage: "Faça upgrade para o Pro e tenha 150 gerações/mês com Gemini 3.1.", status: "pending", effort: "medium" },
  { id: "screens_limit", feature: "Limite de telas", description: "Número máximo de telas por conta", minPlan: "pro", category: "Telas", triggerMessage: "Seu plano Starter permite apenas 1 tela.", upgradeMessage: "Com o Pro você gerencia até 5 telas. Com Business, até 20.", status: "pending", effort: "low" },
  { id: "extra_formats", feature: "Formatos extras", description: "Lateral, faixa inferior, flutuante", minPlan: "pro", category: "Player", triggerMessage: "Formatos extras disponíveis a partir do plano Pro.", upgradeMessage: "Expanda o impacto dos seus anúncios com 4 formatos diferentes.", status: "pending", effort: "low" },
  { id: "weighted_lottery", feature: "Sorteio ponderado", description: "Algoritmo de peso 60/20/15/5% por categoria", minPlan: "pro", category: "Player", triggerMessage: "O sorteio ponderado de anúncios está disponível no Pro e Business.", upgradeMessage: "Maximize a receita de mídia com distribuição inteligente de conteúdo.", status: "pending", effort: "medium" },
  { id: "api_access", feature: "API & Webhooks", description: "Acesso à API REST e webhooks de eventos", minPlan: "pro", category: "Integrações", triggerMessage: "A API da DOOHPLAY está disponível a partir do plano Pro.", upgradeMessage: "Integre com seus sistemas via API REST e receba eventos em tempo real.", status: "pending", effort: "low" },
  { id: "advanced_reports", feature: "Relatórios avançados", description: "Exportação CSV/Excel, integração BI", minPlan: "pro", category: "Relatórios", triggerMessage: "Relatórios avançados e exportação disponíveis no Pro e Business.", upgradeMessage: "Exporte seus dados e integre com qualquer ferramenta de BI.", status: "pending", effort: "low" },
  { id: "custom_channel", feature: "Canal personalizado", description: "Canal DOOHPLAY com identidade da marca", minPlan: "business", category: "Player", triggerMessage: "Canal personalizado disponível exclusivamente no Business.", upgradeMessage: "Tenha seu próprio canal com identidade visual da marca na rede DOOHPLAY.", status: "pending", effort: "high" },
  { id: "custom_widgets", feature: "Widgets proprietários", description: "Dados da sua API exibidos nos widgets", minPlan: "business", category: "Widgets", triggerMessage: "Widgets com dados proprietários disponíveis no Business.", upgradeMessage: "Exiba dados da sua operação em tempo real nas suas telas.", status: "pending", effort: "high" },
  { id: "audience_data", feature: "Audience Intelligence", description: "Dados de audiência anonimizados", minPlan: "business", category: "Analytics", triggerMessage: "Audience Intelligence disponível no Business e para Anunciantes.", upgradeMessage: "Acesse dados de audiência anonimizados para otimizar campanhas.", status: "pending", effort: "medium" },
  { id: "proof_polygon", feature: "ProofChain Polygon", description: "Registro on-chain na Polygon Mainnet", minPlan: "pro", category: "ProofChain", triggerMessage: "Registro Polygon disponível no Pro e Business.", upgradeMessage: "Garanta imutabilidade absoluta com registro on-chain auditável por qualquer parte.", status: "enforced", effort: "low" },
  { id: "legal_audit", feature: "Auditoria jurídica", description: "TSA RFC3161 + DPA + whitepaper", minPlan: "business", category: "ProofChain", triggerMessage: "Auditoria jurídica completa disponível no Business.", upgradeMessage: "Validade jurídica ICP-Brasil para contratos enterprise e licitações.", status: "pending", effort: "medium" },
];

interface UpgradeModalProps {
  gate: Gate;
  currentPlan: string;
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}

function UpgradeModal({ gate, currentPlan, onClose, onUpgrade }: UpgradeModalProps) {
  const targetPlan = PLANS.find(p => p.id === gate.minPlan) ?? PLANS[1];
  const higherPlan = gate.minPlan === "pro" ? PLANS[2] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "#000000CC", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl border p-8" style={{ background: T.panel, borderColor: T.border }}>
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: T.warning + "20" }}>
            <Lock size={22} style={{ color: T.warning }} />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70 transition-opacity">
            <X size={16} style={{ color: T.textSub }} />
          </button>
        </div>

        <div className="mb-2 text-xs px-2 py-0.5 rounded-full inline-block" style={{ background: T.warning + "20", color: T.warning }}>
          Recurso bloqueado
        </div>
        <h3 className="text-xl font-black mb-2">{gate.feature}</h3>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: T.textSub }}>{gate.upgradeMessage}</p>

        <div className="space-y-3 mb-6">
          {PLANS.filter(p => {
            const planOrder = { starter: 0, pro: 1, business: 2 };
            return planOrder[p.id as keyof typeof planOrder] >= planOrder[gate.minPlan];
          }).map(plan => (
            <button
              key={plan.id}
              onClick={() => onUpgrade(plan.id)}
              className="w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:opacity-90"
              style={{ background: plan.color + "10", borderColor: plan.color + "40" }}
            >
              <div>
                <div className="font-bold text-left" style={{ color: plan.color }}>{plan.name}</div>
                <div className="text-xs text-left" style={{ color: T.textSub }}>Inclui {gate.feature}</div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-black text-right" style={{ color: plan.color }}>R${plan.price}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>/mês</div>
                </div>
                <ChevronRight size={16} style={{ color: plan.color }} />
              </div>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm border transition-all hover:opacity-80"
          style={{ borderColor: T.border, color: T.textSub }}>
          Continuar com plano atual
        </button>
      </div>
    </div>
  );
}

interface Props {
  onBack: () => void;
  userPlan?: string;
  onUpgrade?: (plan: string) => Promise<any>;
}

export default function FeatureGates({ onBack, userPlan, onUpgrade }: Props) {
  const [simulatedPlan, setSimulatedPlan] = useState(userPlan ?? "starter");
  const [activeGate, setActiveGate] = useState<Gate | null>(null);
  const [upgraded, setUpgraded] = useState<string | null>(null);

  const planOrder: Record<string, number> = { starter: 0, pro: 1, business: 2 };

  const hasAccess = (gate: Gate) => {
    if (upgraded) return true;
    return planOrder[simulatedPlan] >= planOrder[gate.minPlan];
  };

  const handleUpgrade = async (plan: string) => {
    setSimulatedPlan(plan);
    setUpgraded(plan);
    setActiveGate(null);
    if (onUpgrade) await onUpgrade(plan);
  };

  const categories = [...new Set(GATES.map(g => g.category))];
  const currentPlan = PLANS.find(p => p.id === simulatedPlan)!;

  const enforced = GATES.filter(g => g.status === "enforced").length;
  const pending = GATES.filter(g => g.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Zap size={16} style={{ color: T.warning }} /> Feature Gates
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>{enforced} ativos</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: T.warning + "20", color: T.warning }}>{pending} pendentes</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Tv size={16} style={{ color: T.primary }} /> Simulador de plano
              </h2>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>Escolha um plano para ver quais features estão liberadas ou bloqueadas.</p>
              <div className="space-y-2">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => { setSimulatedPlan(plan.id); setUpgraded(null); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                    style={{
                      background: simulatedPlan === plan.id ? plan.color + "15" : T.panel,
                      borderColor: simulatedPlan === plan.id ? plan.color + "50" : T.border,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: simulatedPlan === plan.id ? plan.color : T.border }} />
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: plan.color }}>R${plan.price}/mês</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3 text-sm">Resumo — {currentPlan.name}</h3>
              <div className="space-y-2">
                {[
                  { label: "Features liberadas", value: GATES.filter(g => hasAccess(g)).length, color: T.success },
                  { label: "Features bloqueadas", value: GATES.filter(g => !hasAccess(g)).length, color: T.danger },
                  { label: "Gates enforced", value: GATES.filter(g => g.status === "enforced" && !hasAccess(g)).length, color: T.warning },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span style={{ color: T.textSub }}>{s.label}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3 text-sm">Status de implementação</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: T.textSub }}>Gates com enforcement real</span>
                    <span style={{ color: T.success }}>{enforced}/{GATES.length}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full" style={{ width: `${(enforced / GATES.length) * 100}%`, background: T.success }} />
                  </div>
                </div>
                <p className="text-xs" style={{ color: T.warning }}>
                  {pending} gates definidos mas sem enforcement técnico. Cada um representa um gap entre o que o plano promete e o que o código verifica.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-bold text-xl mb-2">Gates por categoria</h2>
              <p className="text-sm mb-6" style={{ color: T.textSub }}>
                Clique em um gate bloqueado para ver o upgrade prompt — exatamente o que o usuário verá no produto.
              </p>
            </div>

            {categories.map(cat => (
              <div key={cat}>
                <div className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: T.textSub }}>{cat}</div>
                <div className="space-y-2">
                  {GATES.filter(g => g.category === cat).map(gate => {
                    const access = hasAccess(gate);
                    const targetPlan = PLANS.find(p => p.id === gate.minPlan)!;
                    return (
                      <div
                        key={gate.id}
                        className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:opacity-90"
                        style={{
                          background: access ? T.success + "05" : T.card,
                          borderColor: access ? T.success + "20" : T.border,
                        }}
                        onClick={() => !access && setActiveGate(gate)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: access ? T.success + "20" : T.warning + "15" }}>
                          {access
                            ? <CheckCircle size={16} style={{ color: T.success }} />
                            : <Lock size={14} style={{ color: T.warning }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{gate.feature}</div>
                          <div className="text-xs truncate" style={{ color: T.textSub }}>{gate.description}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: gate.status === "enforced" ? T.success + "15" : T.warning + "15", color: gate.status === "enforced" ? T.success : T.warning }}>
                            {gate.status === "enforced" ? "✓ Ativo" : "Pendente"}
                          </span>
                          {!access && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: targetPlan.color + "15", color: targetPlan.color }}>
                              {targetPlan.name}+
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeGate && (
        <UpgradeModal
          gate={activeGate}
          currentPlan={simulatedPlan}
          onClose={() => setActiveGate(null)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
}
