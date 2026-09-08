import { useState } from "react";
import { Monitor, Play, DollarSign, Shield, TrendingUp, CheckCircle, ArrowRight, Sparkles, Zap, Star, ChevronRight, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  onNavigate?: (v: string) => void;
}

const STEPS = [
  {
    id: "welcome",
    icon: Sparkles,
    color: T.primary,
    title: "Bem-vindo ao DOOHPLAY",
    subtitle: "A plataforma DOOH que transforma qualquer tela em fonte de renda",
    description: "Em menos de 5 minutos você vai entender como ganhar dinheiro exibindo anúncios nas telas do seu negócio. Vamos começar?",
    visual: "welcome",
    action: "Vamos lá!",
  },
  {
    id: "screens",
    icon: Monitor,
    color: T.success,
    title: "Configure sua tela",
    subtitle: "Instale o app Android e conecte sua TV",
    description: "Baixe o DOOHPLAY Player v0.7.1 na sua TV Box ou Chromecast. Em menos de 2 minutos sua tela está exibindo anúncios e gerando receita.",
    visual: "screens",
    action: "Entendi, continuar",
    cta: { label: "Configurar tela agora", view: "screen-setup" },
  },
  {
    id: "campaigns",
    icon: Play,
    color: T.accent,
    title: "Seus anúncios aparecem automaticamente",
    subtitle: "O motor de leilão ponderado trabalha por você 24h",
    description: "O DOOHPLAY usa um sistema de leilão em tempo real. Anunciantes competem por cada slot de 15 segundos na sua tela. Quanto mais audiência, maior o CPM.",
    visual: "auction",
    action: "Incrível, próximo",
    cta: { label: "Ver leilão ao vivo", view: "ad-auction" },
  },
  {
    id: "proof",
    icon: Shield,
    color: T.gold,
    title: "ProofChain: prova irrefutável de exibição",
    subtitle: "4 camadas de segurança: RSA → Merkle → Polygon → TSA",
    description: "Cada exibição é registrada na blockchain Polygon e carimbada com RFC3161. Anunciantes recebem prova criptográfica de que seu anúncio foi exibido — sem possibilidade de fraude.",
    visual: "proof",
    action: "Que segurança! Próximo",
    cta: { label: "Ver ProofChain", view: "proofchain-center" },
  },
  {
    id: "revenue",
    icon: DollarSign,
    color: T.success,
    title: "Receba sua receita todo mês",
    subtitle: "Saque via Pix quando quiser, sem burocracia",
    description: "Sua receita é calculada automaticamente com base em impressões, CPM e fill rate. Saque para qualquer conta bancária via Pix. Transparência total no painel financeiro.",
    visual: "revenue",
    action: "Quero ver minha receita",
    cta: { label: "Ver painel financeiro", view: "revenue-report" },
  },
  {
    id: "done",
    icon: Star,
    color: T.gold,
    title: "Tudo pronto! 🎉",
    subtitle: "Você está a um passo de monetizar suas telas",
    description: "Configure sua primeira tela, e em 24h você já estará recebendo anúncios. A maioria dos parceiros recupera o custo do plano nos primeiros 10 dias.",
    visual: "done",
    action: "Ir para o Dashboard",
  },
];

