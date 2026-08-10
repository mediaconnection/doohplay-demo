import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Play, Pause, Shuffle, Tv, Image, Video, Layers, ChevronRight, Plus, X, BarChart2, Clock, Wifi, LayoutGrid, Music, CloudLightning, DollarSign } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  text: "#ECF0FF", textSub: "#4A5280",
};

const CHANNELS = [
  { id: "restaurantes", name: "Restaurantes & Food", icon: "🍽️", count: 8, color: "#FF6B35" },
  { id: "varejo", name: "Varejo & Promoções", icon: "🛍️", count: 12, color: T.primary },
  { id: "saude", name: "Saúde & Bem-estar", icon: "🏥", count: 6, color: T.success },
  { id: "educacao", name: "Educação", icon: "📚", count: 5, color: "#9B59B6" },
  { id: "corporativo", name: "Corporativo", icon: "🏢", count: 9, color: T.warning },
  { id: "entretenimento", name: "Entretenimento", icon: "🎭", count: 11, color: T.accent },
  { id: "noticias", name: "Jornalismo & Notícias", icon: "📰", count: 4, color: "#ECF0FF" },
  { id: "casa", name: "Casa & Serviços", icon: "🏠", count: 7, color: "#1ABC9C" },
  { id: "automotivo", name: "Automotivo", icon: "🚗", count: 5, color: "#E74C3C" },
  { id: "financeiro", name: "Financeiro", icon: "💰", count: 6, color: T.success },
  { id: "moda", name: "Moda & Beleza", icon: "👗", count: 8, color: "#E91E63" },
  { id: "turismo", name: "Turismo & Lazer", icon: "✈️", count: 7, color: "#00BCD4" },
];

const WEIGHTS = [
  { label: "Anunciante", pct: 60, color: T.primary, desc: "Campanhas pagas com sorteio ponderado por CPM" },
  { label: "Canal DOOHPLAY", pct: 20, color: T.accent, desc: "Conteúdo institucional dos 12 canais segmentados" },
  { label: "Dono da tela", pct: 15, color: T.success, desc: "Conteúdo próprio do estabelecimento" },
  { label: "Institucional", pct: 5, color: T.warning, desc: "Mensagens do sistema, avisos, promoções DOOHPLAY" },
];

const FORMATS = [
  { id: "fullscreen", name: "Tela cheia", icon: "⬛", desc: "Ocupa toda a tela, máximo impacto" },
  { id: "lateral", name: "Lateral", icon: "▌", desc: "Faixa vertical à esquerda ou direita (30% da tela)" },
  { id: "bottom", name: "Faixa inferior", icon: "▬", desc: "Banner horizontal na parte inferior" },
  { id: "floating", name: "Flutuante", icon: "◈", desc: "Overlay animado sobre o conteúdo principal" },
];

const WIDGETS = [
  { id: "weather", name: "Clima detalhado", icon: "⛅", active: true },
  { id: "exchange", name: "Câmbio (USD/EUR)", icon: "💱", active: true },
  { id: "economics", name: "Indicadores econômicos", icon: "📈", active: false },
  { id: "air", name: "Qualidade do ar", icon: "🌬️", active: false },
  { id: "lottery", name: "Loteria", icon: "🎲", active: false },
  { id: "music", name: "Programação musical", icon: "🎵", active: false },
];

const AI_PROMPTS = [
  "Promoção de fim de semana com cores vibrantes",
  "Campanha institucional elegante para corporativo",
  "Oferta relâmpago com senso de urgência",
  "Cardápio do dia com foto de produto",
  "Promoção de aniversário festiva",
];

interface Props { onBack: () => void; }

