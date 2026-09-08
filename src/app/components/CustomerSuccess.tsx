import { useState } from "react";
import { HeartHandshake, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Users, DollarSign, Star, ChevronRight, Plus } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
  gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

type HealthTier = "healthy" | "at-risk" | "critical";

interface Customer {
  id: string;
  name: string;
  plan: string;
  mrr: number;
  health: number;
  tier: HealthTier;
  nps: number;
  daysToRenewal: number;
  screens: number;
  lastLogin: string;
  csm: string;
  expansionPotential: number;
}

const CUSTOMERS: Customer[] = [
  { id: "C001", name: "Grupo Pão de Açúcar", plan: "Enterprise+", mrr: 18400, health: 94, tier: "healthy",  nps: 9, daysToRenewal: 187, screens: 412, lastLogin: "Hoje",    csm: "Camila S.",  expansionPotential: 8200 },
  { id: "C002", name: "Rede Globo Digital",   plan: "Enterprise",  mrr: 12800, health: 87, tier: "healthy",  nps: 8, daysToRenewal: 94,  screens: 287, lastLogin: "Ontem",   csm: "Rafael M.",  expansionPotential: 4200 },
  { id: "C003", name: "Localfrio Networks",   plan: "Pro",         mrr: 4200,  health: 58, tier: "at-risk",  nps: 6, daysToRenewal: 22,  screens: 64,  lastLogin: "8 dias",  csm: "Ana P.",     expansionPotential: 1800 },
  { id: "C004", name: "Via Varejo OOH",        plan: "Enterprise",  mrr: 9600,  health: 72, tier: "at-risk",  nps: 7, daysToRenewal: 45,  screens: 184, lastLogin: "3 dias",  csm: "Diego F.",   expansionPotential: 3400 },
  { id: "C005", name: "Burger King BR",        plan: "Pro+",        mrr: 6100,  health: 91, tier: "healthy",  nps: 9, daysToRenewal: 142, screens: 127, lastLogin: "Hoje",    csm: "Camila S.",  expansionPotential: 2900 },
  { id: "C006", name: "MetroAds SP",           plan: "Starter",     mrr: 1800,  health: 31, tier: "critical", nps: 4, daysToRenewal: 9,   screens: 18,  lastLogin: "14 dias", csm: "Rafael M.",  expansionPotential: 0 },
  { id: "C007", name: "ShoppingBrasil",        plan: "Pro",         mrr: 3900,  health: 44, tier: "at-risk",  nps: 5, daysToRenewal: 31,  screens: 52,  lastLogin: "6 dias",  csm: "Ana P.",     expansionPotential: 1200 },
  { id: "C008", name: "Estapar Mídia",         plan: "Pro+",        mrr: 5200,  health: 89, tier: "healthy",  nps: 8, daysToRenewal: 201, screens: 98,  lastLogin: "Hoje",    csm: "Diego F.",   expansionPotential: 2100 },
];

const NPS_DATA = [
  { mes: "Mar", promotores: 62, neutros: 24, detratores: 14, nps: 48 },
  { mes: "Abr", promotores: 65, neutros: 22, detratores: 13, nps: 52 },
  { mes: "Mai", promotores: 68, neutros: 21, detratores: 11, nps: 57 },
  { mes: "Jun", promotores: 71, neutros: 20, detratores: 9,  nps: 62 },
  { mes: "Jul", promotores: 74, neutros: 18, detratores: 8,  nps: 66 },
  { mes: "Ago", promotores: 76, neutros: 17, detratores: 7,  nps: 69 },
];

const TASKS = [
  { id: 1, priority: "high",   customer: "MetroAds SP",        action: "Ligar urgente — risco de churn em 9 dias",             due: "Hoje",    done: false },
  { id: 2, priority: "high",   customer: "Localfrio Networks",  action: "QBR de renovação — proposta de desconto 15%",          due: "Amanhã",  done: false },
  { id: 3, priority: "medium", customer: "ShoppingBrasil",      action: "Treinamento avançado de campanhas",                     due: "Qui",     done: false },
  { id: 4, priority: "medium", customer: "Via Varejo OOH",       action: "Revisão de uso — 28% do inventário subutilizado",      due: "Sex",     done: true  },
  { id: 5, priority: "low",    customer: "Rede Globo Digital",   action: "Apresentar módulo ESG novo — potencial upsell",        due: "Seg",     done: false },
  { id: 6, priority: "low",    customer: "Estapar Mídia",        action: "Case study para marketing — cliente satisfeito",       due: "Seg",     done: false },
];

