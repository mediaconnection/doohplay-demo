import { useState } from "react";
import {
  ArrowLeft, Shield, FileCheck, AlertTriangle, CheckCircle, XCircle,
  Clock, Download, Eye, RefreshCw, Lock, UserCheck, Database,
  ChevronRight, X, Zap, BarChart2, TrendingUp, Calendar
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type IssueLevel = "critical" | "warning" | "info" | "ok";
type AuditStatus = "passed" | "failed" | "partial" | "pending";

interface ComplianceItem {
  id: string;
  category: string;
  rule: string;
  description: string;
  level: IssueLevel;
  status: AuditStatus;
  lastChecked: string;
  regulation: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  resource: string;
  result: "success" | "blocked" | "warning";
}

const LEVEL_META: Record<IssueLevel, { label: string; color: string; icon: any }> = {
  critical: { label: "Crítico",  color: T.danger,  icon: XCircle      },
  warning:  { label: "Atenção",  color: T.warning, icon: AlertTriangle },
  info:     { label: "Info",     color: T.primary, icon: Eye           },
  ok:       { label: "OK",       color: T.success, icon: CheckCircle   },
};

const AUDIT_META: Record<AuditStatus, { label: string; color: string }> = {
  passed:  { label: "Aprovado",  color: T.success },
  failed:  { label: "Falhou",    color: T.danger  },
  partial: { label: "Parcial",   color: T.warning },
  pending: { label: "Pendente",  color: T.textSub },
};

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: "C01", category: "LGPD",   rule: "Consentimento explícito",        description: "Todo usuário deve consentir explicitamente antes da coleta de dados pessoais",         level: "ok",       status: "passed",  lastChecked: "23/07 06:00", regulation: "LGPD Art. 7" },
  { id: "C02", category: "LGPD",   rule: "Direito ao esquecimento",        description: "Usuários devem poder solicitar exclusão de dados em até 15 dias",                       level: "ok",       status: "passed",  lastChecked: "22/07 18:00", regulation: "LGPD Art. 18" },
  { id: "C03", category: "LGPD",   rule: "Política de retenção de dados",  description: "Dados de leads não devem ser armazenados por mais de 5 anos sem nova confirmação",     level: "warning",  status: "partial", lastChecked: "21/07 09:00", regulation: "LGPD Art. 15" },
  { id: "C04", category: "LGPD",   rule: "DPO designado",                  description: "A plataforma deve ter um Encarregado de Proteção de Dados registrado",                  level: "ok",       status: "passed",  lastChecked: "01/07 00:00", regulation: "LGPD Art. 41" },
  { id: "C05", category: "CONAR",  rule: "Publicidade de alimentos",       description: "Anúncios de alimentos infantis devem respeitar restrições do CONAR",                    level: "ok",       status: "passed",  lastChecked: "22/07 14:00", regulation: "CONAR Anexo H" },
  { id: "C06", category: "CONAR",  rule: "Claims exagerados",              description: "Verificar ausência de afirmações não comprováveis nos criativos veiculados",             level: "warning",  status: "partial", lastChecked: "23/07 08:00", regulation: "CONAR Art. 27" },
  { id: "C07", category: "CONAR",  rule: "Publicidade de bebidas alcoólicas",description: "Anúncios de álcool não podem ser exibidos próximos a escolas ou para menores",        level: "ok",       status: "passed",  lastChecked: "23/07 00:00", regulation: "CONAR Seção 2" },
  { id: "C08", category: "Segurança",rule: "Criptografia em trânsito",     description: "Todas as APIs devem usar TLS 1.2+ para comunicações",                                   level: "ok",       status: "passed",  lastChecked: "23/07 00:00", regulation: "ISO 27001 A.14" },
  { id: "C09", category: "Segurança",rule: "Autenticação MFA",             description: "Usuários com acesso administrativo devem usar autenticação multifator",                  level: "critical", status: "failed",  lastChecked: "23/07 09:30", regulation: "ISO 27001 A.9" },
  { id: "C10", category: "Segurança",rule: "Auditoria de acessos",         description: "Logs de acesso devem ser retidos por no mínimo 12 meses",                               level: "ok",       status: "passed",  lastChecked: "23/07 00:00", regulation: "SOC 2 CC7.2" },
  { id: "C11", category: "Fiscal",  rule: "Emissão de NFS-e",              description: "Todas as transações acima de R$100 devem gerar nota fiscal de serviços eletrônica",     level: "ok",       status: "passed",  lastChecked: "23/07 06:00", regulation: "Lei 14.195/2021" },
  { id: "C12", category: "Fiscal",  rule: "ISS recolhido",                 description: "ISS de 5% deve ser recolhido mensalmente sobre serviços prestados",                      level: "info",     status: "pending", lastChecked: "01/07 00:00", regulation: "LC 116/2003" },
];

