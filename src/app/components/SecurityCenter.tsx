import { useState } from "react";
import { ArrowLeft, Shield, Smartphone, Lock, Eye, EyeOff, Check, X, AlertTriangle, Clock, MapPin, LogOut, Key } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Session { id: string; device: string; location: string; ip: string; lastActive: string; current: boolean; }
interface SecurityEvent { id: string; type: "login" | "logout" | "failed" | "settings"; desc: string; time: string; location: string; risk: "low" | "medium" | "high"; }

const SESSIONS: Session[] = [
  { id: "s1", device: "Chrome · macOS 14",        location: "São Paulo, SP",   ip: "189.55.12.44",  lastActive: "Agora",         current: true  },
  { id: "s2", device: "DOOHPLAY Player · Android", location: "São Paulo, SP",   ip: "192.168.1.104", lastActive: "há 2 min",      current: false },
  { id: "s3", device: "Safari · iPhone 15",        location: "São Paulo, SP",   ip: "189.55.12.44",  lastActive: "há 3 horas",    current: false },
  { id: "s4", device: "Chrome · Windows 11",       location: "Campinas, SP",    ip: "177.32.88.21",  lastActive: "há 2 dias",     current: false },
];

const EVENTS: SecurityEvent[] = [
  { id: "e1", type: "login",    desc: "Login bem-sucedido",           time: "Agora",      location: "São Paulo, SP", risk: "low"    },
  { id: "e2", type: "settings", desc: "2FA ativado",                  time: "há 2h",      location: "São Paulo, SP", risk: "low"    },
  { id: "e3", type: "login",    desc: "Login via WhatsApp OTP",       time: "há 5h",      location: "São Paulo, SP", risk: "low"    },
  { id: "e4", type: "failed",   desc: "Tentativa de login falhou",    time: "há 1 dia",   location: "Rio de Janeiro, RJ", risk: "high" },
  { id: "e5", type: "logout",   desc: "Logout manual",                time: "há 2 dias",  location: "Campinas, SP",  risk: "low"    },
  { id: "e6", type: "settings", desc: "Chave PIX atualizada",         time: "há 5 dias",  location: "São Paulo, SP", risk: "medium" },
];

const EVENT_CFG = {
  login:    { color: T.success, icon: Check    },
  logout:   { color: T.textSub, icon: LogOut   },
  failed:   { color: T.danger,  icon: X        },
  settings: { color: T.warning, icon: Key      },
};

const RISK_CFG = {
  low:    { label: "Baixo",  color: T.success },
  medium: { label: "Médio",  color: T.warning },
  high:   { label: "Alto",   color: T.danger  },
};

interface Props { onBack: () => void; }

