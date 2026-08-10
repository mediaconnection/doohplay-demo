import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Tv, MapPin, Wifi, Settings,
  Upload, QrCode, Zap, Monitor, Smartphone, Sun, Building,
  Clock, AlertCircle, CheckCircle
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const STEPS = [
  { id: 1, label: "Tela",       icon: Tv       },
  { id: 2, label: "Localização",icon: MapPin   },
  { id: 3, label: "Conexão",    icon: Wifi     },
  { id: 4, label: "Confirmar",  icon: Check    },
];

const SCREEN_TYPES = [
  { id: "outdoor",  label: "Outdoor / Billboard",  icon: Sun,       desc: "Tela externa de grande formato",     sizes: ["14m²","32m²","48m²","72m²"], cpm: 55 },
  { id: "indoor",   label: "Indoor",               icon: Building,  desc: "Tela interna — escritório, lobby",   sizes: ['32"','43"','55"','65"'],      cpm: 42 },
  { id: "transit",  label: "Trânsito",              icon: Smartphone,desc: "Metrô, ônibus, estação",             sizes: ['32"','43"','55"'],             cpm: 35 },
  { id: "retail",   label: "Varejo / Retail",       icon: Monitor,   desc: "PDV, shopping, supermercado",       sizes: ['27"','32"','43"','55"'],        cpm: 38 },
  { id: "airport",  label: "Aeroporto",             icon: Zap,       desc: "Terminal de embarque ou check-in",  sizes: ['43"','55"','65"','75"'],        cpm: 84 },
];

const CITIES = ["São Paulo","Rio de Janeiro","Belo Horizonte","Brasília","Porto Alegre","Curitiba","Salvador","Recife","Fortaleza","Manaus","Belém","Goiânia","Campinas","Guarulhos"];

