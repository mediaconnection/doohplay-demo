import { useState } from "react";
import {
  ArrowLeft, Brain, TrendingUp, TrendingDown, DollarSign, Zap, Users,
  BarChart2, Activity, Star, ChevronRight, Lightbulb, Clock, Target,
  AlertCircle, CheckCircle2, Sparkles, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, LineChart, Line
} from "recharts";

const dark = { bg: "#020617", card: "#071225", cardElevated: "#0B1730", border: "#13233E", sub: "#94A3B8" };

const forecastData = [
  { mes: "Jan", atual: 520, previsto: 540 }, { mes: "Fev", atual: 640, previsto: 620 },
  { mes: "Mar", atual: 590, previsto: 610 }, { mes: "Abr", atual: 720, previsto: 700 },
  { mes: "Mai", atual: 680, previsto: 690 }, { mes: "Jun", atual: 847, previsto: 850 },
  { mes: "Jul", atual: null, previsto: 980 }, { mes: "Ago", atual: null, previsto: 1120 },
  { mes: "Set", atual: null, previsto: 1240 },
];

const hourlyOpportunity = [
  { hour: "06h", fill: 40, opp: 60 }, { hour: "08h", fill: 65, opp: 35 },
  { hour: "10h", fill: 55, opp: 45 }, { hour: "12h", fill: 80, opp: 20 },
  { hour: "14h", fill: 70, opp: 30 }, { hour: "16h", fill: 60, opp: 40 },
  { hour: "18h", fill: 90, opp: 10 }, { hour: "20h", fill: 45, opp: 55 },
];

const recommendedAdvertisers = [
  { name: "Banco Itaú", category: "Banco", match: 98, estimatedRevenue: "R$ 240/mês", reason: "Alto CPC no seu horário de pico", color: "#FF6B00" },
  { name: "Rappi", category: "Delivery", match: 94, estimatedRevenue: "R$ 180/mês", reason: "Segmento ideal para seu público", color: "#FF4B4B" },
  { name: "Nescafé", category: "Alimentos", match: 91, estimatedRevenue: "R$ 140/mês", reason: "Perfil de padaria de alto valor", color: "#8B5CF6" },
  { name: "Unimed", category: "Saúde", match: 87, estimatedRevenue: "R$ 120/mês", reason: "Proximidade a clínicas na região", color: "#22C55E" },
];

const aiSuggestions = [
  { type: "horário", icon: Clock, color: "#00A8FF", title: "Aumente receita das 18h–20h", desc: "Seu fill rate cai para 45% neste período. A IA identificou 12 anunciantes disponíveis para esse slot.", impact: "+R$ 180/mês estimado", cta: "Ativar horário premium" },
  { type: "anunciante", icon: Users, color: "#22C55E", title: "Banco Itaú quer seu inventário", desc: "Campanha de 90 dias disponível para telas em padarias de São Paulo. CPM R$ 12,00.", impact: "+R$ 240/mês estimado", cta: "Ver proposta" },
  { type: "conteúdo", icon: Lightbulb, color: "#FACC15", title: "Adicione promoção de fim de tarde", desc: "Telas com conteúdo próprio no horário 16h–18h têm 3x mais engajamento.", impact: "+34% visualizações", cta: "Criar promoção" },
  { type: "previsão", icon: TrendingUp, color: "#FF6B00", title: "Potencial não realizado: R$ 320/mês", desc: "Com 3 melhorias simples, sua receita pode chegar a R$ 1.167/mês nos próximos 90 dias.", impact: "R$ 1.167/mês em Set/26", cta: "Ver plano completo" },
];

const lostRevenue = [
  { reason: "Tela offline (4h)", value: "R$ 28,00", color: "#EF4444" },
  { reason: "Fill rate baixo 06h–08h", value: "R$ 42,00", color: "#F59E0B" },
  { reason: "Conteúdo sem anunciante", value: "R$ 15,00", color: "#94A3B8" },
];

interface AIRevenueCenterProps { onBack: () => void; }