const AUDIT_LOGS: AuditLog[] = [
  { id: "AL001", action: "Exportação de dados de leads",    user: "carlos@mediahub.com.br",  timestamp: "23/07 10:14", ip: "189.20.x.x",  resource: "leads_export.csv",    result: "success" },
  { id: "AL002", action: "Acesso negado — RLS violation",   user: "unknown@ext.com",          timestamp: "23/07 09:58", ip: "201.5.x.x",   resource: "supabase/billing",    result: "blocked" },
  { id: "AL003", action: "Alteração de política de privacidade", user: "admin@doohplay.com.br", timestamp: "23/07 08:30", ip: "177.10.x.x", resource: "policy_v3.pdf",      result: "success" },
  { id: "AL004", action: "Tentativa de login — MFA falhou", user: "juliana@agency.com.br",   timestamp: "23/07 07:45", ip: "200.15.x.x",  resource: "auth/mfa",            result: "warning" },
  { id: "AL005", action: "Download de relatório financeiro", user: "billing@doohplay.com.br", timestamp: "22/07 18:00", ip: "177.10.x.x",  resource: "report_financeiro.pdf",result: "success"},
  { id: "AL006", action: "Exclusão de dados de usuário (LGPD)", user: "dpo@doohplay.com.br",timestamp: "22/07 15:30", ip: "177.10.x.x",  resource: "user_id:8821",        result: "success" },
];

const SCORE_TREND = [
  { month: "Fev", score: 71 }, { month: "Mar", score: 76 },
  { month: "Abr", score: 79 }, { month: "Mai", score: 82 },
  { month: "Jun", score: 84 }, { month: "Jul", score: 87 },
];

const CATEGORIES = ["LGPD","CONAR","Segurança","Fiscal"];

