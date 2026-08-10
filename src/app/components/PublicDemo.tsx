import { useState, useEffect } from "react";
import {
  Play, Shield, TrendingUp, Tv, Zap, CheckCircle,
  DollarSign, Globe, Lock, ArrowRight, Star, Eye, ChevronRight,
  BarChart2, Clock, Users, Sparkles
} from "lucide-react";

const T = {
  bg: "#020617", card: "#071225", panel: "#0A0F1E", border: "rgba(255,255,255,0.06)",
  primary: "#2563EB", secondary: "#0EA5E9", success: "#22C55E",
  purple: "#8B5CF6", warning: "#F59E0B", text: "#F1F5F9", textSub: "#64748B",
};

const DEMO_SCREENS = [
  { id: "d1", name: "Recepção — FitSpace Pinheiros", status: "online", fillRate: 87, revenue: 1240, impressions: 148420, uptime: 99.8 },
  { id: "d2", name: "Vitrine — TechStore Moema",    status: "online", fillRate: 92, revenue: 2180, impressions: 224810, uptime: 98.4 },
  { id: "d3", name: "Salão — Drogaria Centro",       status: "online", fillRate: 74, revenue: 890,  impressions: 89240,  uptime: 97.1 },
];

const PROOF_EVENTS = [
  { ts: "14:32:18", id: "PRF-A7K2M9", hash: "a7f3c2...", layer: "Polygon", status: "confirmed" },
  { ts: "14:31:05", id: "PRF-B1N8P3", hash: "e2d9a1...", layer: "RSA-SHA256", status: "confirmed" },
  { ts: "14:30:00", id: "PRF-C4R7Q1", hash: "f8b4c7...", layer: "Merkle", status: "confirmed" },
];

const CAMPAIGNS = [
  { name: "Black Friday",    advertiser: "TechStore",  imp: 84200, spend: 3120, cpm: 46, status: "active"    },
  { name: "iFood Verão",     advertiser: "iFood",      imp: 51200, spend: 1840, cpm: 40, status: "active"    },
  { name: "AutoFinance",     advertiser: "AutoFin.",   imp: 61800, spend: 2280, cpm: 42, status: "completed" },
];

const TAB_SCREENS = ["Dashboard", "ProofChain", "Campanhas", "Receita"];