function VisualWelcome() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
          <Sparkles size={52} color="#fff" />
        </div>
        {[T.success, T.gold, T.warning].map((c, i) => (
          <div key={i} className="absolute w-6 h-6 rounded-full animate-bounce"
            style={{ background: c, top: i * 30 - 10, right: -20, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function VisualScreens() {
  return (
    <div className="h-full flex items-center justify-center gap-4">
      {["Recepção", "Sala", "Caixa"].map((name, i) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="w-24 h-16 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${T.primary}30,${T.accent}30)`, border: `1px solid ${T.success}60` }}>
            <Monitor size={28} style={{ color: T.success }} />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: T.success }} />
          </div>
          <span className="text-xs font-medium" style={{ color: T.textSub }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

function VisualAuction() {
  const bids = [
    { name: "Bar & Grill", cpm: 72, tier: "Premium", color: T.gold, won: true },
    { name: "Farmácia", cpm: 58, tier: "Standard", color: T.primary, won: false },
    { name: "Academia", cpm: 44, tier: "Basic", color: T.accent, won: false },
  ];
  return (
    <div className="h-full flex flex-col justify-center gap-2 px-4">
      {bids.map((b, i) => (
        <div key={b.name} className="flex items-center gap-3 p-3 rounded-xl transition-all"
          style={{ background: b.won ? T.gold + "15" : T.panel, border: `1px solid ${b.won ? T.gold + "40" : T.border}` }}>
          <span className="text-xs font-bold w-4" style={{ color: T.textSub }}>#{i+1}</span>
          <span className="flex-1 text-sm font-medium">{b.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: b.color + "20", color: b.color }}>{b.tier}</span>
          <span className="font-black text-sm" style={{ color: b.won ? T.gold : T.text }}>R${b.cpm}</span>
          {b.won && <CheckCircle size={14} style={{ color: T.gold }} />}
        </div>
      ))}
    </div>
  );
}

function VisualProof() {
  const layers = [
    { label: "RSA-SHA256", color: T.primary, icon: "🔐" },
    { label: "Merkle Tree", color: T.accent, icon: "🌳" },
    { label: "Polygon", color: T.success, icon: "⛓️" },
    { label: "TSA RFC3161", color: T.gold, icon: "⏱️" },
  ];
  return (
    <div className="h-full flex flex-col justify-center gap-2 px-4">
      {layers.map((l, i) => (
        <div key={l.label} className="flex items-center gap-3">
          {i > 0 && <div className="w-px h-3 mx-6" style={{ background: T.border }} />}
          <div className="flex items-center gap-3 p-2.5 rounded-xl w-full"
            style={{ background: l.color + "15", border: `1px solid ${l.color}30` }}>
            <span>{l.icon}</span>
            <span className="font-bold text-sm" style={{ color: l.color }}>{l.label}</span>
            <CheckCircle size={13} style={{ color: l.color, marginLeft: "auto" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function VisualRevenue() {
  const bars = [3.2, 4.1, 3.8, 5.2, 6.8, 7.4, 9.1];
  const max = Math.max(...bars);
  return (
    <div className="h-full flex flex-col justify-center px-4">
      <div className="flex items-end gap-2 h-20 mb-3">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 rounded-t-lg transition-all"
            style={{ height: `${(v / max) * 100}%`, background: i === bars.length - 1 ? T.success : T.primary + "60" }} />
        ))}
      </div>
      <div className="text-center">
        <span className="font-black text-2xl" style={{ color: T.success }}>R$9.400</span>
        <span className="text-xs ml-2" style={{ color: T.textSub }}>este mês</span>
      </div>
    </div>
  );
}

function VisualDone() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: T.success + "20" }}>
          <CheckCircle size={44} style={{ color: T.success }} />
        </div>
        <div className="font-black text-xl" style={{ color: T.success }}>Pronto para decolar!</div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, () => JSX.Element> = {
  welcome: VisualWelcome,
  screens: VisualScreens,
  auction: VisualAuction,
  proof:   VisualProof,
  revenue: VisualRevenue,
  done:    VisualDone,
};

export default function OnboardingTour({ onComplete, onSkip, onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Visual = VISUALS[current.visual];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) onComplete();
    else setStep(s => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(2,3,14,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden border" style={{ background: T.panel, borderColor: T.border }}>
        {/* Progress */}
        <div className="flex px-6 pt-5 gap-1.5 items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-300"
                style={{ width: i === step ? 24 : 8, background: i <= step ? T.primary : T.border }} />
            ))}
          </div>
          <button onClick={onSkip} className="text-xs hover:opacity-70" style={{ color: T.textSub }}>
            Pular tour
          </button>
        </div>

        {/* Visual */}
        <div className="mx-6 mt-5 rounded-2xl overflow-hidden" style={{ background: T.card, height: 180, border: `1px solid ${T.border}` }}>
          <Visual />
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: current.color + "20" }}>
              <current.icon size={18} style={{ color: current.color }} />
            </div>
            <div>
              <div className="font-black text-base">{current.title}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{current.subtitle}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: T.textSub }}>{current.description}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          {current.cta && (
            <button onClick={() => { onNavigate?.(current.cta!.view); onSkip(); }}
              className="w-full py-2.5 rounded-xl text-sm font-bold"
              style={{ background: current.color + "20", color: current.color, border: `1px solid ${current.color}30` }}>
              {current.cta.label} →
            </button>
          )}
          <button onClick={next}
            className="w-full py-3 rounded-xl text-base font-black flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
            {current.action}
            {!isLast && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
