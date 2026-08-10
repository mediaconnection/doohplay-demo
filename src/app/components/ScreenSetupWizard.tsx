import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Tv, Smartphone, Wifi, Upload, Play, CheckCircle, QrCode, Download, Zap, Shield, DollarSign, Star, RefreshCw, Monitor, MapPin } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

const SCREEN_SIZES = [
  { id: "32", label: "32″", desc: "Balcão / Caixa", icon: "🖥️", cpd: 18 },
  { id: "43", label: "43″", desc: "Parede / Vitrine", icon: "📺", cpd: 24, popular: true },
  { id: "55", label: "55″", desc: "Espaço amplo", icon: "🖥️", cpd: 32 },
  { id: "other", label: "Outro", desc: "Configurar manualmente", icon: "⚙️", cpd: 20 },
];

const LOCATIONS = [
  { id: "barbearia", label: "Barbearia / Salão", icon: "💈", cpm: 42 },
  { id: "restaurante", label: "Restaurante / Lanchonete", icon: "🍽️", cpm: 38 },
  { id: "farmacia", label: "Farmácia / Clínica", icon: "💊", cpm: 45 },
  { id: "academia", label: "Academia / Studio", icon: "🏋️", cpm: 40 },
  { id: "comercio", label: "Comércio em geral", icon: "🏪", cpm: 35 },
  { id: "outro", label: "Outro", icon: "📍", cpm: 35 },
];

const CONTENT_PACKS = [
  { id: "canal", label: "Canal DOOHPLAY", desc: "12 canais de conteúdo gratuito: notícias, clima, música.", color: T.primary, free: true },
  { id: "template", label: "Templates prontos", desc: "Peças prontas para seu segmento, editáveis em 1 clique.", color: T.accent, free: true },
  { id: "upload", label: "Enviar meu conteúdo", desc: "Imagens e vídeos do seu negócio. Até 50MB gratuito.", color: T.success, free: true },
];

type Step = "size" | "location" | "download" | "connect" | "content" | "live";

interface Props {
  onBack: () => void;
  onComplete?: (data: { size: string; location: string; contentPack: string }) => void;
  session?: { name?: string; plan?: string } | null;
}

