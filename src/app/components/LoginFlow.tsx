import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Tv, Building2, Megaphone, Users, ChevronRight, Shield, Smartphone, RefreshCw, CheckCircle, Star, Zap } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  text: "#ECF0FF", textSub: "#4A5280",
};

const PROFILES = [
  {
    id: "owner",
    title: "Dono de tela",
    subtitle: "Estabelecimento com tela DOOHPLAY",
    icon: Tv,
    color: T.success,
    examples: ["Barbearia", "Restaurante", "Academia", "Hotel"],
    features: ["Studio de criação", "Canal DOOHPLAY", "Widgets ao vivo", "ProofChain"],
    plan: "Starter · Pro · Business",
  },
  {
    id: "advertiser",
    title: "Anunciante",
    subtitle: "Marca que veicula campanhas na rede",
    icon: Megaphone,
    color: T.primary,
    examples: ["Marca local", "Franquia", "E-commerce", "Startup"],
    features: ["Advertiser Center", "Métricas de entrega", "ProofChain viewer", "Relatórios"],
    plan: "CPM por campanha",
  },
  {
    id: "agency",
    title: "Agência",
    subtitle: "Compra mídia DOOH por múltiplos clientes",
    icon: Building2,
    color: T.accent,
    examples: ["Agência de mídia", "Trading desk", "Mídia independente"],
    features: ["Agency Center", "Multi-cliente", "API completa", "Relatórios agregados"],
    plan: "Volume commitment",
  },
  {
    id: "partner",
    title: "Parceiro / Revendedor",
    subtitle: "Traz clientes e ganha comissão recorrente",
    icon: Star,
    color: T.warning,
    examples: ["Integrador AV", "Consultor de TI", "Franqueado"],
    features: ["Partner Portal", "Simulador de comissão", "Ranking", "Materiais"],
    plan: "Comissão recorrente",
  },
];

const BUSINESS_TYPES = [
  { id: "restaurant", label: "Restaurante / Food", icon: "🍽️" },
  { id: "retail", label: "Varejo / Loja", icon: "🛍️" },
  { id: "gym", label: "Academia / Saúde", icon: "💪" },
  { id: "hotel", label: "Hotel / Pousada", icon: "🏨" },
  { id: "corporate", label: "Escritório / Corporativo", icon: "🏢" },
  { id: "barbershop", label: "Barbearia / Salão", icon: "✂️" },
  { id: "clinic", label: "Clínica / Hospital", icon: "🏥" },
  { id: "other", label: "Outro", icon: "📍" },
];

type Step = "profile" | "phone" | "otp" | "business" | "plan" | "done";

interface Props {
  onBack: () => void;
  onLogin: (profile: string, plan: string, data?: { phone: string; name: string; businessType?: string }) => void;
}

