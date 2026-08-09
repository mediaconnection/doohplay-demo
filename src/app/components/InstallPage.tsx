import { useState } from "react";
import { Tv, Wifi, CheckCircle2, Circle, Loader2, DollarSign, Zap, Globe, Shield, ArrowLeft, Copy, RefreshCw } from "lucide-react";
import { Logo } from "./shared/Logo";

const steps = [
  { id: 1, label: "Conectar TV", desc: "Conecte sua TV ou monitor ao Android TV / Chromecast" },
  { id: 2, label: "Validar Código", desc: "Digite o código de 6 dígitos exibido na tela" },
  { id: 3, label: "Registrar Tela", desc: "Confirme os dados da sua tela" },
  { id: 4, label: "Sincronizar Conteúdo", desc: "Aguarde o download do conteúdo inicial" },
  { id: 5, label: "Tela Ativa", desc: "Sua tela está pronta para exibir conteúdo" },
];

const benefits = [
  { icon: DollarSign, title: "Ganhe com anúncios", desc: "Receba pagamentos mensais por exibir anúncios na sua TV", color: "#22C55E" },
  { icon: Zap, title: "Conteúdo automatizado", desc: "Receba vídeos, promoções e notícias sem precisar fazer nada", color: "#2563EB" },
  { icon: Globe, title: "Gestão remota", desc: "Controle sua tela de qualquer lugar pelo celular ou computador", color: "#FF6B00" },
  { icon: Shield, title: "Proof-of-Play", desc: "Cada exibição é registrada e auditável para máxima confiança", color: "#00A3FF" },
];

interface InstallPageProps {
  onBack: () => void;
}

export default function InstallPage({ onBack }: InstallPageProps) {
  const [currentStep, setCurrentStep] = useState(2);
  const [code, setCode] = useState("DHP-847-293");
  const [screenId] = useState("SCR-2024-00847");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const advance = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const reset = () => setCurrentStep(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Precisa de ajuda?</span>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-secondary transition-colors">Falar com suporte</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left column */}
        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-4">
              <Tv size={12} /> Ativação de Tela
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-3 leading-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              Ative sua Tela no DOOHPLAY
            </h1>
            <p className="text-muted-foreground">
              Conecte sua TV, valide o código e comece a exibir conteúdo em poucos minutos.
            </p>
          </div>

          {/* TV Illustration */}
          <div className="relative bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE] rounded-2xl p-8 mb-8 overflow-hidden">
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-64 h-40 bg-[#020617] rounded-xl border-4 border-[#334155] shadow-2xl flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center mx-auto mb-2">
                    <Tv size={24} className="text-white" />
                  </div>
                  <div className="text-white font-mono text-lg font-bold">{code}</div>
                  <div className="text-[#94A3B8] text-xs mt-1">Código de ativação</div>
                </div>
                {/* Signal waves */}
                {currentStep >= 2 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#22C55E] animate-pulse" />
                )}
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg border border-border text-xs font-medium text-[#22C55E] flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              TV Conectada
            </div>
            <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg border border-border text-xs font-medium text-[#2563EB]">
              Android TV
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${b.color}20` }}>
                  <b.icon size={16} style={{ color: b.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — activation card */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ativação da Tela</h2>
            <p className="text-sm text-muted-foreground">Siga os passos abaixo para ativar</p>
          </div>

          {/* Screen ID & Code */}
          <div className="space-y-3 mb-6">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium">ID da Tela</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-foreground">{screenId}</span>
                <button onClick={handleCopy} className="text-[#2563EB] hover:opacity-80 transition-opacity">
                  {copied ? <CheckCircle2 size={16} className="text-[#22C55E]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
              <p className="text-xs text-[#2563EB] mb-1 font-medium">Código de Ativação</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-[#2563EB] tracking-widest">{code}</span>
                <button onClick={() => setCode(`DHP-${Math.floor(100+Math.random()*900)}-${Math.floor(100+Math.random()*900)}`)} className="text-[#2563EB] hover:opacity-80">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wifi size={14} className="text-[#22C55E]" />
              <span className="text-[#22C55E] font-medium">Aguardando conexão...</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-1 mb-8">
            {steps.map((step, i) => {
              const done = currentStep > step.id;
              const active = currentStep === step.id;
              return (
                <div key={step.id}>
                  <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${active ? "bg-[#EFF6FF]" : ""}`}>
                    <div className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 size={20} className="text-[#22C55E]" />
                      ) : active ? (
                        <Loader2 size={20} className="text-[#2563EB] animate-spin" />
                      ) : (
                        <Circle size={20} className="text-[#CBD5E1]" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-[#22C55E]" : active ? "text-[#2563EB]" : "text-muted-foreground"}`}>
                        {step.id}. {step.label}
                      </p>
                      {active && <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>}
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="ml-[1.65rem] w-px h-2" style={{ backgroundColor: done ? "#22C55E" : "#E2E8F0" }} />
                  )}
                </div>
              );
            })}
          </div>

          {currentStep < 5 ? (
            <button
              onClick={advance}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#2563EB" }}
            >
              {currentStep === 1 ? "Iniciar Ativação" : currentStep === 2 ? "Confirmar Código" : currentStep === 3 ? "Registrar Tela" : "Sincronizar Conteúdo"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
                <CheckCircle2 size={32} className="text-[#22C55E] mx-auto mb-2" />
                <p className="font-bold text-[#15803D]">Tela Ativa com sucesso!</p>
                <p className="text-xs text-muted-foreground mt-1">Seu conteúdo começará a ser exibido em instantes</p>
              </div>
              <button onClick={reset} className="w-full py-3 rounded-xl font-semibold border border-border text-muted-foreground hover:bg-secondary transition-colors text-sm">
                Ativar outra tela
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
