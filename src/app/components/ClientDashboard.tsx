import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Tv, Play, Pause, Plus, Trash2, Eye, Shield, DollarSign, Zap, Clock, BarChart2, CheckCircle, RefreshCw, Smartphone, Settings, Bell, ChevronRight, Image, Video, Music, Layers, Star, Users, Crown, Package, FileText, Sparkles, Calendar, Monitor, TrendingUp, BookOpen, Activity } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

function randHex(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const PLAN_COLORS: Record<string, string> = { starter: T.success, pro: T.primary, business: "#FFD700" };
const PLAN_SCREEN_LIMIT: Record<string, number> = { starter: 1, pro: 5, business: 20 };
const PLAN_AI_LIMIT: Record<string, number> = { starter: 30, pro: 150, business: 500 };

const CONTENT_ITEMS = [
  { id: 1, name: "Promoção do Dia", type: "image", duration: 15, active: true, img: "photo-1542038374803-82bffca72ad2" },
  { id: 2, name: "Cardápio Executivo", type: "image", duration: 20, active: true, img: "photo-1414235077428-338989a2e8c0" },
  { id: 3, name: "Institucional DOOHPLAY", type: "video", duration: 30, active: true, img: "photo-1497366216548-37526070297c" },
  { id: 4, name: "Clima & Notícias", type: "widget", duration: 10, active: false, img: "photo-1504711434969-e33886168f5c" },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  session?: { name?: string; plan?: string; phone?: string; businessType?: string } | null;
  screens?: { id: string; name: string; status: string }[];
  aiQuota?: { used: number; limit: number; remaining: number } | null;
  onUpgrade?: (plan: string) => void;
}

export default function ClientDashboard({ onBack, onNavigate, session, screens = [], aiQuota, onUpgrade }: Props) {
  const [tab, setTab] = useState<"home" | "content" | "proofs" | "revenue" | "settings">("home");
  const [playing, setPlaying] = useState(true);
  const [currentContent, setCurrentContent] = useState(0);
  const [proofs, setProofs] = useState(() => Array.from({ length: 8 }, (_, i) => ({
    id: `POP-${randHex(8).toUpperCase()}`,
    content: CONTENT_ITEMS[i % CONTENT_ITEMS.length].name,
    timestamp: new Date(Date.now() - i * 180000).toLocaleTimeString("pt-BR"),
    duration: CONTENT_ITEMS[i % CONTENT_ITEMS.length].duration,
    hash: "0x" + randHex(16),
    score: 100,
  })));
  const [liveImpressions, setLiveImpressions] = useState(1284);
  const [liveRevenue, setLiveRevenue] = useState(487.60);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const plan = session?.plan ?? "starter";
  const screenLimit = PLAN_SCREEN_LIMIT[plan];
  const aiLimit = PLAN_AI_LIMIT[plan];
  const aiUsed = aiQuota?.used ?? 0;
  const aiRemaining = aiQuota?.remaining ?? aiLimit;

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setCurrentContent(c => (c + 1) % CONTENT_ITEMS.filter(i => i.active).length);
    }, 3000);
    return () => clearInterval(iv);
  }, [playing]);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveImpressions(v => v + Math.floor(Math.random() * 3) + 1);
      setLiveRevenue(v => +(v + Math.random() * 0.15).toFixed(2));
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      const active = CONTENT_ITEMS.filter(i => i.active);
      const item = active[currentContent % active.length];
      setProofs(prev => [{
        id: `POP-${randHex(8).toUpperCase()}`,
        content: item?.name ?? "Conteúdo",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        duration: item?.duration ?? 15,
        hash: "0x" + randHex(16),
        score: 100,
      }, ...prev.slice(0, 19)]);
    }, 8000);
    return () => clearInterval(iv);
  }, [playing, currentContent]);

  const handleAiGenerate = () => {
    if (!aiPrompt.trim() || aiRemaining <= 0) return;
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiResult("photo-1542038374803-82bffca72ad2");
    }, 2200);
  };

  const activeContents = CONTENT_ITEMS.filter(i => i.active);
  const currentItem = activeContents[currentContent % activeContents.length];

  const TABS = [
    { id: "home", label: "Início", icon: Tv },
    { id: "content", label: "Conteúdo", icon: Layers },
    { id: "proofs", label: "Provas", icon: Shield },
    { id: "revenue", label: "Receita", icon: DollarSign },
    { id: "settings", label: "Config", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.primary }}>
              <Tv size={13} color="#fff" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{session?.name ?? "Minha tela"}</div>
              <div className="text-xs leading-tight" style={{ color: PLAN_COLORS[plan] }}>Plano {plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: playing ? T.success : T.textSub }} />
            <Bell size={18} style={{ color: T.textSub }} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        {tab === "home" && (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: T.border }}>
              <div className="aspect-video relative" style={{ background: "#000" }}>
                {currentItem && (
                  <img
                    src={`https://images.unsplash.com/${currentItem.img}?w=600&h=340&fit=crop&auto=format`}
                    alt={currentItem.name}
                    className="w-full h-full object-cover transition-opacity"
                    style={{ opacity: playing ? 0.85 : 0.4 }}
                  />
                )}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)", color: playing ? T.success : T.textSub }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: playing ? T.success : T.textSub }} />
                      {playing ? "AO VIVO" : "PAUSADO"}
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                      {screens[0]?.name ?? "Tela Principal"}
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg drop-shadow-lg">{currentItem?.name ?? "—"}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{currentItem?.duration}s · {currentItem?.type}</div>
                  </div>
                </div>
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                    {playing ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
                  </div>
                </button>
              </div>
              <div className="p-3 flex items-center gap-2" style={{ background: T.card }}>
                {activeContents.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i === currentContent % activeContents.length ? T.primary : T.border }} />
                ))}
                <button onClick={() => setPlaying(p => !p)} className="ml-2 p-1.5 rounded-lg" style={{ background: T.panel }}>
                  {playing ? <Pause size={12} style={{ color: T.textSub }} /> : <Play size={12} style={{ color: T.textSub }} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Impressões hoje", value: liveImpressions.toLocaleString("pt-BR"), color: T.primary, icon: Eye },
                { label: "Receita hoje", value: `R$${liveRevenue.toFixed(2)}`, color: T.success, icon: DollarSign },
                { label: "Provas emitidas", value: proofs.length, color: T.accent, icon: Shield },
                { label: "Uptime", value: "99,8%", color: T.warning, icon: Zap },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: T.textSub }}>{m.label}</span>
                      <Icon size={14} style={{ color: m.color }} />
                    </div>
                    <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                  </div>
                );
              })}
            </div>

            {proofs[0] && (
              <div className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.success + "30" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} style={{ color: T.success }} />
                  <span className="text-sm font-medium">Última prova de exibição</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>100/100</span>
                </div>
                <div className="font-mono text-xs space-y-1" style={{ color: T.textSub }}>
                  <div><span style={{ color: T.text }}>ID:</span> {proofs[0].id}</div>
                  <div><span style={{ color: T.text }}>Conteúdo:</span> {proofs[0].content}</div>
                  <div><span style={{ color: T.text }}>Hash:</span> {proofs[0].hash}…</div>
                  <div><span style={{ color: T.text }}>Horário:</span> {proofs[0].timestamp}</div>
                </div>
              </div>
            )}

            <div className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gerações de IA este mês</span>
                <span className="text-sm font-bold" style={{ color: aiRemaining > 5 ? T.primary : T.danger }}>
                  {aiRemaining} restantes
                </span>
              </div>
              <div className="h-2 rounded-full mb-2" style={{ background: T.border }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${(aiUsed / aiLimit) * 100}%`,
                  background: aiUsed / aiLimit > 0.8 ? T.danger : T.primary,
                }} />
              </div>
              <div className="text-xs" style={{ color: T.textSub }}>{aiUsed}/{aiLimit} gerações · plano {plan}</div>
              {plan === "starter" && (
                <button onClick={() => onUpgrade?.("pro")} className="mt-3 w-full py-2 rounded-xl text-xs font-medium" style={{ background: T.primary + "20", color: T.primary }}>
                  Upgrade para Pro — 150 gerações/mês
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "DOOH AI", desc: "Assistente inteligente", view: "ai-assistant", color: T.accent, icon: Zap },
                { label: "Analytics", desc: "Ver relatórios detalhados", view: "analytics-dashboard", color: T.primary, icon: BarChart2 },
                { label: "Calendário", desc: "Agendar conteúdo", view: "content-calendar", color: T.accent, icon: Clock },
                { label: "Dispositivos", desc: "Saúde das telas", view: "device-manager", color: T.warning, icon: Tv },
                { label: "Otimizar", desc: "Aumentar receita", view: "revenue-optimizer", color: T.success, icon: Zap },
                { label: "Assinatura", desc: "Plano e faturas", view: "billing", color: "#FFD700", icon: Star },
                { label: "Suporte", desc: "Ajuda e tutoriais", view: "support", color: "#4FC3F7", icon: Layers },
                { label: "Início Rápido", desc: "Guia de configuração", view: "onboarding-checklist", color: T.success, icon: CheckCircle },
                { label: "Indicações", desc: "Ganhe R$50 por indicação", view: "referral", color: "#FFD700", icon: Users },
                { label: "Metas", desc: "Acompanhar objetivos", view: "goals", color: T.accent, icon: DollarSign },
                { label: "Marketplace", desc: "Vitrine para anunciantes", view: "marketplace", color: T.primary, icon: Eye },
                { label: "Playlist", desc: "Editar conteúdo ao vivo", view: "playlist", color: T.warning, icon: Play },
                { label: "Ranking", desc: "Sua posição na rede", view: "leaderboard", color: "#FFD700", icon: Crown },
                { label: "Inventário", desc: "Horários e preços", view: "inventory", color: T.accent, icon: Package },
                { label: "Contratos", desc: "Contratos com anunciantes", view: "contracts", color: T.primary, icon: FileText },
                { label: "Templates", desc: "Criativos prontos c/IA", view: "creative-templates", color: T.accent, icon: Sparkles },
                { label: "Datas", desc: "Calendário comemorativo", view: "events-calendar", color: T.warning, icon: Calendar },
                { label: "Fiscal", desc: "NFS-e, DAS e impostos", view: "tax-center", color: T.success, icon: Shield },
                { label: "Repasses", desc: "Histórico de pagamentos", view: "payouts", color: "#FFD700", icon: DollarSign },
                { label: "Segurança", desc: "2FA e sessões ativas", view: "security", color: T.success, icon: Shield },
                { label: "Player", desc: "Simular tela Android", view: "player", color: T.primary, icon: Monitor },
                { label: "ROI", desc: "Calcule sua receita", view: "roi-calculator", color: "#FFD700", icon: TrendingUp },
                { label: "Ajuda", desc: "Tutoriais e guias", view: "help-center", color: T.primary, icon: BookOpen },
                { label: "Saúde", desc: "Monitor de telas", view: "screen-health", color: T.success, icon: Activity },
                { label: "Analytics", desc: "Por campanha", view: "campaign-analytics", color: T.accent, icon: BarChart2 },
                { label: "SLA", desc: "Status da plataforma", view: "sla-dashboard", color: T.success, icon: Shield },
                { label: "Alertas", desc: "Preferências de notif.", view: "notification-settings", color: T.warning, icon: Bell },
              ].map((q, i) => {
                const Icon = q.icon;
                return (
                  <button key={i} onClick={() => onNavigate?.(q.view)}
                    className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02]"
                    style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: q.color + "20" }}>
                      <Icon size={15} style={{ color: q.color }} />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{q.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{q.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Meu conteúdo</h2>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium" style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {CONTENT_ITEMS.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <img
                    src={`https://images.unsplash.com/${item.img}?w=80&h=60&fit=crop&auto=format`}
                    alt={item.name}
                    className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: T.textSub }}>
                      <span>{item.duration}s</span>
                      <span>·</span>
                      <span>{item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-5 rounded-full relative cursor-pointer" style={{ background: item.active ? T.success : T.border }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: item.active ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                    <button className="p-1.5 rounded-lg" style={{ color: T.textSub }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.accent + "30" }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} style={{ color: T.accent }} />
                <span className="font-bold text-sm">Criar com IA</span>
                <span className="ml-auto text-xs" style={{ color: aiRemaining <= 0 ? T.danger : T.textSub }}>
                  {aiRemaining} gerações restantes
                </span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ex: promoção de fim de semana com destaque para o preço..."
                rows={3}
                className="w-full rounded-xl border p-3 text-sm resize-none outline-none mb-3"
                style={{ background: T.panel, borderColor: T.border, color: T.text }}
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiPrompt.trim() || aiRemaining <= 0}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}
              >
                {aiGenerating ? <><RefreshCw size={14} className="animate-spin" /> Gerando...</> : <><Zap size={14} /> Gerar peça</>}
              </button>
              {aiResult && !aiGenerating && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <img src={`https://images.unsplash.com/${aiResult}?w=500&h=280&fit=crop&auto=format`} alt="gerado" className="w-full rounded-xl" />
                  <button className="mt-2 w-full py-2 rounded-xl text-sm font-medium" style={{ background: T.success + "20", color: T.success }}>
                    ✓ Adicionar à playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "proofs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Provas de exibição</h2>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: T.success }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                Ao vivo
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={16} style={{ color: T.success }} />
                <div>
                  <div className="font-medium">ProofChain ativo</div>
                  <div className="text-xs" style={{ color: T.textSub }}>RSA-SHA256 · Merkle · Polygon · TSA RFC3161</div>
                </div>
                <span className="ml-auto font-black" style={{ color: T.success }}>100/100</span>
              </div>
            </div>
            <div className="space-y-2">
              {proofs.map((p, i) => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                  style={{
                    background: i === 0 ? T.success + "08" : T.card,
                    borderColor: i === 0 ? T.success + "30" : T.border,
                  }}>
                  <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.success }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.content}</div>
                    <div className="font-mono text-xs truncate mt-0.5" style={{ color: T.textSub }}>{p.hash}…</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{p.timestamp} · {p.duration}s</div>
                  </div>
                  <span className="text-xs flex-shrink-0 font-bold" style={{ color: T.success }}>✓ {p.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "revenue" && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Minha receita</h2>
            <div className="rounded-2xl border p-6 text-center" style={{ background: `linear-gradient(135deg, ${T.success}15, ${T.success}05)`, borderColor: T.success + "30" }}>
              <div className="text-xs mb-1" style={{ color: T.textSub }}>Receita acumulada este mês</div>
              <div className="text-5xl font-black mb-1" style={{ color: T.success }}>R${liveRevenue.toFixed(2)}</div>
              <div className="text-xs" style={{ color: T.textSub }}>+R$0,15 nas últimas 4 horas</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "CPM médio", value: "R$38,50", color: T.primary },
                { label: "Fill rate", value: "94,2%", color: T.accent },
                { label: "Anunciantes ativos", value: "7", color: T.warning },
                { label: "Impressões/dia", value: "1.284", color: T.success },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.label}</div>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4 text-sm">Últimas transações</h3>
              {[
                { advertiser: "Auto Finance", amount: 12.40, time: "Há 12min", type: "CPM" },
                { advertiser: "Varejo Brasil", amount: 8.75, time: "Há 28min", type: "CPM" },
                { advertiser: "Canal DOOHPLAY", amount: 4.20, time: "Há 45min", type: "Canal" },
                { advertiser: "Food Express", amount: 15.30, time: "Há 1h", type: "CPM" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: T.border }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                    style={{ background: T.primary + "20", color: T.primary }}>
                    {tx.advertiser[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{tx.advertiser}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tx.time} · {tx.type}</div>
                  </div>
                  <div className="font-bold" style={{ color: T.success }}>+R${tx.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
            {plan === "starter" && (
              <div className="rounded-xl border p-4" style={{ background: T.warning + "10", borderColor: T.warning + "30" }}>
                <div className="font-medium text-sm mb-1" style={{ color: T.warning }}>Aumente sua receita</div>
                <p className="text-xs mb-3" style={{ color: T.textSub }}>Com o plano Pro, você ativa o sorteio ponderado de anúncios e pode ter até 5 telas — até 5× mais receita.</p>
                <button onClick={() => onUpgrade?.("pro")} className="w-full py-2 rounded-xl text-sm font-medium" style={{ background: T.warning + "20", color: T.warning }}>
                  Upgrade para Pro — R$290/mês
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Configurações</h2>
            <div className="rounded-xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              {[
                { label: "Nome", value: session?.name ?? "—", icon: "👤" },
                { label: "Telefone (WhatsApp)", value: session?.phone ?? "—", icon: "📱" },
                { label: "Tipo de negócio", value: session?.businessType ?? "—", icon: "🏪" },
                { label: "Plano atual", value: `${(plan.charAt(0).toUpperCase() + plan.slice(1))} · R${plan === "starter" ? "$97" : plan === "pro" ? "$290" : "$620"}/mês`, icon: "⭐" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b last:border-0" style={{ borderColor: T.border }}>
                  <span className="text-lg">{row.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs mb-0.5" style={{ color: T.textSub }}>{row.label}</div>
                    <div className="text-sm font-medium">{row.value}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: T.textSub }} />
                </div>
              ))}
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="p-4 font-medium text-sm border-b" style={{ borderColor: T.border, color: T.textSub }}>Telas</div>
              {screens.length === 0 ? (
                <div className="p-4 text-sm" style={{ color: T.textSub }}>Nenhuma tela cadastrada ainda.</div>
              ) : (
                screens.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-4 border-b last:border-0" style={{ borderColor: T.border }}>
                    <Tv size={16} style={{ color: T.primary }} />
                    <div className="flex-1 text-sm">{s.name}</div>
                    <div className="w-2 h-2 rounded-full" style={{ background: s.status === "active" ? T.success : T.textSub }} />
                  </div>
                ))
              )}
              {screens.length < screenLimit && (
                <button className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium" style={{ color: T.primary }}>
                  <Plus size={14} /> Adicionar tela
                </button>
              )}
              {screens.length >= screenLimit && plan !== "business" && (
                <div className="p-4 text-xs" style={{ color: T.textSub }}>
                  Limite de {screenLimit} telas atingido. <button onClick={() => onUpgrade?.("pro")} style={{ color: T.primary }}>Fazer upgrade</button>
                </div>
              )}
            </div>
            <button className="w-full py-3 rounded-xl text-sm border font-medium transition-all hover:opacity-80" style={{ borderColor: T.danger + "40", color: T.danger }}>
              Sair da conta
            </button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t" style={{ background: T.panel + "F8", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto flex items-stretch">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
                style={{ color: isActive ? T.primary : T.textSub }}
              >
                <Icon size={20} />
                <span className="text-xs">{t.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full" style={{ background: T.primary }} />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