function AnimatedValue({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const inc = target / 60;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setVal(Math.floor(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{val.toLocaleString("pt-BR")}{suffix}</>;
}

export default function PublicDemo({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [tab, setTab] = useState("Dashboard");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Demo banner */}
      <div className="text-center py-2 text-xs font-semibold" style={{ background: T.primary, color: "#fff" }}>
        🎬 Modo demonstração — dados simulados · Clique em qualquer botão para explorar
      </div>

      {/* Top nav */}
      <div className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-2">
          <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#2563EB" />
            <rect x="6" y="8" width="8" height="16" rx="2" fill="white" />
            <rect x="18" y="8" width="8" height="10" rx="2" fill="#0EA5E9" />
            <rect x="18" y="22" width="8" height="2" rx="1" fill="#22C55E" />
          </svg>
          <span className="font-bold text-lg" style={{ fontFamily: "'Inter Tight', sans-serif" }}>DOOHPLAY</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold ml-1" style={{ background: T.primary + "20", color: T.secondary }}>DEMO</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.("pricing")}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
            style={{ background: T.primary + "20", color: T.secondary }}
          >
            Ver planos
          </button>
          <button
            onClick={() => onNavigate?.("login")}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: T.primary, color: "#fff" }}
          >
            Criar conta grátis <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5" style={{ background: T.primary + "18", color: T.secondary, border: `1px solid ${T.primary}30` }}>
            <Sparkles size={14} /> Explore a plataforma sem cadastro
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>
            Sua TV. Sua receita.<br />
            <span style={{ color: T.primary }}>Sua prova auditável.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-6" style={{ color: T.textSub }}>
            Transforme qualquer TV Android em uma fonte de receita passiva com publicidade DOOH verificada em blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate?.("login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105"
              style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 24px ${T.primary}50` }}
            >
              <Zap size={18} /> Começar grátis — R$97/mês
            </button>
            <button
              onClick={() => onNavigate?.("pricing")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all"
              style={{ background: T.card, color: T.text, border: `1px solid ${T.border}` }}
            >
              Ver todos os planos <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Telas ativas",   value: 2840, suffix: "+",    color: T.success,  prefix: "" },
            { label: "Impressões/mês", value: 18400000, suffix: "",  color: T.text,     prefix: "" },
            { label: "Receita gerada", value: 4200000, suffix: "",   color: T.warning,  prefix: "R$" },
            { label: "Parceiros",      value: 420, suffix: "+",      color: T.secondary,prefix: "" },
          ].map(m => (
            <div key={m.label} className="p-5 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <p className="text-2xl font-bold" style={{ color: m.color }}>
                <AnimatedValue target={m.value} prefix={m.prefix} suffix={m.suffix} />
              </p>
              <p className="text-xs mt-1" style={{ color: T.textSub }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Demo panel */}
        <div className="rounded-3xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
          {/* Tab bar */}
          <div className="flex border-b px-6" style={{ borderColor: T.border }}>
            {TAB_SCREENS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="py-4 px-4 text-sm font-semibold border-b-2 transition-colors"
                style={{ borderColor: tab === t ? T.primary : "transparent", color: tab === t ? T.primary : T.textSub }}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 py-3">
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: T.success + "15", color: T.success }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
                Simulação ao vivo
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Dashboard tab */}
            {tab === "Dashboard" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Receita do mês",    value: "R$4.310",  change: "+18%", up: true,  color: T.warning },
                    { label: "Impressões hoje",   value: "48.240",   change: "+12%", up: true,  color: T.text    },
                    { label: "Fill Rate médio",   value: "84%",      change: "+3pp", up: true,  color: T.success },
                  ].map(m => (
                    <div key={m.label} className="p-4 rounded-2xl" style={{ background: T.panel }}>
                      <p className="text-xs mb-1" style={{ color: T.textSub }}>{m.label}</p>
                      <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: T.success }}>
                        <TrendingUp size={10} /> {m.change} vs mês anterior
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {DEMO_SCREENS.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: T.panel }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                          <Tv size={14} style={{ color: T.success }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs" style={{ color: T.textSub }}>{s.impressions.toLocaleString("pt-BR")} imp · uptime {s.uptime}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <p className="font-bold" style={{ color: T.warning }}>R${s.revenue.toLocaleString("pt-BR")}</p>
                          <p style={{ color: T.textSub }}>receita</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: T.success }}>{s.fillRate}%</p>
                          <p style={{ color: T.textSub }}>fill rate</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: T.success + "15", color: T.success }}>Online</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ProofChain tab */}
            {tab === "ProofChain" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: T.panel, border: `1px solid ${T.success}30` }}>
                  <Shield size={24} style={{ color: T.success }} />
                  <div>
                    <p className="font-bold text-sm">ProofChain ativo — 4 camadas de verificação</p>
                    <p className="text-xs" style={{ color: T.textSub }}>RSA-SHA256 · Merkle Tree · Polygon Blockchain · TSA RFC3161</p>
                  </div>
                  <CheckCircle size={18} className="ml-auto" style={{ color: T.success }} />
                </div>
                <div className="space-y-2">
                  {PROOF_EVENTS.map((ev, i) => (
                    <div key={`demo-proof-${i}`} className="flex items-center gap-4 p-4 rounded-2xl text-sm" style={{ background: T.panel }}>
                      <span className="text-xs font-mono" style={{ color: T.textSub }}>{ev.ts}</span>
                      <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ background: T.border, color: T.secondary }}>{ev.id}</span>
                      <span className="font-mono text-xs" style={{ color: T.textSub }}>{ev.hash}</span>
                      <span className="text-xs ml-auto" style={{ color: T.purple }}>{ev.layer}</span>
                      <CheckCircle size={14} style={{ color: T.success }} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center py-2" style={{ color: T.textSub }}>
                  Cada exibição é auditável publicamente · <button className="underline" onClick={() => onNavigate?.("proof-verifier")} style={{ color: T.primary }}>Verificar um hash</button>
                </p>
              </div>
            )}

            {/* Campanhas tab */}
            {tab === "Campanhas" && (
              <div className="space-y-3">
                {CAMPAIGNS.map((c, i) => (
                  <div key={`demo-camp-${i}`} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: T.panel }}>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs" style={{ color: T.textSub }}>{c.advertiser}</p>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-center">
                        <p className="font-bold">{c.imp.toLocaleString("pt-BR")}</p>
                        <p style={{ color: T.textSub }}>impressões</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold" style={{ color: T.warning }}>R${c.spend.toLocaleString("pt-BR")}</p>
                        <p style={{ color: T.textSub }}>gasto</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold" style={{ color: T.primary }}>R${c.cpm}</p>
                        <p style={{ color: T.textSub }}>CPM</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ background: c.status === "active" ? T.success + "15" : T.border, color: c.status === "active" ? T.success : T.textSub }}>
                        {c.status === "active" ? "Ativa" : "Concluída"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Receita tab */}
            {tab === "Receita" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Receita bruta/mês",  value: "R$6.157", color: T.text },
                    { label: "Repasse líquido",     value: "R$4.310", color: T.success },
                    { label: "ROI estimado",        value: "4.4×",    color: T.warning },
                  ].map(m => (
                    <div key={m.label} className="p-5 rounded-2xl text-center" style={{ background: T.panel }}>
                      <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-xs mt-1" style={{ color: T.textSub }}>{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-2xl" style={{ background: T.panel }}>
                  <p className="text-sm font-semibold mb-3">Projeção 6 meses (crescimento do fill rate)</p>
                  <div className="flex items-end gap-2 h-20">
                    {[38,44,51,58,68,78].map((h, i) => (
                      <div key={`proj-${i}`} className="flex-1 rounded-t-md transition-all" style={{ height: `${h}%`, background: `${T.primary}${40 + i * 15}` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-2" style={{ color: T.textSub }}>
                    {["Ago","Set","Out","Nov","Dez","Jan"].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>
                <p className="text-xs text-center" style={{ color: T.textSub }}>
                  Calculado com base no preço de plano Pro e 3 telas ativas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-10 p-8 rounded-3xl text-center border" style={{ background: T.card, borderColor: T.primary + "30" }}>
          <h2 className="text-2xl font-bold mb-2">Pronto para monetizar suas telas?</h2>
          <p className="mb-6" style={{ color: T.textSub }}>Plano Starter a partir de R$97/mês. Cancele quando quiser.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => onNavigate?.("login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
              style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 20px ${T.primary}50` }}>
              <Zap size={16} /> Criar conta — começa em 5 min
            </button>
            <button onClick={() => onNavigate?.("pricing")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold"
              style={{ background: T.panel, color: T.text, border: `1px solid ${T.border}` }}>
              Ver planos e preços
            </button>
          </div>
          <div className="flex justify-center gap-6 mt-5 text-xs" style={{ color: T.textSub }}>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: T.success }} /> Sem contrato</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: T.success }} /> Setup em 10 min</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} style={{ color: T.success }} /> Suporte via WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