export default function AIRevenueCenter({ onBack }: AIRevenueCenterProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "oportunidades" | "anunciantes" | "previsao">("overview");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg }}>
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #00A8FF)" }}>
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">AI Revenue Center</h1>
              <p className="text-xs" style={{ color: dark.sub }}>Inteligência artificial para maximizar sua receita · atualizado agora</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ backgroundColor: "#00A8FF20", color: "#00A8FF" }}>
            <Sparkles size={11} className="animate-pulse" /> IA Ativa
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border" style={{ color: dark.sub, borderColor: dark.border }}>
            <RefreshCw size={12} /> Atualizar análise
          </button>
        </div>
      </header>

      <div className="border-b px-6 flex gap-1" style={{ borderColor: dark.border, background: dark.card }}>
        {[
          { id: "overview", label: "Visão Geral" },
          { id: "oportunidades", label: "Oportunidades" },
          { id: "anunciantes", label: "Anunciantes Recomendados" },
          { id: "previsao", label: "Previsão Financeira" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-all"
            style={activeTab === tab.id ? { color: "#00A8FF", borderColor: "#00A8FF" } : { color: dark.sub, borderColor: "transparent" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { label: "Receita Prevista (Jul)", value: "R$ 980", icon: TrendingUp, color: "#22C55E", change: "+15.7%" },
                { label: "Receita Perdida (Jun)", value: "R$ 85", icon: TrendingDown, color: "#EF4444", change: "3 causas" },
                { label: "Oportunidades", value: "7", icon: Target, color: "#FACC15", change: "abertas" },
                { label: "Anunciantes Recom.", value: "4", icon: Users, color: "#00A8FF", change: "match alto" },
                { label: "Taxa de Ocupação", value: "68%", icon: BarChart2, color: "#FF6B00", change: "+12pp possível" },
                { label: "Fill Rate", value: "71%", icon: Activity, color: "#8B5CF6", change: "meta: 85%" },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-4 border flex flex-col gap-2" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: dark.sub }}>{k.label}</span>
                    <k.icon size={14} style={{ color: k.color }} />
                  </div>
                  <p className="font-bold text-lg text-white">{k.value}</p>
                  <p className="text-xs" style={{ color: k.color }}>{k.change}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} style={{ color: "#00A8FF" }} />
                <h3 className="font-semibold text-white">Sugestões da IA</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono ml-auto" style={{ background: "#00A8FF20", color: "#00A8FF" }}>4 recomendações</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="rounded-xl p-5 border hover:border-opacity-60 transition-all cursor-pointer group" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}18` }}>
                        <s.icon size={18} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white mb-1">{s.title}</p>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: dark.sub }}>{s.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${s.color}18`, color: s.color }}>{s.impact}</span>
                          <button className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }}>{s.cta} <ChevronRight size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} style={{ color: "#EF4444" }} />
                <h3 className="font-semibold text-white">Receita Perdida este mês</h3>
                <span className="font-bold text-sm ml-auto" style={{ color: "#EF4444" }}>R$ 85,00</span>
              </div>
              <div className="space-y-2">
                {lostRevenue.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: dark.bg }}>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: r.color }} /><span className="text-sm text-white">{r.reason}</span></div>
                    <span className="font-mono font-bold text-sm" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 rounded-lg text-xs font-semibold border" style={{ color: "#EF4444", borderColor: "#EF444430" }}>Ver plano de recuperação</button>
            </div>
          </>
        )}

        {activeTab === "oportunidades" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                <h3 className="font-semibold text-white mb-1">Fill Rate por Horário</h3>
                <p className="text-xs mb-4" style={{ color: dark.sub }}>Slots com oportunidade (laranja) vs preenchidos (azul)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourlyOpportunity} barGap={2}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${dark.border}`, background: dark.card, color: "#CBD5E1", fontSize: 11 }} />
                    <Bar key="bar-fill" dataKey="fill" name="Preenchido" fill="#00A8FF" radius={[3, 3, 0, 0]} />
                    <Bar key="bar-opp" dataKey="opp" name="Oportunidade" fill="#FF6B00" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                <h3 className="font-semibold text-white mb-1">Oportunidades por Dia</h3>
                <p className="text-xs mb-4" style={{ color: dark.sub }}>Potencial de receita não capturada</p>
                <div className="space-y-2">
                  {[
                    { day: "Segunda", opp: "R$ 22", pct: 75, color: "#22C55E" },
                    { day: "Terça", opp: "R$ 18", pct: 60, color: "#22C55E" },
                    { day: "Quarta", opp: "R$ 25", pct: 83, color: "#FACC15" },
                    { day: "Quinta", opp: "R$ 12", pct: 40, color: "#22C55E" },
                    { day: "Sexta", opp: "R$ 8", pct: 26, color: "#22C55E" },
                    { day: "Sábado", opp: "R$ 31", pct: 100, color: "#EF4444" },
                    { day: "Domingo", opp: "R$ 29", pct: 96, color: "#EF4444" },
                  ].map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "#94A3B8" }}>{d.day}</span>
                        <span className="font-mono font-bold" style={{ color: d.color }}>{d.opp} potencial</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: dark.bg }}>
                        <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
              <h3 className="font-semibold text-white mb-4">Ações Recomendadas pela IA</h3>
              <div className="space-y-3">
                {[
                  { prio: "Alta", action: "Ativar slot das 20h–22h", impact: "+R$ 62/mês", effort: "5 min", icon: Zap, color: "#EF4444" },
                  { prio: "Alta", action: "Aceitar proposta Banco Itaú", impact: "+R$ 240/mês", effort: "1 clique", icon: CheckCircle2, color: "#22C55E" },
                  { prio: "Média", action: "Adicionar promoção de fim de semana", impact: "+R$ 45/mês", effort: "15 min", icon: Lightbulb, color: "#FACC15" },
                  { prio: "Baixa", action: "Ajustar freqüência de exibição", impact: "+R$ 18/mês", effort: "2 min", icon: RefreshCw, color: "#00A8FF" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors" style={{ background: dark.bg }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}><a.icon size={16} style={{ color: a.color }} /></div>
                    <div className="flex-1"><p className="text-sm font-semibold text-white">{a.action}</p><p className="text-xs" style={{ color: dark.sub }}>Esforço: {a.effort}</p></div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: a.color }}>{a.impact}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: a.prio === "Alta" ? "#EF444420" : a.prio === "Média" ? "#FACC1520" : "#00A8FF20", color: a.prio === "Alta" ? "#EF4444" : a.prio === "Média" ? "#FACC15" : "#00A8FF" }}>{a.prio}</span>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/5 shrink-0" style={{ color: dark.sub }}><ChevronRight size={15} /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "anunciantes" && (
          <>
            <div className="rounded-xl p-5 border mb-2" style={{ background: dark.cardElevated, borderColor: dark.border }}>
              <div className="flex items-center gap-3 mb-1"><Brain size={16} style={{ color: "#00A8FF" }} /><p className="text-sm font-semibold text-white">A IA analisou 2.847 anunciantes ativos na rede DOOHPLAY</p></div>
              <p className="text-xs" style={{ color: dark.sub }}>e selecionou os 4 com maior probabilidade de aceitar sua tela com base em localização, horários, público e histórico de campanhas.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {recommendedAdvertisers.map((adv, i) => (
                <div key={i} className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold text-white" style={{ background: `${adv.color}25` }}>{adv.name[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-white">{adv.name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${adv.color}20`, color: adv.color }}>{adv.category}</span>
                      </div>
                      <p className="text-xs" style={{ color: dark.sub }}>{adv.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold" style={{ color: adv.color }}>{adv.match}%</p>
                      <p className="text-[10px]" style={{ color: dark.sub }}>match</p>
                    </div>
                  </div>
                  <div className="mb-4"><div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: dark.bg }}><div className="h-full rounded-full" style={{ width: `${adv.match}%`, background: adv.color }} /></div></div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs" style={{ color: dark.sub }}>Receita estimada</p><p className="font-bold text-sm" style={{ color: "#22C55E" }}>{adv.estimatedRevenue}</p></div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: adv.color }}>Ver proposta <ChevronRight size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "previsao" && (
          <>
            <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Projeção de Receita — 9 meses</h3>
                  <p className="text-xs" style={{ color: dark.sub }}>Histórico + previsão da IA com base em tendências da rede</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}><span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} /> Real</span>
                  <span className="flex items-center gap-1.5" style={{ color: "#00A8FF" }}><span className="w-2 h-2 rounded-full" style={{ background: "#00A8FF" }} /> IA Previsto</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={forecastData}>
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v: number, name: string) => [`R$ ${v}`, name === "atual" ? "Real" : "IA Previsto"]} contentStyle={{ borderRadius: 8, border: `1px solid ${dark.border}`, background: dark.card, color: "#CBD5E1", fontSize: 11 }} />
                  <Line key="line-atual" type="monotone" dataKey="atual" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 4 }} connectNulls={false} />
                  <Line key="line-previsto" type="monotone" dataKey="previsto" stroke="#00A8FF" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { mes: "Jul/26", valor: "R$ 980", status: "Previsto", change: "+15.7%", color: "#00A8FF" },
                { mes: "Ago/26", valor: "R$ 1.120", status: "Estimado", change: "+14.3%", color: "#22C55E" },
                { mes: "Set/26", valor: "R$ 1.240", status: "Projetado", change: "+10.7%", color: "#22C55E" },
              ].map((p, i) => (
                <div key={i} className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
                  <p className="text-xs mb-2" style={{ color: dark.sub }}>{p.mes}</p>
                  <p className="text-3xl font-extrabold text-white mb-1">{p.valor}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${p.color}20`, color: p.color }}>{p.status}</span>
                    <span className="text-xs" style={{ color: "#22C55E" }}>{p.change}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-5 border" style={{ background: dark.cardElevated, borderColor: dark.border }}>
              <h3 className="font-semibold text-white mb-4">Cenários de Crescimento</h3>
              <div className="space-y-4">
                {[
                  { scenario: "Conservador", desc: "Sem nenhuma ação adicional", set: "R$ 900", color: "#94A3B8" },
                  { scenario: "Base (IA)", desc: "Seguindo 2 sugestões da IA", set: "R$ 1.240", color: "#00A8FF", highlight: true },
                  { scenario: "Otimista", desc: "Todas as sugestões implementadas", set: "R$ 1.580", color: "#22C55E" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: s.highlight ? `${s.color}10` : dark.bg, border: s.highlight ? `1px solid ${s.color}30` : `1px solid transparent` }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <div className="flex-1"><p className="text-sm font-semibold text-white">{s.scenario}</p><p className="text-xs" style={{ color: dark.sub }}>{s.desc}</p></div>
                    <p className="font-extrabold" style={{ color: s.color }}>{s.set}</p>
                    {s.highlight && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${s.color}25`, color: s.color }}>Recomendado</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
