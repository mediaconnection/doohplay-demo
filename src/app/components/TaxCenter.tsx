import { useState } from "react";
import {
  ArrowLeft, FileText, DollarSign, Download, CheckCircle, AlertCircle,
  Clock, ChevronRight, TrendingUp, Building2, Calendar, Zap,
  Shield, RefreshCw, ExternalLink, Info
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type TaxStatus = "emitida" | "pendente" | "atrasada" | "cancelada";
type DocType = "nfse" | "das" | "informe" | "recibo";

interface Invoice {
  id: string;
  type: DocType;
  number: string;
  description: string;
  value: number;
  competence: string;
  issueDate: string;
  dueDate?: string;
  status: TaxStatus;
  advertiser?: string;
  cnpj?: string;
  pdfReady: boolean;
}

interface MonthSummary {
  month: string;
  revenue: number;
  nfseCount: number;
  dasValue: number;
  status: "ok" | "pending" | "overdue";
}

const INVOICES: Invoice[] = [
  { id: "i1",  type: "nfse",    number: "NFS-e 0042", description: "Serviços de publicidade DOOH — AutoFinance SA",        value: 2400,  competence: "Jul/2026", issueDate: "01/07/2026", status: "emitida",  advertiser: "AutoFinance SA",       cnpj: "98.765.432/0001-10", pdfReady: true  },
  { id: "i2",  type: "nfse",    number: "NFS-e 0041", description: "Serviços de publicidade DOOH — TechStore Brasil",       value: 4200,  competence: "Jun/2026", issueDate: "01/06/2026", status: "emitida",  advertiser: "TechStore Brasil",     cnpj: "12.345.678/0001-90", pdfReady: true  },
  { id: "i3",  type: "nfse",    number: "NFS-e 0040", description: "Serviços de publicidade DOOH — FitPlus Academia",       value: 960,   competence: "Jun/2026", issueDate: "01/06/2026", status: "emitida",  advertiser: "FitPlus Gym",          cnpj: "11.223.344/0001-55", pdfReady: true  },
  { id: "i4",  type: "das",     number: "DAS Jun/26", description: "Documento de Arrecadação do Simples Nacional",          value: 312,   competence: "Jun/2026", issueDate: "15/06/2026", dueDate: "20/06/2026", status: "emitida", pdfReady: true },
  { id: "i5",  type: "das",     number: "DAS Jul/26", description: "Documento de Arrecadação do Simples Nacional",          value: 372,   competence: "Jul/2026", issueDate: "15/07/2026", dueDate: "20/07/2026", status: "pendente", pdfReady: true },
  { id: "i6",  type: "nfse",    number: "NFS-e 0043", description: "Serviços de publicidade DOOH — Bradesco S.A.",          value: 0,     competence: "Jul/2026", issueDate: "—",          status: "pendente", advertiser: "Banco Bradesco",       cnpj: "60.746.948/0001-12", pdfReady: false },
  { id: "i7",  type: "informe", number: "IR 2026",    description: "Informe de Rendimentos — ano-base 2025",                value: 14820, competence: "2025",     issueDate: "28/02/2026", status: "emitida",  pdfReady: true  },
  { id: "i8",  type: "recibo",  number: "REC-0018",   description: "Recibo de pagamento — campanha iFood Delivery",          value: 1800,  competence: "Mai/2026", issueDate: "03/05/2026", status: "emitida",  advertiser: "iFood S.A.",           cnpj: "14.380.200/0001-21", pdfReady: true  },
];

const MONTHS_SUMMARY: MonthSummary[] = [
  { month: "Jan/2026", revenue: 820,  nfseCount: 1, dasValue: 98,  status: "ok"      },
  { month: "Fev/2026", revenue: 940,  nfseCount: 2, dasValue: 113, status: "ok"      },
  { month: "Mar/2026", revenue: 1080, nfseCount: 2, dasValue: 130, status: "ok"      },
  { month: "Abr/2026", revenue: 1240, nfseCount: 3, dasValue: 149, status: "ok"      },
  { month: "Mai/2026", revenue: 1640, nfseCount: 3, dasValue: 197, status: "ok"      },
  { month: "Jun/2026", revenue: 7560, nfseCount: 4, dasValue: 312, status: "ok"      },
  { month: "Jul/2026", revenue: 2400, nfseCount: 1, dasValue: 372, status: "pending" },
];

const STATUS_CFG: Record<TaxStatus, { label: string; color: string; bg: string }> = {
  emitida:   { label: "Emitida",   color: T.success, bg: T.success + "15" },
  pendente:  { label: "Pendente",  color: T.warning, bg: T.warning + "15" },
  atrasada:  { label: "Atrasada",  color: T.danger,  bg: T.danger  + "15" },
  cancelada: { label: "Cancelada", color: T.textSub, bg: T.border         },
};

const DOC_CFG: Record<DocType, { label: string; color: string; short: string }> = {
  nfse:    { label: "NFS-e",   color: T.primary, short: "NF" },
  das:     { label: "DAS",     color: T.warning,  short: "DAS"},
  informe: { label: "Informe", color: T.accent,  short: "IR" },
  recibo:  { label: "Recibo",  color: T.success, short: "REC"},
};

type Tab = "documentos" | "resumo" | "aliquotas" | "automatico";

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function TaxCenter({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>("documentos");
  const [filterType, setFilterType] = useState<DocType | "all">("all");
  const [generating, setGenerating] = useState<string | null>(null);
  const [autoNfse, setAutoNfse] = useState(true);
  const [autoDas, setAutoDas] = useState(false);

  const filtered = filterType === "all" ? INVOICES : INVOICES.filter(i => i.type === filterType);

  const totalEmitido = INVOICES.filter(i => i.status === "emitida" && i.type === "nfse").reduce((a, i) => a + i.value, 0);
  const totalPendente = INVOICES.filter(i => i.status === "pendente").length;
  const dasVencendo = INVOICES.find(i => i.type === "das" && i.status === "pendente");

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
              <FileText size={18} style={{ color: T.success }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Fiscal & Tributário</h1>
              <p className="text-xs" style={{ color: T.textSub }}>NFS-e · DAS · Simples Nacional · IR</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {totalPendente > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: T.warning + "15", color: T.warning }}>
                <AlertCircle size={11} /> {totalPendente} pendente{totalPendente > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex">
          {([[["documentos","Documentos"],["resumo","Resumo Mensal"],["aliquotas","Alíquotas"],["automatico","Automação"]]] as const).map(tabs => tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.primary : T.textSub }}>
              {label}
            </button>
          )))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "NFS-e emitidas",  value: String(INVOICES.filter(i => i.type === "nfse" && i.status === "emitida").length), color: T.success  },
            { label: "Receita NFS-e",   value: `R$${(totalEmitido / 1000).toFixed(1)}K`,                                        color: T.success  },
            { label: "DAS próximo",     value: dasVencendo ? `R$${dasVencendo.value}` : "—",                                    color: T.warning  },
            { label: "Pendências",      value: String(totalPendente),                                                           color: totalPendente > 0 ? T.danger : T.success },
          ].map((k, i) => (
            <div key={i} className="p-3.5 rounded-xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* DAS alert */}
        {dasVencendo && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: T.warning + "08", borderColor: T.warning + "30" }}>
            <AlertCircle size={20} style={{ color: T.warning }} />
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: T.warning }}>DAS vence em 20/07/2026</div>
              <div className="text-xs" style={{ color: T.textSub }}>R${dasVencendo.value} — Simples Nacional Julho/2026</div>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0"
              style={{ background: T.warning, color: "#000" }}>
              Gerar boleto
            </button>
          </div>
        )}

        {/* DOCUMENTOS */}
        {tab === "documentos" && (
          <>
            {/* Type filter */}
            <div className="flex gap-2">
              {([[["all","Todos"],["nfse","NFS-e"],["das","DAS"],["informe","Informe"],["recibo","Recibo"]]] as const).map(filters => filters.map(([k, label]) => (
                <button key={k} onClick={() => setFilterType(k as any)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: filterType === k ? T.primary + "20" : T.card,
                    color: filterType === k ? T.primary : T.textSub,
                    border: `1px solid ${filterType === k ? T.primary + "40" : T.border}`,
                  }}>
                  {label}
                </button>
              )))}
            </div>

            <div className="space-y-2">
              {filtered.map(inv => {
                const s = STATUS_CFG[inv.status];
                const d = DOC_CFG[inv.type];
                const isGenerating = generating === inv.id;
                return (
                  <div key={inv.id} className="flex items-center gap-4 p-4 rounded-2xl border"
                    style={{ background: T.card, borderColor: T.border }}>
                    {/* Type badge */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                      style={{ background: d.color + "18", color: d.color }}>
                      {d.short}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{inv.number}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: T.textSub }}>{inv.description}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: T.textSub }}>{inv.competence}</span>
                        {inv.dueDate && (
                          <span className="text-xs" style={{ color: inv.status === "atrasada" ? T.danger : T.textSub }}>
                            Vence: {inv.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {inv.value > 0 && (
                        <div className="font-black text-sm" style={{ color: T.success }}>
                          R${inv.value.toLocaleString("pt-BR")}
                        </div>
                      )}
                      {inv.status === "pendente" && !inv.pdfReady ? (
                        <button onClick={() => handleGenerate(inv.id)}
                          className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: T.primary + "20", color: T.primary }}>
                          {isGenerating
                            ? <><div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> Emitindo...</>
                            : <><Zap size={11} /> Emitir NFS-e</>
                          }
                        </button>
                      ) : inv.pdfReady ? (
                        <button className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                          <Download size={11} /> PDF
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* RESUMO MENSAL */}
        {tab === "resumo" && (
          <div className="space-y-3">
            {MONTHS_SUMMARY.map((ms, i) => (
              <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">{ms.month}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold`}
                    style={{ background: ms.status === "ok" ? T.success + "15" : T.warning + "15", color: ms.status === "ok" ? T.success : T.warning }}>
                    {ms.status === "ok" ? "✓ Completo" : "Em andamento"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs mb-1" style={{ color: T.textSub }}>Receita</div>
                    <div className="font-black" style={{ color: T.success }}>R${ms.revenue.toLocaleString("pt-BR")}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: T.textSub }}>NFS-e</div>
                    <div className="font-black">{ms.nfseCount} doc{ms.nfseCount > 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: T.textSub }}>DAS</div>
                    <div className="font-black" style={{ color: T.warning }}>R${ms.dasValue}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t" style={{ borderColor: T.border }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: T.textSub }}>
                    <span>Alíquota efetiva: <strong className="text-white">~{(ms.dasValue / ms.revenue * 100).toFixed(1)}%</strong></span>
                    <button className="flex items-center gap-1 text-xs" style={{ color: T.primary }}>
                      <Download size={11} /> Exportar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALÍQUOTAS */}
        {tab === "aliquotas" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={16} style={{ color: T.primary }} />
                <h3 className="font-bold">Seu enquadramento fiscal</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Regime",         value: "Simples Nacional" },
                  { label: "Anexo",          value: "Anexo III (Serviços)" },
                  { label: "Faixa",          value: "1ª faixa (até R$180K/ano)" },
                  { label: "Alíquota base",  value: "6,0%" },
                  { label: "Fator R",        value: "—" },
                  { label: "ISS Municipal",  value: "2,0%" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-xs" style={{ color: T.textSub }}>{item.label}</div>
                    <div className="font-bold text-sm mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="p-4 border-b" style={{ borderColor: T.border }}>
                <h3 className="font-bold text-sm">Tabela Simples Nacional — Anexo III</h3>
              </div>
              {[
                { faixa: "Até R$180K",       aliq: "6,00%", deducao: "—",     destaque: true  },
                { faixa: "R$180K – R$360K",  aliq: "11,20%", deducao: "R$9.360",  destaque: false },
                { faixa: "R$360K – R$720K",  aliq: "13,50%", deducao: "R$17.640", destaque: false },
                { faixa: "R$720K – R$1,8M",  aliq: "16,00%", deducao: "R$35.640", destaque: false },
                { faixa: "R$1,8M – R$3,6M",  aliq: "21,00%", deducao: "R$125.640",destaque: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center px-4 py-3 border-b last:border-0"
                  style={{ borderColor: T.border, background: row.destaque ? T.primary + "08" : "transparent" }}>
                  <span className="flex-1 text-sm">{row.faixa}</span>
                  <span className="font-black text-sm w-16 text-right" style={{ color: row.destaque ? T.primary : T.text }}>{row.aliq}</span>
                  <span className="w-24 text-right text-xs" style={{ color: T.textSub }}>{row.deducao}</span>
                  {row.destaque && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.primary + "20", color: T.primary }}>Você</span>}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.success + "08", borderColor: T.success + "25" }}>
              <div className="flex items-start gap-3">
                <TrendingUp size={16} style={{ color: T.success, marginTop: 1 }} />
                <div>
                  <div className="font-bold text-sm mb-1">Projeção fiscal 2026</div>
                  <p className="text-sm" style={{ color: T.textSub }}>
                    Com receita projetada de <strong className="text-white">R$28.400</strong> em 2026, você permanece na 1ª faixa do Simples. O DAS total estimado é <strong style={{ color: T.warning }}>R$1.704/ano</strong> (alíquota de 6%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTOMAÇÃO */}
        {tab === "automatico" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  title: "Emissão automática de NFS-e",
                  desc: "Emite nota fiscal automaticamente após cada pagamento confirmado pelo anunciante.",
                  enabled: autoNfse,
                  toggle: () => setAutoNfse(v => !v),
                  badge: "Ativo",
                  badgeColor: T.success,
                },
                {
                  title: "Geração automática do DAS",
                  desc: "Gera o DAS no dia 15 de cada mês e envia para seu email com link de pagamento.",
                  enabled: autoDas,
                  toggle: () => setAutoDas(v => !v),
                  badge: "Inativo",
                  badgeColor: T.textSub,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border"
                  style={{ background: item.enabled ? T.success + "06" : T.card, borderColor: item.enabled ? T.success + "20" : T.border }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: item.badgeColor + "20", color: item.badgeColor }}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>{item.desc}</p>
                  </div>
                  <button onClick={item.toggle}
                    className="w-11 h-6 rounded-full transition-all flex-shrink-0 relative mt-0.5"
                    style={{ background: item.enabled ? T.success : T.border }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: item.enabled ? "calc(100% - 20px)" : 4 }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-3">Integrações fiscais</h3>
              {[
                { name: "Prefeitura de São Paulo (ISS.net)", status: "conectado",    color: T.success },
                { name: "Receita Federal (e-CAC)",           status: "configurar",   color: T.warning  },
                { name: "Contador parceiro DOOHPLAY",        status: "disponível",   color: T.primary  },
              ].map((intg, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{ borderColor: T.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: intg.color }} />
                    <span className="text-sm">{intg.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: intg.color }}>{intg.status}</span>
                    <ExternalLink size={12} style={{ color: T.textSub }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.accent + "08", borderColor: T.accent + "25" }}>
              <div className="flex items-start gap-3">
                <Shield size={16} style={{ color: T.accent, marginTop: 1 }} />
                <div>
                  <div className="font-bold text-sm mb-1">Contador parceiro</div>
                  <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>
                    Conecte-se a um contador parceiro DOOHPLAY para revisão mensal automática das suas obrigações fiscais. A partir de R$89/mês.
                  </p>
                  <button className="mt-3 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: T.accent + "20", color: T.accent }}>
                    Conhecer planos de contabilidade
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