export default function ScreenSetupWizard({ onBack, onComplete, session }: Props) {
  const [step, setStep] = useState<Step>("size");
  const [size, setSize] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [contentPack, setContentPack] = useState<string | null>("canal");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [screenId] = useState(() => "SCR-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [goingLive, setGoingLive] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);

  const STEPS: { id: Step; label: string }[] = [
    { id: "size", label: "Tela" },
    { id: "location", label: "Local" },
    { id: "download", label: "App" },
    { id: "connect", label: "Conectar" },
    { id: "content", label: "Conteúdo" },
    { id: "live", label: "Ao vivo!" },
  ];
  const stepIdx = STEPS.findIndex(s => s.id === step);

  useEffect(() => {
    const loc = LOCATIONS.find(l => l.id === location);
    const sz = SCREEN_SIZES.find(s => s.id === size);
    if (loc && sz) {
      setEstimatedRevenue(Math.round(loc.cpm * sz.cpd * 0.72));
    }
  }, [location, size]);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setConnected(true); }, 2800);
  };

  const handleGoLive = () => {
    setGoingLive(true);
    setTimeout(() => { setGoingLive(false); setIsLive(true); }, 2200);
  };

  const next = (s: Step) => setStep(s);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div>
            <h1 className="font-black">Configurar minha tela</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Em menos de 5 minutos você está ao vivo</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="h-1.5 rounded-full w-full transition-all" style={{ background: i <= stepIdx ? T.primary : T.border }} />
                  <span className="text-xs hidden sm:block transition-colors" style={{ color: i === stepIdx ? T.primary : i < stepIdx ? T.success : T.textSub }}>
                    {i < stepIdx ? "✓" : s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">

        {step === "size" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Qual o tamanho da sua TV?</h2>
              <p style={{ color: T.textSub }}>Isso nos ajuda a calibrar a receita estimada e o layout dos anúncios.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SCREEN_SIZES.map(s => (
                <button key={s.id} onClick={() => setSize(s.id)}
                  className="relative p-5 rounded-2xl border text-left transition-all hover:scale-[1.02]"
                  style={{ background: size === s.id ? T.primary + "15" : T.card, borderColor: size === s.id ? T.primary : T.border }}>
                  {s.popular && (
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: T.primary, color: "#fff" }}>
                      Mais comum
                    </div>
                  )}
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-black text-xl mb-0.5">{s.label}</div>
                  <div className="text-sm mb-2" style={{ color: T.textSub }}>{s.desc}</div>
                  <div className="text-xs font-medium" style={{ color: T.success }}>
                    ~R${s.cpd * 30}/mês estimado
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => size && next("location")} disabled={!size}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === "location" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Que tipo de negócio é o seu?</h2>
              <p style={{ color: T.textSub }}>Cada segmento tem anunciantes e CPM diferente.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOCATIONS.map(l => (
                <button key={l.id} onClick={() => setLocation(l.id)}
                  className="p-4 rounded-2xl border text-left transition-all hover:scale-[1.02]"
                  style={{ background: location === l.id ? T.success + "12" : T.card, borderColor: location === l.id ? T.success : T.border }}>
                  <div className="text-2xl mb-2">{l.icon}</div>
                  <div className="font-bold text-sm mb-1">{l.label}</div>
                  <div className="text-xs" style={{ color: T.success }}>CPM R${l.cpm.toFixed(2)}</div>
                </button>
              ))}
            </div>
            {location && size && (
              <div className="rounded-2xl border p-5" style={{ background: T.success + "08", borderColor: T.success + "25" }}>
                <div className="flex items-center gap-3">
                  <DollarSign size={20} style={{ color: T.success }} />
                  <div>
                    <div className="font-bold">Receita estimada</div>
                    <div className="text-xs" style={{ color: T.textSub }}>Com 1 tela no seu segmento e tamanho</div>
                  </div>
                  <div className="ml-auto text-3xl font-black" style={{ color: T.success }}>
                    R${estimatedRevenue}/mês
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep("size")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>
                Voltar
              </button>
              <button onClick={() => location && next("download")} disabled={!location}
                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === "download" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Baixe o app DOOHPLAY na sua TV</h2>
              <p style={{ color: T.textSub }}>Funciona em qualquer Android TV, Fire TV ou tablet Android 8+.</p>
            </div>
            <div className="rounded-2xl border p-8 flex flex-col items-center gap-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-medium mb-2" style={{ color: T.textSub }}>Escaneie com a TV ou celular</div>
              <div className="w-48 h-48 rounded-2xl flex items-center justify-center relative" style={{ background: "#fff" }}>
                <div className="grid grid-cols-7 gap-0.5 p-3">
                  {Array.from({ length: 49 }, (_, i) => {
                    const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,48];
                    const filled = corners.includes(i) || Math.random() > 0.5;
                    return <div key={i} className="w-4 h-4 rounded-sm" style={{ background: filled ? "#05060E" : "transparent" }} />;
                  })}
                </div>
                <QrCode size={120} className="absolute" style={{ color: "#05060E", opacity: 0.15 }} />
              </div>
              <div className="text-center">
                <div className="font-bold">DOOHPLAY Player v0.7.1</div>
                <div className="text-sm mt-0.5" style={{ color: T.textSub }}>Android TV · Fire TV · Tablet</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01]" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#A4C639" + "20" }}>
                  <Download size={20} style={{ color: "#A4C639" }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Google Play Store</div>
                  <div className="text-xs" style={{ color: T.textSub }}>Para Android TV e tablets</div>
                </div>
                <ArrowRight size={16} className="ml-auto" style={{ color: T.textSub }} />
              </button>
              <button className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01]" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FF9900" + "20" }}>
                  <Download size={20} style={{ color: "#FF9900" }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Amazon Appstore</div>
                  <div className="text-xs" style={{ color: T.textSub }}>Para Fire TV Stick e Fire TV</div>
                </div>
                <ArrowRight size={16} className="ml-auto" style={{ color: T.textSub }} />
              </button>
              <button className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01]" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                  <Download size={20} style={{ color: T.primary }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">APK direto (sideload)</div>
                  <div className="text-xs" style={{ color: T.textSub }}>Para TVs sem Google Play</div>
                </div>
                <ArrowRight size={16} className="ml-auto" style={{ color: T.textSub }} />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("location")} className="px-6 py-4 rounded-2xl border font-bold" style={{ borderColor: T.border, color: T.textSub }}>
                Voltar
              </button>
              <button onClick={() => next("connect")}
                className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                Já instalei, continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === "connect" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Conecte sua tela</h2>
              <p style={{ color: T.textSub }}>Abra o app na TV e insira o código abaixo, ou escaneie pelo celular.</p>
            </div>
            <div className="rounded-2xl border p-6 text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-medium mb-3" style={{ color: T.textSub }}>Código da sua tela</div>
              <div className="text-5xl font-black tracking-widest mb-3 font-mono" style={{ color: T.primary, letterSpacing: "0.2em" }}>
                {screenId}
              </div>
              <div className="text-xs" style={{ color: T.textSub }}>Digite este código no app DOOHPLAY na TV</div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: T.panel, borderColor: T.border }}>
              <div className="font-medium text-sm mb-3">Como conectar:</div>
              {[
                { n: "1", t: "Abra o app DOOHPLAY na TV" },
                { n: "2", t: `Digite o código ${screenId} quando solicitado` },
                { n: "3", t: "Aguarde a confirmação de conexão" },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3 mb-2 last:mb-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: T.primary + "20", color: T.primary }}>{s.n}</div>
                  <span className="text-sm" style={{ color: T.textSub }}>{s.t}</span>
                </div>
              ))}
            </div>
            {!connected ? (
              <button onClick={handleConnect} disabled={connecting}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                {connecting ? (
                  <><RefreshCw size={18} className="animate-spin" /> Verificando conexão...</>
                ) : (
                  <><Wifi size={18} /> Verificar conexão</>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: T.success + "10", borderColor: T.success + "30" }}>
                  <CheckCircle size={24} style={{ color: T.success }} />
                  <div>
                    <div className="font-bold" style={{ color: T.success }}>Tela conectada com sucesso!</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{screenId} · Online · Pronta para receber conteúdo</div>
                  </div>
                </div>
                <button onClick={() => next("content")}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                  Configurar conteúdo <ArrowRight size={18} />
                </button>
              </div>
            )}
            <button onClick={() => setStep("download")} className="w-full text-sm text-center py-2" style={{ color: T.textSub }}>
              ← Voltar para instalação do app
            </button>
          </div>
        )}

        {step === "content" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Configure seu conteúdo inicial</h2>
              <p style={{ color: T.textSub }}>Você pode alterar isso a qualquer momento no dashboard.</p>
            </div>
            <div className="space-y-3">
              {CONTENT_PACKS.map(cp => (
                <button key={cp.id} onClick={() => setContentPack(cp.id)}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all"
                  style={{ background: contentPack === cp.id ? cp.color + "12" : T.card, borderColor: contentPack === cp.id ? cp.color : T.border }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cp.color + "20" }}>
                    {cp.id === "canal" ? <Tv size={22} style={{ color: cp.color }} /> :
                     cp.id === "template" ? <Monitor size={22} style={{ color: cp.color }} /> :
                     <Upload size={22} style={{ color: cp.color }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold">{cp.label}</span>
                      {cp.free && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>Grátis</span>}
                    </div>
                    <div className="text-sm" style={{ color: T.textSub }}>{cp.desc}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: contentPack === cp.id ? cp.color : T.border, background: contentPack === cp.id ? cp.color : "transparent" }}>
                    {contentPack === cp.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-xl border p-4 flex items-center gap-3" style={{ background: T.panel, borderColor: T.border }}>
              <Shield size={16} style={{ color: T.success }} />
              <div className="text-sm">
                <span className="font-medium">ProofChain automático.</span>{" "}
                <span style={{ color: T.textSub }}>Cada exibição gera prova criptográfica — sem configuração necessária.</span>
              </div>
            </div>
            <button onClick={() => next("live")}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              Finalizar configuração <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === "live" && (
          <div className="space-y-6">
            {!isLive ? (
              <>
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">🚀</div>
                  <h2 className="text-3xl font-black mb-3">Tudo pronto!</h2>
                  <p className="text-lg" style={{ color: T.textSub }}>
                    Sua tela está configurada e pronta para ir ao vivo.
                  </p>
                </div>
                <div className="rounded-2xl border p-5 space-y-3" style={{ background: T.card, borderColor: T.border }}>
                  {[
                    { icon: Tv, label: "Tela", value: `${SCREEN_SIZES.find(s => s.id === size)?.label} · ${LOCATIONS.find(l => l.id === location)?.icon} ${LOCATIONS.find(l => l.id === location)?.label}`, color: T.primary },
                    { icon: Wifi, label: "Status", value: "Conectada · Online", color: T.success },
                    { icon: Play, label: "Conteúdo", value: CONTENT_PACKS.find(c => c.id === contentPack)?.label ?? "—", color: T.accent },
                    { icon: Shield, label: "ProofChain", value: "Ativo · 4 camadas · Score 100", color: T.success },
                    { icon: DollarSign, label: "Receita estimada", value: `R$${estimatedRevenue}/mês`, color: "#FFD700" },
                  ].map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <Icon size={16} style={{ color: r.color, flexShrink: 0 }} />
                        <span className="text-sm w-36 flex-shrink-0" style={{ color: T.textSub }}>{r.label}</span>
                        <span className="text-sm font-medium">{r.value}</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleGoLive} disabled={goingLive}
                  className="w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${T.success}, #00B86B)`, color: "#fff", boxShadow: `0 8px 32px ${T.success}40` }}>
                  {goingLive ? (
                    <><RefreshCw size={20} className="animate-spin" /> Ativando ao vivo...</>
                  ) : (
                    <><Zap size={20} /> IR AO VIVO AGORA</>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center space-y-8 py-4">
                <div>
                  <div className="text-7xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-4xl font-black mb-3" style={{ color: T.success }}>Você está ao vivo!</h2>
                  <p style={{ color: T.textSub }}>
                    Sua tela <strong className="text-white">{screenId}</strong> está transmitindo e já começa a gerar receita passiva.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Impressões/dia", value: "~1.200", color: T.primary },
                    { label: "Receita/mês", value: `R$${estimatedRevenue}`, color: T.success },
                    { label: "ProofChain", value: "100/100", color: "#FFD700" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border p-4 text-center" style={{ background: T.card, borderColor: T.border }}>
                      <div className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <button onClick={() => onComplete?.({ size: size!, location: location!, contentPack: contentPack! })}
                    className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                    <Tv size={18} /> Abrir meu Dashboard
                  </button>
                  <button onClick={onBack} className="w-full py-3 text-sm" style={{ color: T.textSub }}>
                    Voltar ao início
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