export default function ScreenOnboarding({ onBack }: Props) {
  const [step, setStep]         = useState(1);
  const [screenType, setScreenType] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [screenName, setScreenName] = useState("");
  const [city, setCity]         = useState("");
  const [address, setAddress]   = useState("");
  const [lat, setLat]           = useState("");
  const [lng, setLng]           = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [deviceId]              = useState(`DOOH-${Math.random().toString(36).substr(2,8).toUpperCase()}`);
  const [testPassed, setTestPassed]   = useState<boolean | null>(null);
  const [testing, setTesting]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const selectedType = SCREEN_TYPES.find(s => s.id === screenType);

  const canNext = () => {
    if (step === 1) return !!screenType && !!screenSize && !!screenName;
    if (step === 2) return !!city && !!address;
    if (step === 3) return !!connectionType && testPassed === true;
    return true;
  };

  const runTest = () => {
    setTesting(true);
    setTestPassed(null);
    setTimeout(() => {
      setTesting(false);
      setTestPassed(Math.random() > 0.15);
    }, 2200);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="text-center max-w-lg px-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            style={{ background: T.success + "15", border: `2px solid ${T.success}30` }}>
            <Tv size={40} style={{ color: T.success }} />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: T.success }}>
              <Check size={12} style={{ color: "#000" }} />
            </span>
          </div>
          <h2 className="font-black text-2xl mb-2" style={{ color: T.text }}>Tela Cadastrada!</h2>
          <p className="mb-1" style={{ color: T.textSub }}>
            <strong style={{ color: T.text }}>{screenName}</strong> foi adicionada à rede DOOHPLAY.
          </p>
          <p className="text-sm mb-6" style={{ color: T.textSub }}>O player Android será baixado automaticamente e a tela estará online em até 5 minutos.</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "ID da Tela",  value: deviceId,         color: T.primary },
              { label: "Tipo",        value: selectedType?.label.split(" ")[0] || "", color: T.accent  },
              { label: "CPM base",    value: `R$${selectedType?.cpm}`,               color: T.gold    },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: T.card }}>
                <div className="font-black text-sm" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl mb-6" style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: T.panel }}>
              <QrCode size={32} style={{ color: T.primary }} />
            </div>
            <div className="text-left">
              <div className="font-black text-sm mb-0.5">QR Code de ativação</div>
              <div className="text-xs" style={{ color: T.textSub }}>Escaneie com o dispositivo Android para instalar o player DOOHPLAY automaticamente</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={onBack} className="px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: T.primary, color: "#fff" }}>
              Ver Device Manager
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setScreenType(""); setScreenSize(""); setScreenName(""); setCity(""); setAddress(""); setConnectionType(""); setTestPassed(null); }}
              className="px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
              Cadastrar outra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Tv size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Cadastrar Nova Tela</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Passo {step} de 4</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const done = step > s.id; const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                    style={{ background: active ? T.success + "20" : done ? T.success + "15" : "transparent" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: done ? T.success : active ? T.success : T.border, color: "#fff" }}>
                      {done ? <Check size={10} /> : s.id}
                    </div>
                    <span className="text-xs font-bold hidden sm:block"
                      style={{ color: active ? T.success : done ? T.success : T.textSub }}>{s.label}</span>
                  </div>
                  {i < 3 && <div className="w-3 h-px mx-0.5" style={{ background: T.border }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {step === 1 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Que tipo de tela você está cadastrando?</h2>
            <p className="mb-6" style={{ color: T.textSub }}>O tipo define o CPM base e os formatos disponíveis.</p>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {SCREEN_TYPES.map(st => (
                <button key={st.id} onClick={() => { setScreenType(st.id); setScreenSize(""); }}
                  className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                  style={{ background: screenType === st.id ? T.success + "10" : T.card, borderColor: screenType === st.id ? T.success + "50" : T.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: screenType === st.id ? T.success + "20" : T.panel }}>
                    <st.icon size={18} style={{ color: screenType === st.id ? T.success : T.textSub }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black" style={{ color: T.text }}>{st.label}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{st.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm" style={{ color: T.gold }}>R${st.cpm}/mil</div>
                    <div className="text-xs" style={{ color: T.textSub }}>CPM base</div>
                  </div>
                  {screenType === st.id && <Check size={16} style={{ color: T.success }} />}
                </button>
              ))}
            </div>
            {selectedType && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>TAMANHO DA TELA</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.sizes.map(s => (
                      <button key={s} onClick={() => setScreenSize(s)}
                        className="px-4 py-2 rounded-xl text-sm font-black transition-all"
                        style={{ background: screenSize === s ? T.success + "20" : T.panel, color: screenSize === s ? T.success : T.textSub, border: `1px solid ${screenSize === s ? T.success + "50" : T.border}` }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>NOME DA TELA</label>
                  <input value={screenName} onChange={e => setScreenName(e.target.value)}
                    placeholder={`Ex: ${selectedType.label} — Av. Paulista`}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Onde está a tela?</h2>
            <p className="mb-6" style={{ color: T.textSub }}>A localização é usada para segmentação geográfica e cálculo de audiência.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>CIDADE</label>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: city ? T.text : T.textSub }}>
                    <option value="">Selecionar cidade</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>BAIRRO / REGIÃO</label>
                  <input placeholder="Ex: Itaim Bibi, Centro, Barra"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>ENDEREÇO COMPLETO</label>
                <input value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1374 — frente ao MASP"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>LATITUDE (opcional)</label>
                  <input value={lat} onChange={e => setLat(e.target.value)} placeholder="-23.5615"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>LONGITUDE (opcional)</label>
                  <input value={lng} onChange={e => setLng(e.target.value)} placeholder="-46.6558"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              </div>
              <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: T.primary + "10", border: `1px solid ${T.primary}20` }}>
                <MapPin size={16} style={{ color: T.primary }} />
                <p className="text-xs" style={{ color: T.textSub }}>
                  A localização GPS precisa aumenta a precisão de audiência em até <strong style={{ color: T.text }}>40%</strong> e melhora o CPM base da tela.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Configure a conexão</h2>
            <p className="mb-6" style={{ color: T.textSub }}>O player Android precisa de internet para receber conteúdo e enviar provas de exibição.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>TIPO DE CONEXÃO</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "wifi",     label: "Wi-Fi",     icon: Wifi    },
                    { id: "ethernet", label: "Ethernet",  icon: Settings },
                    { id: "4g",       label: "4G/5G",     icon: Zap     },
                  ].map(ct => (
                    <button key={ct.id} onClick={() => setConnectionType(ct.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                      style={{ background: connectionType === ct.id ? T.primary + "15" : T.card, borderColor: connectionType === ct.id ? T.primary + "50" : T.border }}>
                      <ct.icon size={20} style={{ color: connectionType === ct.id ? T.primary : T.textSub }} />
                      <span className="text-sm font-bold" style={{ color: connectionType === ct.id ? T.text : T.textSub }}>{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {connectionType === "wifi" && (
                <div>
                  <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>NOME DA REDE (SSID)</label>
                  <input value={networkName} onChange={e => setNetworkName(e.target.value)}
                    placeholder="MinhaRede-DOOH"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              )}
              {connectionType && (
                <div className="p-4 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-black text-sm">Teste de conectividade</div>
                    <div className="font-mono text-xs" style={{ color: T.textSub }}>{deviceId}</div>
                  </div>
                  {testPassed === null && !testing && (
                    <button onClick={runTest}
                      className="w-full py-2.5 rounded-xl text-sm font-black"
                      style={{ background: T.primary + "20", color: T.primary }}>
                      Iniciar Teste de Conexão
                    </button>
                  )}
                  {testing && (
                    <div className="space-y-2">
                      {["Verificando DNS…","Conectando ao servidor DOOHPLAY…","Testando latência…"].map((msg, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                          <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.primary }} />
                          {msg}
                        </div>
                      ))}
                    </div>
                  )}
                  {testPassed === true && (
                    <div className="space-y-2">
                      {["DNS OK · 12ms","Servidor DOOHPLAY · 28ms","Latência média · 23ms"].map((msg, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: T.success }}>
                          <CheckCircle size={12} /> {msg}
                        </div>
                      ))}
                    </div>
                  )}
                  {testPassed === false && (
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: T.danger }}>
                        <AlertCircle size={12} /> Falha na conexão. Verifique a rede e tente novamente.
                      </div>
                      <button onClick={runTest} className="w-full py-2 rounded-xl text-sm font-bold"
                        style={{ background: T.danger + "20", color: T.danger }}>
                        Tentar novamente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-black text-2xl mb-1">Confirmar cadastro</h2>
            <p className="mb-6" style={{ color: T.textSub }}>Revise os dados antes de adicionar a tela à rede.</p>
            <div className="space-y-3">
              {[
                { label: "Nome da tela",   value: screenName,           color: T.text    },
                { label: "Tipo",           value: selectedType?.label || "", color: T.accent  },
                { label: "Tamanho",        value: screenSize,           color: T.primary },
                { label: "CPM base",       value: `R$${selectedType?.cpm}/mil`, color: T.gold    },
                { label: "Cidade",         value: city,                 color: T.success },
                { label: "Endereço",       value: address,              color: T.text    },
                { label: "Conexão",        value: connectionType.toUpperCase(), color: T.primary },
                { label: "Device ID",      value: deviceId,             color: T.textSub },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: T.border }}>
                  <span className="text-sm" style={{ color: T.textSub }}>{row.label}</span>
                  <span className="font-black text-sm" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl flex gap-3" style={{ background: T.success + "10", border: `1px solid ${T.success}25` }}>
              <CheckCircle size={16} style={{ color: T.success }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: T.textSub }}>
                Ao confirmar, o player Android será configurado automaticamente via QR code e a tela estará disponível para campanhas em até <strong style={{ color: T.text }}>5 minutos</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: T.border }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onBack()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
            style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
            <ArrowLeft size={14} /> {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <button onClick={() => step < 4 ? setStep(s => s + 1) : setSubmitted(true)}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all"
            style={{ background: canNext() ? T.success : T.border, color: canNext() ? "#000" : T.textSub, cursor: canNext() ? "pointer" : "not-allowed" }}>
            {step === 4 ? "Cadastrar Tela" : "Próximo"}
            {step < 4 ? <ArrowRight size={14} /> : <Check size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