export default function LoginFlow({ onBack, onLogin }: Props) {
  const [step, setStep] = useState<Step>("profile");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [name, setName] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!otpSent) return;
    if (otpTimer <= 0) return;
    const iv = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [otpSent, otpTimer]);

  const profile = PROFILES.find(p => p.id === selectedProfile);

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setOtpSent(true);
    setOtpTimer(60);
    setStep("otp");
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setOtpError(false);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setOtpVerifying(true);
    setTimeout(() => {
      setOtpVerifying(false);
      if (selectedProfile === "owner") {
        setStep("business");
      } else {
        setStep("plan");
      }
    }, 1200);
  };

  const handleFinish = () => {
    setStep("done");
    setTimeout(() => {
      onLogin(
        selectedProfile ?? "owner",
        selectedPlan ?? "pro",
        { phone, name, businessType: businessType ?? undefined }
      );
    }, 1500);
  };

  const stepIndex: Record<Step, number> = { profile: 0, phone: 1, otp: 2, business: 3, plan: 4, done: 5 };
  const totalSteps = selectedProfile === "owner" ? 5 : 4;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b" style={{ borderColor: T.border }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <Tv size={12} color="#fff" />
            </div>
            DOOHPLAY
          </div>
          <div className="text-xs" style={{ color: T.textSub }}>
            {step !== "profile" && step !== "done" ? `${stepIndex[step]}/${totalSteps}` : ""}
          </div>
        </div>
        {step !== "profile" && step !== "done" && (
          <div className="h-0.5" style={{ background: T.border }}>
            <div className="h-full transition-all" style={{ width: `${(stepIndex[step] / totalSteps) * 100}%`, background: profile?.color ?? T.primary }} />
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">

          {step === "profile" && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black mb-2">Bem-vindo à DOOHPLAY</h1>
                <p style={{ color: T.textSub }}>Qual é o seu perfil?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROFILES.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProfile(p.id); setStep("phone"); }}
                      className="rounded-2xl border p-6 text-left transition-all hover:opacity-90 group"
                      style={{ background: T.card, borderColor: T.border }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: p.color + "20" }}>
                          <Icon size={22} style={{ color: p.color }} />
                        </div>
                        <ChevronRight size={16} style={{ color: T.textSub }} className="mt-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="font-bold text-lg mb-1">{p.title}</div>
                      <div className="text-sm mb-3" style={{ color: T.textSub }}>{p.subtitle}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.examples.map(e => (
                          <span key={e} className="text-xs px-2 py-0.5 rounded-full" style={{ background: p.color + "15", color: p.color }}>{e}</span>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
                        <div className="text-xs" style={{ color: T.textSub }}>{p.plan}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "phone" && profile && (
            <div className="max-w-sm mx-auto">
              <button onClick={() => setStep("profile")} className="flex items-center gap-1 text-sm mb-8 hover:text-white transition-colors" style={{ color: T.textSub }}>
                <ArrowLeft size={14} /> Trocar perfil
              </button>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: profile.color + "20" }}>
                  {<profile.icon size={22} style={{ color: profile.color }} />}
                </div>
                <div>
                  <div className="font-bold">{profile.title}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{profile.subtitle}</div>
                </div>
              </div>
              <h2 className="text-2xl font-black mb-2">Seu número de WhatsApp</h2>
              <p className="text-sm mb-6" style={{ color: T.textSub }}>Vamos enviar um código de verificação. Sem senha para lembrar.</p>

              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: T.textSub }}>Nome completo</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="João Silva"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                  style={{ background: T.card, borderColor: T.border, color: T.text }}
                />
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium mb-2 block" style={{ color: T.textSub }}>Celular (WhatsApp)</label>
                <div className="flex gap-3">
                  <div className="px-3 py-3 rounded-xl border text-sm flex items-center gap-2 flex-shrink-0" style={{ background: T.card, borderColor: T.border, color: T.textSub }}>
                    🇧🇷 +55
                  </div>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ background: T.card, borderColor: T.border, color: T.text }}
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={phone.replace(/\D/g, "").length < 10 || !name.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: profile.color, color: "#fff" }}
              >
                <Smartphone size={16} /> Enviar código pelo WhatsApp
              </button>

              <p className="text-xs text-center mt-4" style={{ color: T.textSub }}>
                Ao continuar, você concorda com os Termos de Uso e Política de Privacidade da DOOHPLAY.
              </p>
            </div>
          )}

          {step === "otp" && profile && (
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: profile.color + "20" }}>
                <Smartphone size={28} style={{ color: profile.color }} />
              </div>
              <h2 className="text-2xl font-black mb-2">Código enviado</h2>
              <p className="text-sm mb-8" style={{ color: T.textSub }}>
                Enviamos um código de 6 dígitos para<br />
                <span style={{ color: T.text }}>WhatsApp {phone}</span>
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    maxLength={1}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all"
                    style={{
                      background: T.card,
                      borderColor: otpError ? "#FF4D6A" : digit ? profile.color + "60" : T.border,
                      color: T.text,
                    }}
                  />
                ))}
              </div>

              {otpError && <p className="text-sm mb-4" style={{ color: "#FF4D6A" }}>Código incorreto. Tente novamente.</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.join("").length < 6 || otpVerifying}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 mb-4"
                style={{ background: profile.color, color: "#fff" }}
              >
                {otpVerifying ? <><RefreshCw size={16} className="animate-spin" /> Verificando...</> : <><Shield size={16} /> Verificar código</>}
              </button>

              <button
                disabled={otpTimer > 0}
                onClick={() => { setOtpTimer(60); }}
                className="text-sm transition-colors"
                style={{ color: otpTimer > 0 ? T.textSub : profile.color }}
              >
                {otpTimer > 0 ? `Reenviar em ${otpTimer}s` : "Reenviar código"}
              </button>
            </div>
          )}

          {step === "business" && (
            <div>
              <h2 className="text-2xl font-black mb-2 text-center">Tipo de negócio</h2>
              <p className="text-sm text-center mb-8" style={{ color: T.textSub }}>Vamos personalizar o Canal DOOHPLAY para o seu estabelecimento</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.id}
                    onClick={() => setBusinessType(bt.id)}
                    className="rounded-xl border p-4 text-center transition-all hover:opacity-90"
                    style={{
                      background: businessType === bt.id ? T.success + "15" : T.card,
                      borderColor: businessType === bt.id ? T.success + "50" : T.border,
                    }}
                  >
                    <div className="text-2xl mb-2">{bt.icon}</div>
                    <div className="text-xs font-medium">{bt.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("plan")}
                disabled={!businessType}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: T.success, color: "#fff" }}
              >
                Continuar
              </button>
            </div>
          )}

          {step === "plan" && selectedProfile === "owner" && (
            <div>
              <h2 className="text-2xl font-black mb-2 text-center">Escolha seu plano</h2>
              <p className="text-sm text-center mb-8" style={{ color: T.textSub }}>14 dias grátis em qualquer plano, sem cartão</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: "starter", name: "Starter", price: 97, color: T.success, screens: 1, ai: 30, highlight: false },
                  { id: "pro", name: "Pro", price: 290, color: T.primary, screens: 5, ai: 150, highlight: true },
                  { id: "business", name: "Business", price: 620, color: "#FFD700", screens: 20, ai: 500, highlight: false },
                ].map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="rounded-2xl border p-5 text-left transition-all hover:opacity-90"
                    style={{
                      background: selectedPlan === plan.id ? plan.color + "15" : T.card,
                      borderColor: selectedPlan === plan.id ? plan.color + "50" : T.border,
                      transform: plan.highlight ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    {plan.highlight && (
                      <div className="text-xs font-bold mb-2 px-2 py-0.5 rounded-full inline-block" style={{ background: plan.color, color: "#fff" }}>POPULAR</div>
                    )}
                    <div className="font-bold text-lg mb-1" style={{ color: plan.color }}>{plan.name}</div>
                    <div className="text-3xl font-black mb-3">R${plan.price}<span className="text-sm font-normal" style={{ color: T.textSub }}>/mês</span></div>
                    <div className="space-y-1.5 text-xs" style={{ color: T.textSub }}>
                      <div>📺 {plan.screens} {plan.screens === 1 ? "tela" : "telas"}</div>
                      <div>🤖 {plan.ai} gerações de IA/mês</div>
                      <div>🔒 ProofChain incluso</div>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: plan.color }}>
                        <CheckCircle size={12} /> Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleFinish}
                disabled={!selectedPlan}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}
              >
                Começar 14 dias grátis
              </button>
            </div>
          )}

          {step === "plan" && selectedProfile !== "owner" && (
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: profile?.color + "20" }}>
                {profile && <profile.icon size={28} style={{ color: profile?.color }} />}
              </div>
              <h2 className="text-2xl font-black mb-2">Quase lá!</h2>
              <p className="text-sm mb-8" style={{ color: T.textSub }}>
                Para perfis de {profile?.title}, um especialista da DOOHPLAY vai entrar em contato pelo WhatsApp para configurar seu acesso.
              </p>
              <div className="rounded-2xl border p-5 text-left mb-6" style={{ background: T.card, borderColor: T.border }}>
                <div className="font-bold mb-3">Você terá acesso a:</div>
                {profile?.features.map(f => (
                  <div key={f} className="flex items-center gap-2 py-1.5 text-sm">
                    <CheckCircle size={14} style={{ color: profile.color }} />
                    <span style={{ color: T.textSub }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: profile?.color, color: "#fff" }}
              >
                Confirmar cadastro
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: T.success + "25" }}>
                <CheckCircle size={40} style={{ color: T.success }} />
              </div>
              <h2 className="text-3xl font-black mb-2" style={{ color: T.success }}>Bem-vindo!</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Entrando no painel...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
