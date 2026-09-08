import { useState } from "react";
import {
  ArrowLeft, Bell, Smartphone, Mail, MessageCircle,
  Tv, DollarSign, Shield, Zap, AlertTriangle, CheckCircle,
  TrendingUp, Clock, Save, Check
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Channel = "whatsapp" | "email" | "push";
type Freq = "instant" | "hourly" | "daily" | "never";

interface NotifRule {
  id: string;
  category: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  channels: Record<Channel, boolean>;
  freq: Freq;
  importance: "high" | "medium" | "low";
}

const RULES_INIT: NotifRule[] = [
  { id: "screen-offline",  category: "Telas",      label: "Tela offline",            desc: "Quando uma tela perde conexão por mais de 5 min",   icon: Tv,          iconColor: T.danger,  channels: { whatsapp: true,  email: true,  push: true  }, freq: "instant", importance: "high"   },
  { id: "screen-warning",  category: "Telas",      label: "Tela com warning",        desc: "CPU, temperatura ou latência acima do limite",       icon: AlertTriangle,iconColor: T.warning, channels: { whatsapp: true,  email: false, push: true  }, freq: "instant", importance: "medium" },
  { id: "fill-low",        category: "Receita",    label: "Fill rate baixo",         desc: "Fill rate da tela abaixo de 30% por 2h seguidas",    icon: TrendingUp,  iconColor: T.warning, channels: { whatsapp: false, email: true,  push: true  }, freq: "hourly",  importance: "medium" },
  { id: "payment-received",category: "Financeiro", label: "Pagamento recebido",      desc: "Repasse processado na conta",                        icon: DollarSign,  iconColor: T.success, channels: { whatsapp: true,  email: true,  push: false }, freq: "instant", importance: "high"   },
  { id: "campaign-start",  category: "Campanhas",  label: "Campanha iniciada",       desc: "Nova campanha ativa nas suas telas",                 icon: Zap,         iconColor: T.primary, channels: { whatsapp: false, email: false, push: true  }, freq: "instant", importance: "low"    },
  { id: "campaign-end",    category: "Campanhas",  label: "Campanha encerrada",      desc: "Campanha concluiu todas as impressões contratadas",  icon: CheckCircle, iconColor: T.success, channels: { whatsapp: false, email: true,  push: false }, freq: "instant", importance: "low"    },
  { id: "proof-fail",      category: "ProofChain", label: "Falha de prova",          desc: "Exibição sem confirmação ProofChain por >10 min",    icon: Shield,      iconColor: T.danger,  channels: { whatsapp: true,  email: true,  push: true  }, freq: "instant", importance: "high"   },
  { id: "report-ready",    category: "Relatórios", label: "Relatório mensal pronto", desc: "Relatório do mês fechado disponível para download",  icon: Clock,       iconColor: T.accent,  channels: { whatsapp: false, email: true,  push: false }, freq: "daily",   importance: "low"    },
  { id: "ai-quota",        category: "AI",         label: "Cota de AI próxima do limite", desc: "Uso de geração por AI acima de 80% da cota mensal", icon: Zap,    iconColor: T.gold,    channels: { whatsapp: true,  email: false, push: true  }, freq: "instant", importance: "medium" },
];

const CHANNEL_CFG: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: T.success },
  email:    { label: "E-mail",   icon: Mail,          color: T.primary },
  push:     { label: "Push",     icon: Smartphone,    color: T.accent  },
};

const FREQ_OPTS: { id: Freq; label: string }[] = [
  { id: "instant", label: "Imediato" },
  { id: "hourly",  label: "Horário"  },
  { id: "daily",   label: "Diário"   },
  { id: "never",   label: "Nunca"    },
];

const IMP_CFG = {
  high:   { label: "Alta",  color: T.danger  },
  medium: { label: "Média", color: T.warning },
  low:    { label: "Baixa", color: T.textSub },
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative w-10 h-5.5 rounded-full transition-colors shrink-0"
      style={{ background: on ? T.success : T.border, width: 40, height: 22 }}>
      <div className="absolute top-0.5 rounded-full transition-transform"
        style={{ width: 18, height: 18, background: "#fff", left: on ? 20 : 2, transition: "left 0.2s ease" }} />
    </button>
  );
}

export default function NotificationSettings({ onBack }: { onBack: () => void }) {
  const [rules, setRules] = useState<NotifRule[]>(RULES_INIT);
  const [saved, setSaved] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [filterCat, setFilterCat] = useState("all");

  const toggleChannel = (ruleId: string, ch: Channel) => {
    setRules(prev => prev.map(r => r.id === ruleId
      ? { ...r, channels: { ...r.channels, [ch]: !r.channels[ch] } }
      : r
    ));
  };

  const setFreq = (ruleId: string, freq: Freq) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, freq } : r));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const categories = ["all", ...Array.from(new Set(RULES_INIT.map(r => r.category)))];
  const visible = filterCat === "all" ? rules : rules.filter(r => r.category === filterCat);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <Bell size={18} style={{ color: T.primary }} />
        <div>
          <h1 className="font-bold text-lg">Preferências de Notificação</h1>
          <p className="text-xs" style={{ color: T.textSub }}>Configure alertas por WhatsApp, e-mail e push</p>
        </div>
        <button onClick={handleSave}
          className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: saved ? T.success : T.primary, color: "#fff" }}>
          {saved ? <><Check size={14} /> Salvo!</> : <><Save size={14} /> Salvar</>}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Quiet hours */}
        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold">Modo silencioso</p>
              <p className="text-xs" style={{ color: T.textSub }}>Sem notificações durante o período definido</p>
            </div>
            <Toggle on={quietEnabled} onChange={() => setQuietEnabled(v => !v)} />
          </div>
          {quietEnabled && (
            <div className="flex items-center gap-4 text-sm">
              <label style={{ color: T.textSub }}>Das</label>
              <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              <label style={{ color: T.textSub }}>às</label>
              <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: T.warning + "15", color: T.warning }}>
                Alertas de alta prioridade ainda são enviados
              </span>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: filterCat === c ? T.primary + "20" : T.border, color: filterCat === c ? T.primary : T.textSub }}>
              {c === "all" ? "Todas" : c}
            </button>
          ))}
        </div>

        {/* Rules */}
        <div className="space-y-3">
          {visible.map(rule => {
            const Icon = rule.icon;
            const imp = IMP_CFG[rule.importance];
            return (
              <div key={rule.id} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: rule.iconColor + "20" }}>
                    <Icon size={16} style={{ color: rule.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{rule.label}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: rule.iconColor + "15", color: rule.iconColor }}>{rule.category}</span>
                      <span className="text-xs" style={{ color: imp.color }}>· {imp.label} prioridade</span>
                    </div>
                    <p className="text-xs" style={{ color: T.textSub }}>{rule.desc}</p>

                    {/* Channels */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {(Object.entries(CHANNEL_CFG) as [Channel, typeof CHANNEL_CFG[Channel]][]).map(([ch, cfg]) => {
                        const ChIcon = cfg.icon;
                        const on = rule.channels[ch];
                        return (
                          <button key={ch} onClick={() => toggleChannel(rule.id, ch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                            style={{ background: on ? cfg.color + "20" : T.border, color: on ? cfg.color : T.textSub }}>
                            <ChIcon size={11} /> {cfg.label}
                            {on && <Check size={10} />}
                          </button>
                        );
                      })}

                      {/* Frequency */}
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-xs" style={{ color: T.textSub }}>Frequência:</span>
                        <select value={rule.freq} onChange={e => setFreq(rule.id, e.target.value as Freq)}
                          className="px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                          {FREQ_OPTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