const tierColor = (t: HealthTier) => t === "healthy" ? T.success : t === "at-risk" ? T.warning : T.danger;
const tierLabel = (t: HealthTier) => ({ healthy: "Saudável", "at-risk": "Em Risco", critical: "Crítico" })[t];
const priorityColor = (p: string) => p === "high" ? T.danger : p === "medium" ? T.warning : T.textSub;

export default function CustomerSuccess({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "customers" | "nps" | "tasks">("overview");
  const [filterTier, setFilterTier] = useState<HealthTier | "all">("all");
  const [tasks, setTasks] = useState(TASKS);

  const totalMRR = CUSTOMERS.reduce((s, c) => s + c.mrr, 0);
  const atRisk = CUSTOMERS.filter(c => c.tier === "at-risk" || c.tier === "critical");
  const atRiskMRR = atRisk.reduce((s, c) => s + c.mrr, 0);
  const expansionMRR = CUSTOMERS.reduce((s, c) => s + c.expansionPotential, 0);
  const avgHealth = Math.round(CUSTOMERS.reduce((s, c) => s + c.health, 0) / CUSTOMERS.length);
  const filtered = filterTier === "all" ? CUSTOMERS : CUSTOMERS.filter(c => c.tier === filterTier);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.success}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HeartHandshake size={20} color={T.success} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Customer Success</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Saúde de clientes, NPS e oportunidades de expansão</p>
          </div>
        </div>
        <button style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Nova Tarefa CS
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "MRR Total Gerenciado", value: `R$ ${(totalMRR / 1000).toFixed(0)}k`, color: T.gold },
          { label: "Saúde Média", value: `${avgHealth}`, color: avgHealth > 75 ? T.success : T.warning },
          { label: "MRR em Risco", value: `R$ ${(atRiskMRR / 1000).toFixed(0)}k`, color: T.danger },
          { label: "Potencial Expansão", value: `R$ ${(expansionMRR / 1000).toFixed(0)}k`, color: T.accent },
          { label: "NPS Atual", value: "69", color: T.success },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: "16px 18px", border: `1px solid ${k.color}22` }}>
            <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["overview", "customers", "nps", "tasks"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent", color: tab === t ? T.text : T.textSub,
          }}>
            {{ overview: "Visão Geral", customers: "Clientes", nps: "NPS & CSAT", tasks: `Tarefas (${tasks.filter(t => !t.done).length})` }[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Distribuição de Saúde</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(["healthy", "at-risk", "critical"] as HealthTier[]).map(tier => {
                  const count = CUSTOMERS.filter(c => c.tier === tier).length;
                  const mrr = CUSTOMERS.filter(c => c.tier === tier).reduce((s, c) => s + c.mrr, 0);
                  return (
                    <div key={tier}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: tierColor(tier) }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{tierLabel(tier)}</span>
                          <span style={{ fontSize: 12, color: T.textSub }}>{count} clientes</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: tierColor(tier) }}>R$ {(mrr / 1000).toFixed(0)}k MRR</span>
                      </div>
                      <div style={{ height: 8, background: `${T.textSub}22`, borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${(count / CUSTOMERS.length) * 100}%`, background: tierColor(tier), borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 20 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={CUSTOMERS.map(c => ({ name: c.name.split(" ")[0], health: c.health, color: tierColor(c.tier) }))} margin={{ left: -20 }}>
                    <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                    <Bar dataKey="health" radius={[3, 3, 0, 0]}>
                      {CUSTOMERS.map((c, i) => <Cell key={i} fill={tierColor(c.tier)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Ação Imediata Necessária</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CUSTOMERS.filter(c => c.tier !== "healthy").sort((a, b) => a.daysToRenewal - b.daysToRenewal).map(c => (
                  <div key={c.id} style={{ background: T.card, borderRadius: 10, padding: 14, border: `1px solid ${tierColor(c.tier)}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: `${tierColor(c.tier)}22`, color: tierColor(c.tier), fontWeight: 600 }}>{tierLabel(c.tier)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textSub }}>
                        R$ {(c.mrr / 1000).toFixed(1)}k MRR · {c.daysToRenewal}d renovação · CSM: {c.csm}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: tierColor(c.tier) }}>{c.health}</div>
                      <div style={{ fontSize: 10, color: T.textSub }}>health score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Oportunidades de Expansão</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {CUSTOMERS.filter(c => c.expansionPotential > 0).sort((a, b) => b.expansionPotential - a.expansionPotential).slice(0, 4).map(c => (
                <div key={c.id} style={{ background: T.card, borderRadius: 10, padding: 14, border: `1px solid ${T.accent}22` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 8px" }}>{c.plan} → upgrade</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: T.accent, margin: 0 }}>+R$ {(c.expansionPotential / 1000).toFixed(1)}k</p>
                  <p style={{ fontSize: 10, color: T.textSub, margin: "2px 0 0" }}>MRR potencial</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.textSub}18`, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.textSub}22`, display: "flex", gap: 8 }}>
            {(["all", "healthy", "at-risk", "critical"] as const).map(f => (
              <button key={f} onClick={() => setFilterTier(f)} style={{
                padding: "5px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: filterTier === f ? T.card : "transparent", color: filterTier === f ? T.text : T.textSub,
              }}>
                {{ all: "Todos", healthy: "Saudáveis", "at-risk": "Em Risco", critical: "Críticos" }[f]}
              </button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Cliente", "Plano", "MRR", "Health", "NPS", "Telas", "Renovação", "Último Login", "CSM", "Expansão"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: T.textSub, fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${T.textSub}18` }}>
                    <td style={{ padding: "11px 14px", fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: "11px 14px", color: T.textSub }}>{c.plan}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 700, color: T.gold }}>R$ {(c.mrr / 1000).toFixed(1)}k</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 36, height: 5, background: `${T.textSub}22`, borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${c.health}%`, background: tierColor(c.tier), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: tierColor(c.tier) }}>{c.health}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <div key={n} style={{ width: 5, height: 14, borderRadius: 2, background: n <= c.nps ? (c.nps >= 9 ? T.success : c.nps >= 7 ? T.warning : T.danger) : `${T.textSub}33` }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", color: T.textSub }}>{c.screens}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ color: c.daysToRenewal <= 30 ? T.danger : c.daysToRenewal <= 60 ? T.warning : T.success, fontWeight: 600 }}>{c.daysToRenewal}d</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: T.textSub }}>{c.lastLogin}</td>
                    <td style={{ padding: "11px 14px", color: T.textSub }}>{c.csm}</td>
                    <td style={{ padding: "11px 14px", color: c.expansionPotential > 0 ? T.accent : T.textSub, fontWeight: 600 }}>
                      {c.expansionPotential > 0 ? `+R$ ${(c.expansionPotential / 1000).toFixed(1)}k` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "nps" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Evolução NPS e Categorias</h3>
            <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 20px" }}>Promotores − Detratores = NPS</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={NPS_DATA} margin={{ left: -10 }}>
                <XAxis dataKey="mes" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any, n: any) => [`${v}%`, n]} />
                <Bar dataKey="promotores" stackId="a" fill={T.success} name="Promotores %" radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutros" stackId="a" fill={T.warning} name="Neutros %" />
                <Bar dataKey="detratores" stackId="a" fill={T.danger} name="Detratores %" radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="nps" stroke={T.primary} strokeWidth={2.5} dot={{ r: 4, fill: T.primary }} name="NPS" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "NPS Atual",     value: "69",  sub: "World-class (>50)", color: T.success },
              { label: "Promotores",    value: "76%", sub: "nota 9-10",         color: T.success },
              { label: "Neutros",       value: "17%", sub: "nota 7-8",          color: T.warning },
              { label: "Detratores",    value: "7%",  sub: "nota 0-6",          color: T.danger  },
              { label: "Respostas/mês", value: "384", sub: "taxa 71%",           color: T.primary },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 10, padding: 16, border: `1px solid ${k.color}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 11, color: T.textSub, margin: 0 }}>{k.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: k.color, margin: "4px 0 0" }}>{k.value}</p>
                    <p style={{ fontSize: 10, color: T.textSub, margin: "2px 0 0" }}>{k.sub}</p>
                  </div>
                  <Star size={18} color={k.color} opacity={0.6} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((task, i) => (
            <div key={task.id} style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${task.done ? T.textSub + "18" : priorityColor(task.priority) + "33"}`, display: "flex", alignItems: "center", gap: 14, opacity: task.done ? 0.6 : 1 }}>
              <div onClick={() => setTasks(prev => prev.map((t, j) => j === i ? { ...t, done: !t.done } : t))}
                style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? T.success : priorityColor(task.priority)}`, background: task.done ? `${T.success}22` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {task.done && <CheckCircle size={12} color={T.success} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textDecoration: task.done ? "line-through" : "none" }}>{task.action}</span>
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: `${priorityColor(task.priority)}22`, color: priorityColor(task.priority), fontWeight: 600 }}>
                    {{ high: "Alta", medium: "Média", low: "Baixa" }[task.priority]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.textSub }}>{task.customer} · Prazo: {task.due}</div>
              </div>
              <ChevronRight size={16} color={T.textSub} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
