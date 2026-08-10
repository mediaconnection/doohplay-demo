import { useState } from "react";
import { ArrowLeft, Tv, DollarSign, Eye, Shield, Activity, Users, Building2,
  CheckCircle2, TrendingUp, AlertTriangle, MapPin, Award, Globe } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", primary: "#2563EB", secondary: "#0EA5E9",
  success: "#22C55E", warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const monthlyRevenue = [
  { m: "Jan", r: 5.2, t: 10800 }, { m: "Fev", r: 5.8, t: 11200 }, { m: "Mar", r: 5.5, t: 11600 },
  { m: "Abr", r: 6.4, t: 12100 }, { m: "Mai", r: 7.1, t: 12400 }, { m: "Jun", r: 7.8, t: 12600 },
  { m: "Jul", r: 7.2, t: 12700 }, { m: "Ago", r: 8.4, t: 12847 },
];

const topCities = [
  { city: "São Paulo", screens: 4821, rev: "R$3.4M", trust: 98.1, growth: "+18%" },
  { city: "Rio de Janeiro", screens: 2140, rev: "R$1.8M", trust: 97.4, growth: "+14%" },
  { city: "Belo Horizonte", screens: 1203, rev: "R$0.9M", trust: 96.8, growth: "+22%" },
  { city: "Brasília", screens: 891, rev: "R$0.7M", trust: 97.2, growth: "+16%" },
  { city: "Curitiba", screens: 724, rev: "R$0.6M", trust: 97.9, growth: "+31%" },
];

const topNetworks = [
  { name: "Rede Farma Nacional", screens: 127, rev: "R$1.2M", trust: 98.7 },
  { name: "Shopping Centers BR", screens: 112, rev: "R$0.9M", trust: 99.4 },
  { name: "Supermercados Norte", screens: 89, rev: "R$0.7M", trust: 97.5 },
  { name: "Academia Fit Network", screens: 64, rev: "R$0.5M", trust: 96.8 },
];

const alerts = [
  { msg: "Trust Score Curitiba acima de 97.9 — desempenho excepcional", type: "success" },
  { msg: "3 telas em Manaus com SLA 97% — monitorar", type: "warning" },
  { msg: "Blockchain sync confirmado — bloco #18.241.872", type: "success" },
  { msg: "Compliance LGPD verificado — próxima auditoria em 30 dias", type: "info" },
];

