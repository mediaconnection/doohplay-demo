import { useState } from "react";
import {
  ArrowLeft, Monitor, DollarSign, Wifi, Shield, CheckCircle2, AlertCircle,
  Bell, TrendingUp, Eye, Loader2, Circle, Play, Pause, Zap, Link2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Logo } from "./shared/Logo";
import { KPICard } from "./shared/KPICard";
import { StatusBadge } from "./shared/StatusBadge";

const chartData = [
  { name: "Jan", a: 400, b: 240 }, { name: "Fev", a: 520, b: 300 }, { name: "Mar", a: 480, b: 280 },
  { name: "Abr", a: 640, b: 420 }, { name: "Mai", a: 580, b: 380 }, { name: "Jun", a: 720, b: 460 },
];

interface ComponentLibraryProps {
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-bold text-foreground mb-4 pb-3 border-b border-border" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{title}</h2>
      {children}
    </div>
  );
}

function ColorSwatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-xl border border-border shadow-sm" style={{ backgroundColor: color }} />
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs font-mono text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

export default function ComponentLibrary({ onBack }: ComponentLibraryProps) {
  const [stepperStep, setStepperStep] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft size={18} />
          </button>
          <Logo />
          <span className="text-xs px-2 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-semibold">Design System</span>
        </div>
      </header>

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#020617] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 size={16} className="text-[#22C55E]" />
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            DOOHPLAY Design System
          </h1>
          <p className="text-muted-foreground">Biblioteca completa de componentes, tokens e padrões visuais.</p>
        </div>

        <Section title="Cores — Brand Tokens">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch color="#2563EB" label="Primary Blue" hex="#2563EB" />
            <ColorSwatch color="#22C55E" label="Success Green" hex="#22C55E" />
            <ColorSwatch color="#FF6B00" label="Revenue Orange" hex="#FF6B00" />
            <ColorSwatch color="#00A3FF" label="Trust Cyan" hex="#00A3FF" />
            <ColorSwatch color="#FACC15" label="Warning Yellow" hex="#FACC15" />
            <ColorSwatch color="#EF4444" label="Error Red" hex="#EF4444" />
            <ColorSwatch color="#020617" label="Text Primary" hex="#020617" />
            <ColorSwatch color="#475569" label="Text Secondary" hex="#475569" />
            <ColorSwatch color="#E2E8F0" label="Border" hex="#E2E8F0" />
            <ColorSwatch color="#F8FAFC" label="Background" hex="#F8FAFC" />
          </div>
        </Section>

        <Section title="Tipografia">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Display / Inter Tight 800</p>
              <p className="text-4xl font-extrabold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Proof-of-Play Auditável</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Heading / Inter Tight 700</p>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Gerencie sua rede DOOH</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Body / Inter 400</p>
              <p className="text-base text-foreground">Conecte sua TV, valide o código e comece a exibir conteúdo em poucos minutos.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Label / Inter 600</p>
              <p className="text-sm font-semibold text-muted-foreground">Campanhas ativas · Status da rede · Trust Score</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Mono / JetBrains Mono 500</p>
              <p className="text-sm font-mono font-medium text-foreground">0x7f3a...d4b2 · SCR-00847 · Block #19284721</p>
            </div>
          </div>
        </Section>

        <Section title="Botões">
          <div className="flex flex-wrap gap-3 items-center">
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">Primary</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#22C55E] hover:opacity-90 transition-opacity">Success</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FF6B00] hover:opacity-90 transition-opacity">Revenue</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00A3FF] hover:opacity-90 transition-opacity">Trust</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#EF4444] hover:opacity-90 transition-opacity">Danger</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#EFF6FF] transition-colors">Outline</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-secondary hover:bg-[#E2E8F0] transition-colors">Secondary</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed bg-secondary" disabled>Disabled</button>
            <button onClick={() => showToast("Ação realizada com sucesso!")} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#020617] hover:opacity-80 transition-opacity">
              Mostrar toast
            </button>
          </div>
        </Section>

        <Section title="Badges — Status">
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge status="online" />
            <StatusBadge status="offline" />
            <StatusBadge status="warning" />
            <StatusBadge status="active" />
            <StatusBadge status="paused" />
            <StatusBadge status="pending" />
            <StatusBadge status="verified" />
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1D4ED8]">Local</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB]">Business</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0369A1]">Enterprise</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#15803D]">Verificado</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF9C3] text-[#854D0E]">Auditando</span>
          </div>
        </Section>

        <Section title="KPI Cards">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Receita este mês" value="R$ 847" change="+23%" changeType="up" icon={DollarSign} iconColor="#22C55E" iconBg="#DCFCE7" />
            <KPICard title="Telas online" value="1.189" change="58 offline" changeType="down" icon={Monitor} iconColor="#2563EB" iconBg="#DBEAFE" />
            <KPICard title="Trust Score" value="97.3" change="Excelente" changeType="up" icon={Shield} iconColor="#00A3FF" iconBg="#E0F2FE" />
            <KPICard title="Visualizações" value="4.2M" change="+8.4% hoje" changeType="up" icon={Eye} iconColor="#FF6B00" iconBg="#FFF7ED" />
          </div>
        </Section>

        <Section title="Charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Area Chart — Receita</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient key="lib-blue-grad" id="lib-blue-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Area key="area-a" type="monotone" dataKey="a" stroke="#2563EB" strokeWidth={2} fill="url(#lib-blue-grad)" dot={false} />
                  <Area key="area-b" type="monotone" dataKey="b" stroke="#22C55E" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Bar Chart — Por unidade</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar key="bar-a" dataKey="a" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar key="bar-b" dataKey="b" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Nome da tela</label>
              <input type="text" placeholder="Ex: TV Entrada Principal" className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Código de ativação</label>
              <input type="text" placeholder="DHP-XXX-XXX" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#2563EB] bg-[#EFF6FF] text-foreground text-sm font-mono focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-1.5">Estado: erro</label>
              <input type="text" defaultValue="Código inválido" className="w-full px-4 py-2.5 rounded-xl border-2 border-[#EF4444] bg-[#FEE2E2] text-foreground text-sm focus:outline-none" />
              <p className="text-xs text-[#EF4444] mt-1">Código não reconhecido. Tente novamente.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground block mb-1.5">Estado: desabilitado</label>
              <input type="text" defaultValue="Tela verificada" disabled className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-muted-foreground text-sm cursor-not-allowed" />
            </div>
          </div>
        </Section>

        <Section title="Installation Stepper">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-0 mb-6">
              {[1, 2, 3, 4, 5].map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => setStepperStep(s)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    style={
                      s < stepperStep ? { backgroundColor: "#22C55E", color: "white" } :
                      s === stepperStep ? { backgroundColor: "#2563EB", color: "white" } :
                      { backgroundColor: "#E2E8F0", color: "#94A3B8" }
                    }
                  >
                    {s < stepperStep ? <CheckCircle2 size={16} /> : s}
                  </button>
                  {i < 4 && <div className="flex-1 h-0.5 mx-1" style={{ backgroundColor: s < stepperStep ? "#22C55E" : "#E2E8F0" }} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-0">
              {["Conectar TV", "Validar Código", "Registrar", "Sincronizar", "Ativo"].map((label, i) => (
                <span key={i} className={`text-center w-1/5 ${i + 1 === stepperStep ? "text-[#2563EB] font-semibold" : ""}`}>{label}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setStepperStep(s => Math.max(1, s - 1))} className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-secondary transition-colors">← Anterior</button>
              <button onClick={() => setStepperStep(s => Math.min(5, s + 1))} className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#2563EB] hover:opacity-90 transition-opacity">Próximo →</button>
            </div>
          </div>
        </Section>

        <Section title="ProofChain Timeline">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="space-y-0">
              {[
                { time: "14:32:01", tx: "0x7f3a...d4b2", screen: "SCR-00847", verified: true },
                { time: "14:31:58", tx: "0x2c8e...f91a", screen: "SCR-00123", verified: true },
                { time: "14:31:55", tx: "0x9b1d...a337", screen: "SCR-00512", verified: false },
              ].map((ev, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ev.verified ? "bg-[#DCFCE7]" : "bg-[#FEF9C3]"}`}>
                      {ev.verified
                        ? <CheckCircle2 size={14} className="text-[#22C55E]" />
                        : <Loader2 size={14} className="text-[#FACC15] animate-spin" />}
                    </div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{ev.time}</span>
                      <span className="font-mono text-xs text-[#2563EB] font-medium">{ev.tx}</span>
                      <span className="text-xs text-muted-foreground">{ev.screen}</span>
                      <StatusBadge status={ev.verified ? "verified" : "pending"} customLabel={ev.verified ? "Verificado" : "Pendente"} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Trust Score Card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { score: 97, label: "Excelente", color: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0" },
              { score: 78, label: "Regular", color: "#FACC15", bg: "#FEF9C3", border: "#FDE68A" },
              { score: 42, label: "Crítico", color: "#EF4444", bg: "#FEE2E2", border: "#FECACA" },
            ].map((ts, i) => (
              <div key={i} className="rounded-xl p-5 border" style={{ backgroundColor: ts.bg, borderColor: ts.border }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: ts.color }} />
                    <span className="text-sm font-semibold" style={{ color: ts.color }}>Trust Score</span>
                  </div>
                  <Link2 size={14} style={{ color: ts.color }} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold" style={{ color: ts.color, fontFamily: "'Inter Tight', sans-serif" }}>{ts.score}</span>
                  <span className="text-sm font-semibold" style={{ color: ts.color }}>/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/60 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${ts.score}%`, backgroundColor: ts.color }} />
                </div>
                <p className="text-xs font-medium mt-2" style={{ color: ts.color }}>{ts.label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Empty States">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
                <Monitor size={24} className="text-[#2563EB]" />
              </div>
              <p className="font-semibold text-foreground mb-1">Nenhuma tela ativa</p>
              <p className="text-sm text-muted-foreground mb-4">Conecte sua primeira tela para começar.</p>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">Ativar tela</button>
            </div>
            <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
                <DollarSign size={24} className="text-[#22C55E]" />
              </div>
              <p className="font-semibold text-foreground mb-1">Sem campanhas ativas</p>
              <p className="text-sm text-muted-foreground mb-4">Crie uma campanha para sua rede.</p>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#22C55E] hover:opacity-90 transition-opacity">Nova campanha</button>
            </div>
          </div>
        </Section>

        <Section title="Loading States">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin text-[#2563EB]" /> Carregando dados...
            </div>
            <div className="bg-card border border-border rounded-xl p-4 w-48 space-y-3 animate-pulse">
              <div className="h-3 bg-secondary rounded-full w-3/4" />
              <div className="h-6 bg-secondary rounded-lg w-1/2" />
              <div className="h-2 bg-secondary rounded-full w-full" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB] animate-spin" />
          </div>
        </Section>

        <Section title="Alerts">
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-4">
              <CheckCircle2 size={18} className="text-[#22C55E] mt-0.5 shrink-0" />
              <div><p className="text-sm font-semibold text-[#15803D]">Tela ativada com sucesso</p><p className="text-xs text-[#15803D]/80">SCR-00847 está online e exibindo conteúdo.</p></div>
            </div>
            <div className="flex items-start gap-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4">
              <AlertCircle size={18} className="text-[#FF6B00] mt-0.5 shrink-0" />
              <div><p className="text-sm font-semibold text-[#C2410C]">Tela com baixo sinal</p><p className="text-xs text-[#C2410C]/80">SCR-00512 — Qualidade de conexão abaixo do esperado.</p></div>
            </div>
            <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
              <AlertCircle size={18} className="text-[#EF4444] mt-0.5 shrink-0" />
              <div><p className="text-sm font-semibold text-[#B91C1C]">Tela offline</p><p className="text-xs text-[#B91C1C]/80">SCR-00089 não responde há 4 horas. Verifique a conexão.</p></div>
            </div>
            <div className="flex items-start gap-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
              <Bell size={18} className="text-[#2563EB] mt-0.5 shrink-0" />
              <div><p className="text-sm font-semibold text-[#1D4ED8]">Nova campanha disponível</p><p className="text-xs text-[#1D4ED8]/80">A campanha "Bradesco Black Friday" está pronta para exibição.</p></div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