export default function SecurityCenter({ onBack }: Props) {
  const [twoFA, setTwoFA] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);
  const [showPhone, setShowPhone] = useState(false);
  const [tab, setTab] = useState<"overview" | "sessions" | "activity">("overview");
  const [revoking, setRevoking] = useState<string | null>(null);

  const score = twoFA ? 94 : 62;
  const scoreColor = score >= 80 ? T.success : score >= 60 ? T.warning : T.danger;

  const revokeSession = (id: string) => {
    setRevoking(id);
    setTimeout(() => { setSessions(prev => prev.filter(s => s.id !== id)); setRevoking(null); }, 1200);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
              <Shield size={18} style={{ color: T.success }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Segurança</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Score: <strong style={{ color: scoreColor }}>{score}/100</strong></p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex">
          {(["overview","sessions","activity"] as const).map(id => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.primary : T.textSub }}>
              {{ overview: "Visão Geral", sessions: "Sessões", activity: "Atividade" }[id]}
              {id === "activity" && EVENTS.some(e => e.risk === "high") && (
                <span className="ml-1.5 w-2 h-2 rounded-full inline-block" style={{ background: T.danger }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {tab === "overview" && (
          <>
            <div className="p-6 rounded-2xl border flex items-center gap-6" style={{ background: T.card, borderColor: T.border }}>
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke={T.border} strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${score * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-2xl" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-xs" style={{ color: T.textSub }}>/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1">Score de segurança</div>
                <div className="text-sm mb-3" style={{ color: T.textSub }}>
                  {score >= 80 ? "Sua conta está bem protegida." : "Ative o 2FA para aumentar a proteção."}
                </div>
                {[
                  { label: "Autenticação 2FA",  ok: twoFA,  action: () => setTwoFA(true) },
                  { label: "Sessão HTTPS",       ok: true,   action: null },
                  { label: "Chave PIX ativa",    ok: true,   action: null },
                  { label: "Nenhum login suspeito", ok: !EVENTS.some(e => e.risk === "high"), action: null },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    {item.ok ? <Check size={13} style={{ color: T.success }} /> : <X size={13} style={{ color: T.danger }} />}
                    <span className="text-sm" style={{ color: item.ok ? T.text : T.textSub }}>{item.label}</span>
                    {!item.ok && item.action && (
                      <button onClick={item.action} className="ml-auto text-xs" style={{ color: T.primary }}>Ativar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl border" style={{ background: twoFA ? T.success + "06" : T.card, borderColor: twoFA ? T.success + "20" : T.border }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: twoFA ? T.success + "20" : T.panel }}>
                  <Smartphone size={18} style={{ color: twoFA ? T.success : T.textSub }} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">Autenticação WhatsApp (2FA)</div>
                  <div className="text-xs" style={{ color: T.textSub }}>OTP via WhatsApp a cada login</div>
                  {twoFA && <div className="text-xs mt-0.5" style={{ color: T.success }}>+55 (11) {showPhone ? "98765-4321" : "•••••-4321"} <button onClick={() => setShowPhone(v => !v)} className="ml-1">{showPhone ? <EyeOff size={10} /> : <Eye size={10} />}</button></div>}
                </div>
                <button onClick={() => setTwoFA(v => !v)}
                  className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative"
                  style={{ background: twoFA ? T.success : T.border }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: twoFA ? "calc(100% - 20px)" : 4 }} />
                </button>
              </div>
            </div>
            {EVENTS.some(e => e.risk === "high") && (
              <div className="p-4 rounded-2xl border" style={{ background: T.danger + "08", borderColor: T.danger + "30" }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} style={{ color: T.danger, marginTop: 1 }} />
                  <div>
                    <div className="font-bold text-sm" style={{ color: T.danger }}>Tentativa de acesso suspeita detectada</div>
                    <p className="text-xs mt-1" style={{ color: T.textSub }}>
                      Login falhou ontem de Rio de Janeiro — IP 201.94.XX.XX. Se não foi você, encerre todas as sessões.
                    </p>
                    <button className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: T.danger + "20", color: T.danger }}>
                      Encerrar todas as sessões
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "sessions" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm">{sessions.length} sessões ativas</h3>
              <button className="text-xs" style={{ color: T.danger }}>Encerrar todas</button>
            </div>
            {sessions.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-4 rounded-2xl border"
                style={{ background: s.current ? T.primary + "08" : T.card, borderColor: s.current ? T.primary + "20" : T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.current ? T.primary + "20" : T.panel }}>
                  <Smartphone size={16} style={{ color: s.current ? T.primary : T.textSub }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{s.device}</span>
                    {s.current && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.primary + "20", color: T.primary }}>atual</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: T.textSub }}>
                    <span className="flex items-center gap-1"><MapPin size={9} />{s.location}</span>
                    <span>{s.ip}</span>
                    <span className="flex items-center gap-1"><Clock size={9} />{s.lastActive}</span>
                  </div>
                </div>
                {!s.current && (
                  <button onClick={() => revokeSession(s.id)} disabled={revoking === s.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                    style={{ background: T.danger + "15", color: T.danger }}>
                    {revoking === s.id ? "..." : "Revogar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-2">
            {EVENTS.map(ev => {
              const cfg = EVENT_CFG[ev.type];
              const risk = RISK_CFG[ev.risk];
              const Icon = cfg.icon;
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3.5 rounded-xl border"
                  style={{ background: ev.risk === "high" ? T.danger + "06" : T.card, borderColor: ev.risk === "high" ? T.danger + "25" : T.border }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.color + "18" }}>
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{ev.desc}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{ev.location} · {ev.time}</div>
                  </div>
                  <span className="text-xs font-medium" style={{ color: risk.color }}>{risk.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