export default function ContentStudio({ onBack }: Props) {
  const [tab, setTab] = useState<"lottery" | "channels" | "formats" | "widgets" | "ai">("lottery");
  const [playing, setPlaying] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [activeChannels, setActiveChannels] = useState<string[]>(["restaurantes", "varejo", "saude"]);
  const [widgetState, setWidgetState] = useState(WIDGETS.map(w => ({ ...w })));
  const [widgetPosition, setWidgetPosition] = useState<"right" | "left" | "bottom">("right");
  const [selectedFormat, setSelectedFormat] = useState("fullscreen");
  const [weatherData] = useState({ temp: 24, city: "São Paulo", cond: "Parcialmente nublado", humidity: 68 });
  const [exchangeData] = useState({ usd: 5.42, eur: 5.87, btc: 312840 });

  const SLOTS = [
    { type: "Anunciante", label: "Campanha Verão 2026", duration: "30s", color: T.primary },
    { type: "Canal DOOHPLAY", label: "Canal Restaurantes", duration: "15s", color: T.accent },
    { type: "Dono da tela", label: "Promoção da Casa", duration: "20s", color: T.success },
    { type: "Anunciante", label: "Spot Auto Finance", duration: "30s", color: T.primary },
    { type: "Canal DOOHPLAY", label: "Canal Varejo", duration: "15s", color: T.accent },
    { type: "Institucional", label: "DOOHPLAY Network", duration: "10s", color: T.warning },
  ];

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setCurrentSlot(s => (s + 1) % SLOTS.length), 2000);
    return () => clearInterval(iv);
  }, [playing]);

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiResult(null);
    setTimeout(() => {
      setAiGenerating(false);
      setAiResult("https://images.unsplash.com/photo-1542038374803-82bffca72ad2?w=600&h=400&fit=crop&auto=format");
    }, 2500);
  };

  const toggleChannel = (id: string) => {
    setActiveChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleWidget = (idx: number) => {
    setWidgetState(prev => prev.map((w, i) => i === idx ? { ...w, active: !w.active } : w));
  };

  const TABS = [
    { id: "lottery", label: "Sorteio Ponderado", icon: Shuffle },
    { id: "channels", label: "Canal DOOHPLAY", icon: Tv },
    { id: "formats", label: "Formatos de Anúlcio", icon: LayoutGrid },
    { id: "widgets", label: "Widgets", icon: Layers },
    { id: "ai", label: "IA Generativa", icon: Sparkles },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: T.accent }} />
            <span className="font-bold">Content Studio</span>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.accent + "40", color: T.accent }}>
            Gemini 3.1 Flash Image
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: tab === t.id ? T.primary : T.card,
                  color: tab === t.id ? "#fff" : T.textSub,
                  border: `1px solid ${tab === t.id ? T.primary : T.border}`,
                }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "lottery" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-xl mb-2">Sistema de sorteio ponderado</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: T.textSub }}>
                Cada slot de exibição é sorteado aleatoriamente com pesos configurados. Anunciantes com CPM mais alto têm maior probabilidade de exibição.
              </p>
              <div className="space-y-3 mb-8">
                {WEIGHTS.map(w => (
                  <div key={w.label} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{w.label}</span>
                      <span className="text-2xl font-black" style={{ color: w.color }}>{w.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full mb-2" style={{ background: T.border }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${w.pct}%`, background: w.color }} />
                    </div>
                    <p className="text-xs" style={{ color: T.textSub }}>{w.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total ponderado</span>
                  <span style={{ color: T.success }}>100%</span>
                </div>
                <p className="text-xs" style={{ color: T.textSub }}>
                  + Formatos extras (lateral, faixa, flutuante) exibidos fora desse sorteio — não competem pelos slots principais.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: T.textSub }}>Simulador de playlist</h3>
              <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="aspect-video relative flex items-center justify-center" style={{ background: "#000" }}>
                  <img src="https://images.unsplash.com/photo-1542038374803-82bffca72ad2?w=600&h=400&fit=crop&auto=format" alt="preview" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs mb-1 px-2 py-0.5 rounded-full inline-block" style={{ background: SLOTS[currentSlot].color + "30", color: SLOTS[currentSlot].color }}>
                        {SLOTS[currentSlot].type}
                      </div>
                      <div className="font-bold text-white text-lg">{SLOTS[currentSlot].label}</div>
                      <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{SLOTS[currentSlot].duration}</div>
                    </div>
                  </div>
                  <div className={`absolute ${widgetPosition === "right" ? "right-2 top-2 bottom-2 w-24 flex flex-col gap-1" : widgetPosition === "left" ? "left-2 top-2 bottom-2 w-24 flex flex-col gap-1" : "bottom-2 left-2 right-2 h-10 flex gap-2"}`}>
                    {widgetState.filter(w => w.active).slice(0, 2).map((w) => (
                      <div key={w.id} className="rounded text-xs flex items-center gap-1 px-2 py-1" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                        <span>{w.icon}</span>
                        {w.id === "weather" && <span>{weatherData.temp}°C</span>}
                        {w.id === "exchange" && <span>USD {exchangeData.usd}</span>}
                        {w.id !== "weather" && w.id !== "exchange" && <span>{w.name.slice(0, 6)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4 border-t" style={{ borderColor: T.border }}>
                  <button onClick={() => setPlaying(p => !p)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.primary }}>
                    {playing ? <Pause size={14} color="#fff" /> : <Play size={14} color="#fff" />}
                  </button>
                  <div className="flex-1 flex gap-1">
                    {SLOTS.map((s, i) => (
                      <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i === currentSlot ? s.color : T.border }} />
                    ))}
                  </div>
                  <span className="text-xs font-mono" style={{ color: T.textSub }}>{currentSlot + 1}/{SLOTS.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                {SLOTS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    style={{ background: i === currentSlot ? s.color + "10" : T.card, borderColor: i === currentSlot ? s.color + "40" : T.border }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{s.label}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{s.type}</div>
                    </div>
                    <span className="text-xs font-mono" style={{ color: T.textSub }}>{s.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "channels" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-xl mb-1">Canal DOOHPLAY</h2>
                <p className="text-sm" style={{ color: T.textSub }}>12 canais segmentados por tipo de negócio — {activeChannels.length} ativos</p>
              </div>
              <div className="text-sm px-3 py-1.5 rounded-xl border" style={{ borderColor: T.border, color: T.textSub }}>Ocupa 20% da playlist</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CHANNELS.map(ch => {
                const isActive = activeChannels.includes(ch.id);
                return (
                  <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                    className="rounded-xl border p-5 text-left transition-all hover:opacity-90"
                    style={{ background: isActive ? ch.color + "15" : T.card, borderColor: isActive ? ch.color + "50" : T.border }}>
                    <div className="text-2xl mb-3">{ch.icon}</div>
                    <div className="font-medium text-sm mb-1">{ch.name}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{ch.count} peças</div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 flex items-center justify-center" style={{ borderColor: isActive ? ch.color : T.textSub }}>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: ch.color }} />}
                      </div>
                      <span className="text-xs" style={{ color: isActive ? ch.color : T.textSub }}>{isActive ? "Ativo" : "Inativo"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "formats" && (
          <div>
            <div className="mb-6">
              <h2 className="font-bold text-xl mb-1">Formatos de anúncio</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Formatos extras são exibidos em sobreposição — não competem com o sorteio principal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setSelectedFormat(f.id)}
                  className="rounded-2xl border p-6 text-left transition-all hover:opacity-90"
                  style={{ background: selectedFormat === f.id ? T.primary + "15" : T.card, borderColor: selectedFormat === f.id ? T.primary + "50" : T.border }}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{f.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{f.name}</div>
                      <div className="text-sm" style={{ color: T.textSub }}>{f.desc}</div>
                    </div>
                    {selectedFormat === f.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: T.primary }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video relative" style={{ background: "#000" }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                      <span className="text-xs" style={{ color: T.textSub }}>Conteúdo principal</span>
                    </div>
                    {f.id === "lateral" && (
                      <div className="absolute top-0 left-0 bottom-0 w-1/4 flex items-center justify-center" style={{ background: T.primary + "90" }}>
                        <span className="text-xs text-white">Anúncio</span>
                      </div>
                    )}
                    {f.id === "bottom" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1/4 flex items-center justify-center" style={{ background: T.accent + "90" }}>
                        <span className="text-xs text-white">Faixa inferior</span>
                      </div>
                    )}
                    {f.id === "floating" && (
                      <div className="absolute right-2 top-2 rounded-lg px-2 py-1 text-xs" style={{ background: T.warning + "E0", color: "#000", fontWeight: "bold" }}>
                        ⚡ Oferta
                      </div>
                    )}
                    {f.id === "fullscreen" && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: T.success + "20" }}>
                        <span className="text-xs" style={{ color: T.success }}>Tela cheia ativo</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "widgets" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-xl mb-2">Painel de widgets</h2>
              <p className="text-sm mb-6" style={{ color: T.textSub }}>Configure dados em tempo real exibidos na tela</p>
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block" style={{ color: T.textSub }}>Posição do painel</label>
                <div className="flex gap-2">
                  {(["right", "left", "bottom"] as const).map(p => (
                    <button key={p} onClick={() => setWidgetPosition(p)}
                      className="px-4 py-2 rounded-xl text-sm border transition-all"
                      style={{ background: widgetPosition === p ? T.primary : T.card, borderColor: widgetPosition === p ? T.primary : T.border, color: widgetPosition === p ? "#fff" : T.textSub }}>
                      {p === "right" ? "Direita" : p === "left" ? "Esquerda" : "Embaixo"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {widgetState.map((w, i) => (
                  <div key={w.id} className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                    style={{ background: w.active ? T.card : T.panel, borderColor: w.active ? T.primary + "30" : T.border }}>
                    <span className="text-2xl">{w.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{w.name}</div>
                      {w.id === "weather" && w.active && (
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{weatherData.city} · {weatherData.temp}°C · {weatherData.cond}</div>
                      )}
                      {w.id === "exchange" && w.active && (
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>USD R${exchangeData.usd} · EUR R${exchangeData.eur}</div>
                      )}
                    </div>
                    <button onClick={() => toggleWidget(i)}
                      className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                      style={{ background: w.active ? T.success : T.border }}>
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: w.active ? "calc(100% - 20px)" : "4px" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: T.textSub }}>Preview da tela</h3>
              <div className="rounded-2xl overflow-hidden aspect-video relative" style={{ background: "#000" }}>
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&auto=format" alt="preview" className="w-full h-full object-cover opacity-50" />
                <div className={`absolute flex gap-2 ${widgetPosition === "right" ? "right-3 top-3 bottom-3 flex-col w-28" : widgetPosition === "left" ? "left-3 top-3 bottom-3 flex-col w-28" : "bottom-3 left-3 right-3 h-14 flex-row"}`}>
                  {widgetState.filter(w => w.active).slice(0, 4).map((w) => (
                    <div key={w.id} className={`rounded-xl p-2 ${widgetPosition === "bottom" ? "flex-1" : ""}`} style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: `1px solid rgba(255,255,255,0.1)` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{w.icon}</span>
                        <span className="text-xs text-white font-medium truncate">{w.name.split(" ")[0]}</span>
                      </div>
                      {w.id === "weather" && <div className="text-lg font-black text-white">{weatherData.temp}°C</div>}
                      {w.id === "exchange" && <div className="text-xs text-white">R${exchangeData.usd}</div>}
                      {w.id !== "weather" && w.id !== "exchange" && <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Ao vivo</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-xl mb-2">Geração de imagem por IA</h2>
              <p className="text-sm mb-6" style={{ color: T.textSub }}>Powered by Gemini 3.1 Flash Image. Descreva o conteúdo e a IA cria uma peça profissional otimizada para DOOH.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AI_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => setAiPrompt(p)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-90"
                    style={{ background: T.card, borderColor: T.border, color: T.textSub }}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="relative mb-4">
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Descreva a peça que quer criar..."
                  rows={4} className="w-full rounded-xl border p-4 text-sm resize-none outline-none transition-colors"
                  style={{ background: T.card, borderColor: T.border, color: T.text }} />
              </div>
              <button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                {aiGenerating ? <><CloudLightning size={16} className="animate-pulse" /> Gerando com Gemini 3.1...</> : <><Sparkles size={16} /> Gerar com IA</>}
              </button>
              <div className="mt-6 space-y-3">
                {[
                  { plan: "Starter", credits: 30, used: 12, color: T.success },
                  { plan: "Pro", credits: 150, used: 67, color: T.primary },
                  { plan: "Business", credits: 500, used: 203, color: T.warning },
                ].map((p) => (
                  <div key={p.plan} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium">{p.plan}</span>
                      <span style={{ color: T.textSub }}>{p.used}/{p.credits} gerações</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full" style={{ width: `${(p.used / p.credits) * 100}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: T.textSub }}>Preview da geração</h3>
              <div className="rounded-2xl border overflow-hidden aspect-video relative" style={{ background: T.card, borderColor: T.border }}>
                {aiGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: T.panel }}>
                    <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4" style={{ borderColor: T.accent + "40", borderTopColor: T.accent }} />
                    <div className="text-sm font-medium">Gerando com Gemini 3.1 Flash Image...</div>
                    <div className="text-xs mt-1" style={{ color: T.textSub }}>Otimizando para formato DOOH</div>
                  </div>
                )}
                {aiResult && !aiGenerating && (
                  <><img src={aiResult} alt="AI generated" className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: T.success + "E0", color: "#000" }}>✓ Gerado com IA</div>
                  </>
                )}
                {!aiResult && !aiGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Sparkles size={32} className="mb-3 opacity-30" style={{ color: T.accent }} />
                    <div className="text-sm" style={{ color: T.textSub }}>Digite um prompt e gere</div>
                  </div>
                )}
              </div>
              {aiResult && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="py-3 rounded-xl font-medium text-sm border transition-all hover:opacity-90" style={{ background: T.primary, color: "#fff", border: "none" }}>Usar na playlist</button>
                  <button className="py-3 rounded-xl font-medium text-sm border transition-all hover:opacity-90" style={{ background: T.card, borderColor: T.border, color: T.textSub }}>Regenerar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