export default function ComplianceCenter({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"overview" | "audit" | "logs">("overview");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ComplianceItem | null>(null);

  const filtered = catFilter === "all" ? COMPLIANCE_ITEMS : COMPLIANCE_ITEMS.filter(c => c.category === catFilter);

  const passed   = COMPLIANCE_ITEMS.filter(c => c.status === "passed").length;
  const failed   = COMPLIANCE_ITEMS.filter(c => c.status === "failed").length;
  const partial  = COMPLIANCE_ITEMS.filter(c => c.status === "partial").length;
  const score    = Math.round((passed + partial * 0.5) / COMPLIANCE_ITEMS.length * 100);

  const LOG_RESULT_COLOR: Record<"success"|"blocked"|"warning", string> = {
    success: T.success, blocked: T.danger, warning: T.warning,
  };
  const LOG_RESULT_LABEL: Record<"success"|"blocked"|"warning", string> = {
    success: "Sucesso", blocked: "Bloqueado", warning: "Atenção",
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Shield size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Compliance Center</h1>
                <p className="text-xs" style={{ color: T.textSub }}>LGPD · CONAR · Segurança · Fiscal — conformidade regulatória completa</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["overview","audit","logs"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.success + "20" : "transparent", color: tab === t ? T.success : T.textSub, border: `1px solid ${tab === t ? T.success + "30" : "transparent"}` }}>
                {t === "overview" ? "Visão Geral" : t === "audit" ? "Auditoria" : "Logs de Acesso"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Score de Conformidade", value: `${score}%`,   color: score >= 80 ? T.success : T.warning, icon: Shield    },
            { label: "Aprovados",             value: passed,         color: T.success,                          icon: CheckCircle },
            { label: "Falhos / Críticos",     value: failed,         color: T.danger,                           icon: XCircle   },
            { label: "Parciais",              value: partial,        color: T.warning,                          icon: AlertTriangle },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Score de Conformidade — 6 meses</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Evolução da pontuação regulatória</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={SCORE_TREND}>
                    <defs>
                      <linearGradient key="grad-score" id="grad-score" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.success} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`, "Score"]} />
                    <Area key="area-score" type="monotone" dataKey="score" stroke={T.success} fill="url(#grad-score)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Por Categoria</h3>
                {CATEGORIES.map(cat => {
                  const items = COMPLIANCE_ITEMS.filter(c => c.category === cat);
                  const p = items.filter(c => c.status === "passed").length;
                  const f = items.filter(c => c.status === "failed").length;
                  const pr = items.filter(c => c.status === "partial").length;
                  const pct = Math.round((p + pr * 0.5) / items.length * 100);
                  return (
                    <div key={cat} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">{cat}</span>
                        <div className="flex items-center gap-2">
                          {f > 0 && <span className="text-xs font-black" style={{ color: T.danger }}>{f} falha(s)</span>}
                          <span className="text-xs font-black" style={{ color: pct >= 80 ? T.success : T.warning }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? T.success : T.warning }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Itens que Requerem Ação</h3>
                <div className="space-y-3">
                  {COMPLIANCE_ITEMS.filter(c => c.status !== "passed").map(item => {
                    const lm = LEVEL_META[item.level];
                    const am = AUDIT_META[item.status];
                    const LIcon = lm.icon;
                    return (
                      <div key={item.id}
                        onClick={() => setSelected(selected?.id === item.id ? null : item)}
                        className="p-3 rounded-xl border cursor-pointer hover:bg-white/3 transition-all"
                        style={{ background: T.panel, borderColor: selected?.id === item.id ? lm.color + "50" : T.border + "60" }}>
                        <div className="flex items-start gap-3">
                          <LIcon size={15} style={{ color: lm.color, flexShrink: 0, marginTop: 1 }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{item.rule}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                                style={{ background: am.color + "20", color: am.color }}>{am.label}</span>
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                              {item.category} · {item.regulation}
                            </div>
                          </div>
                        </div>
                        {selected?.id === item.id && (
                          <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: T.border, color: T.textSub }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Ações Rápidas</h3>
                <div className="space-y-2">
                  {[
                    { label: "Gerar Relatório LGPD",    icon: Download,   color: T.primary },
                    { label: "Forçar Revisão MFA",      icon: Lock,       color: T.danger  },
                    { label: "Exportar Logs de Auditoria",icon: Database,  color: T.gold    },
                    { label: "Verificar Conformidade CONAR", icon: FileCheck, color: T.success },
                  ].map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <button key={i} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left"
                        style={{ background: a.color + "10", color: a.color, border: `1px solid ${a.color}20` }}>
                        <Icon size={14} />
                        {a.label}
                        <ChevronRight size={12} className="ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {(["all", ...CATEGORIES] as string[]).map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: catFilter === cat ? T.success + "20" : T.card, color: catFilter === cat ? T.success : T.textSub, border: `1px solid ${catFilter === cat ? T.success + "30" : T.border}` }}>
                  {cat === "all" ? "Todos" : cat}
                </button>
              ))}
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ml-auto"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                <RefreshCw size={11} /> Auditar agora
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                    {["Regra","Categoria","Regulação","Último Check","Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const lm = LEVEL_META[item.level];
                    const am = AUDIT_META[item.status];
                    const LIcon = lm.icon;
                    return (
                      <tr key={item.id} className="border-b hover:bg-white/3 transition-colors"
                        style={{ borderColor: T.border + "50" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <LIcon size={13} style={{ color: lm.color }} />
                            <span className="font-bold text-xs">{item.rule}</span>
                          </div>
                          <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: T.textSub }}>{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{item.category}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: T.textSub }}>{item.regulation}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{item.lastChecked}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: am.color + "20", color: am.color }}>{am.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Logs de Auditoria</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: T.textSub }}>Últimas 24h · 6 eventos</span>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={11} /> Exportar SIEM
                </button>
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                    {["ID","Ação","Usuário","IP","Recurso","Timestamp","Resultado"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_LOGS.map(log => {
                    const rc = LOG_RESULT_COLOR[log.result];
                    return (
                      <tr key={log.id} className="border-b hover:bg-white/3 transition-colors"
                        style={{ borderColor: T.border + "50" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: T.textSub }}>{log.id}</td>
                        <td className="px-4 py-3 text-xs font-bold">{log.action}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{log.user}</td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: T.textSub }}>{log.ip}</td>
                        <td className="px-4 py-3 text-xs truncate max-w-28 font-mono" style={{ color: T.textSub }}>{log.resource}</td>
                        <td className="px-4 py-3 text-xs">{log.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: rc + "20", color: rc }}>{LOG_RESULT_LABEL[log.result]}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>RETENÇÃO DE LOGS</div>
              <div className="flex items-center justify-between text-sm">
                <span>Logs armazenados por <strong>12 meses</strong> em conformidade com SOC 2 CC7.2</span>
                <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: T.success }}>
                  <CheckCircle size={11} /> Conforme
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