export default function ExecutiveCommandCenter({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"overview" | "ranking" | "financeiro" | "risco">("overview");

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="px-8 pt-8 pb-4 border-b" style={{ borderColor: T.border, background: "linear-gradient(180deg, #020617 0%, #0A1628 100%)" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 hover:opacity-80" style={{ color: T.textSub }}><ArrowLeft size={16} /> Voltar</button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.purple})` }}><Globe size={20} color="#fff" /></div>
              <h1 className="text-3xl font-bold" style={{ color: T.text }}>Executive Command Center</h1>
            </div>
            <p className="text-sm ml-14" style={{ color: T.textSub }}>Visão consolidada da operação nacional DOOHPLAY</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${T.success}12`, border: `1px solid ${T.success}30` }}>
            <span className="relative inline-flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: T.success }} /><span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: T.success }} /></span>
            <span className="text-sm font-semibold" style={{ color: T.success }}>Operação Normal</span>
          </div>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {[
            { l: "Receita Nacional", v: "R$8.4M", sub: "+23%", c: T.success, i: DollarSign },
            { l: "Telas Ativas", v: "12.847", sub: "+12%", c: T.primary, i: Tv },
            { l: "Impressões/Dia", v: "84.2M", sub: "+18%", c: T.secondary, i: Eye },
            { l: "Trust Score", v: "97.3", sub: "Estável", c: T.warning, i: Shield },
            { l: "Campanhas", v: "1.247", sub: "+8%", c: T.purple, i: Activity },
            { l: "Anunciantes", v: "284", sub: "+14%", c: T.primary, i: Building2 },
            { l: "Agências", v: "48", sub: "+6%", c: T.secondary, i: Users },
            { l: "Proofs", v: "4.8M", sub: "100%", c: T.success, i: CheckCircle2 },
          ].map((k, i) => (
            <div key={`exc-${i}`} className="p-4 rounded-2xl border text-center" style={{ background: `${T.card}CC`, borderColor: `${k.c}25`, boxShadow: `0 4px 20px ${k.c}10` }}>
              <k.i size={18} style={{ color: k.c, margin: "0 auto 8px" }} />
              <div className="text-2xl font-bold" style={{ color: k.c }}>{k.v}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.l}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: T.success }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {(["overview", "ranking", "financeiro", "risco"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize" style={{ background: tab === t ? T.primary : T.card, color: tab === t ? "#fff" : T.textSub, border: `1px solid ${tab === t ? T.primary : T.border}` }}>
              {t === "overview" ? "Visão Geral" : t === "ranking" ? "Rankings" : t === "financeiro" ? "Financeiro" : "Risco"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {tab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-6">
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Receita Nacional + Telas (mensal)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient key="excg" id="excg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.success} stopOpacity={0.4} /><stop offset="100%" stopColor={T.success} stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis key="exax" dataKey="m" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                    <YAxis key="exay" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                    <Tooltip key="exatt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                    <Area key="exaa" type="monotone" dataKey="r" stroke={T.success} strokeWidth={2.5} fill="url(#excg)" name="Receita (R$M)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Mapa Nacional</div>
                <div className="relative h-64">
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ opacity: 0.15 }}>
                    <path d="M35,15 L45,12 L55,14 L65,18 L72,25 L75,35 L73,42 L70,48 L68,55 L65,62 L60,68 L57,72 L55,78 L52,83 L50,88 L48,82 L45,75 L42,70 L38,65 L35,60 L30,55 L27,48 L25,40 L26,32 L30,24 Z" fill="none" stroke={T.primary} strokeWidth="0.8" />
                  </svg>
                  {[{ x: 52, y: 65, c: T.primary, s: 20, l: "SP" }, { x: 57, y: 68, c: T.secondary, s: 15, l: "RJ" }, { x: 53, y: 60, c: T.success, s: 12, l: "BH" }, { x: 50, y: 50, c: T.warning, s: 10, l: "BSB" }, { x: 50, y: 72, c: T.purple, s: 9, l: "CTB" }].map((p, i) => (
                    <div key={`exm-${i}`} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                      <div className="rounded-full flex items-center justify-center font-bold text-xs" style={{ width: p.s, height: p.s, background: `${p.c}30`, border: `2px solid ${p.c}`, color: p.c, boxShadow: `0 0 ${p.s}px ${p.c}40`, fontSize: 8 }}>{p.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Top Cidades</div>
                {topCities.map((c, i) => (
                  <div key={`topc-${i}`} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: T.border }}>
                    <div className="text-sm font-bold w-4" style={{ color: T.gray }}>{i + 1}</div>
                    <div className="flex-1"><div className="text-sm font-semibold" style={{ color: T.text }}>{c.city}</div><div className="text-xs" style={{ color: T.textSub }}>{c.screens.toLocaleString("pt-BR")} telas</div></div>
                    <div className="text-right"><div className="text-sm font-bold" style={{ color: T.success }}>{c.rev}</div><div className="text-xs font-semibold" style={{ color: T.success }}>{c.growth}</div></div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Top Redes</div>
                {topNetworks.map((n, i) => (
                  <div key={`topn-${i}`} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: T.border }}>
                    <div className="text-sm font-bold w-4" style={{ color: T.gray }}>{i + 1}</div>
                    <div className="flex-1"><div className="text-sm font-semibold" style={{ color: T.text }}>{n.name}</div><div className="text-xs" style={{ color: T.textSub }}>{n.screens} telas</div></div>
                    <div className="text-right"><div className="text-sm font-bold" style={{ color: T.success }}>{n.rev}</div><div className="text-xs" style={{ color: T.warning }}>{n.trust}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "financeiro" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Receita Mensal", v: "R$8.4M", sub: "+23% MoM", c: T.success },
              { l: "Receita Anual", v: "R$101M", sub: "Projeção 2026", c: T.primary },
              { l: "Margem", v: "42%", sub: "+3pp vs. ano anterior", c: T.secondary },
              { l: "Crescimento YoY", v: "+68%", sub: "Acima do setor", c: T.warning },
            ].map((f, i) => (
              <div key={`finc-${i}`} className="p-6 rounded-2xl border text-center" style={{ background: T.card, borderColor: `${f.c}25` }}>
                <div className="text-4xl font-bold mb-2" style={{ color: f.c }}>{f.v}</div>
                <div className="text-sm font-semibold" style={{ color: T.text }}>{f.l}</div>
                <div className="text-xs mt-1" style={{ color: T.success }}>{f.sub}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "risco" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: T.text }}><Shield size={14} style={{ color: T.primary }} /> Painel de Risco</div>
              {alerts.map((a, i) => {
                const c = a.type === "success" ? T.success : a.type === "warning" ? T.warning : T.primary;
                return (
                  <div key={`alert-${i}`} className="flex gap-3 p-3 rounded-xl mb-2" style={{ background: `${c}08`, border: `1px solid ${c}20` }}>
                    {a.type === "warning" ? <AlertTriangle size={14} style={{ color: c, flexShrink: 0, marginTop: 1 }} /> : <CheckCircle2 size={14} style={{ color: c, flexShrink: 0, marginTop: 1 }} />}
                    <span className="text-sm" style={{ color: T.textSub }}>{a.msg}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-4">
              {[{ l: "Trust Score Geral", v: "97.3", status: "Excelente", c: T.success }, { l: "Blockchain Sync", v: "100%", status: "Ativo", c: T.success }, { l: "Compliance LGPD", v: "Verificado", status: "OK", c: T.success }, { l: "SLA Nacional", v: "99.9%", status: "Nominal", c: T.success }].map((r, i) => (
                <div key={`risk-${i}`} className="flex items-center justify-between p-4 rounded-xl border" style={{ background: T.card, borderColor: `${r.c}25` }}>
                  <span className="text-sm" style={{ color: T.textSub }}>{r.l}</span>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold" style={{ color: r.c }}>{r.v}</span><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${r.c}18`, color: r.c }}>{r.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "ranking" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[{ title: "Top Cidades", data: topCities.map(c => ({ name: c.city, value: c.rev, sub: `${c.screens.toLocaleString("pt-BR")} telas`, trend: c.growth })) }, { title: "Top Redes", data: topNetworks.map(n => ({ name: n.name, value: n.rev, sub: `${n.screens} telas · Trust ${n.trust}`, trend: "+18%" })) }, { title: "Top Segmentos", data: [{ name: "Retail", value: "34%", sub: "CPM R$22", trend: "+21%" }, { name: "Food Service", value: "28%", sub: "CPM R$18", trend: "+18%" }, { name: "Health", value: "18%", sub: "CPM R$21", trend: "+24%" }, { name: "Fitness", value: "12%", sub: "CPM R$15", trend: "+31%" }] }].map((rank, ri) => (
              <div key={`rank-${ri}`} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>{rank.title}</div>
                {rank.data.map((item, ii) => (
                  <div key={`ri-${ri}-${ii}`} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: T.border }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: ii === 0 ? `${T.warning}20` : `${T.primary}12`, color: ii === 0 ? T.warning : T.primary }}>{ii + 1}</div>
                    <div className="flex-1"><div className="text-sm font-semibold" style={{ color: T.text }}>{item.name}</div><div className="text-xs" style={{ color: T.textSub }}>{item.sub}</div></div>
                    <div className="text-right"><div className="text-sm font-bold" style={{ color: T.success }}>{item.value}</div><div className="text-xs" style={{ color: T.success }}>{item.trend}</div></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
