import { useState } from "react";
import {
  ArrowLeft, CreditCard, DollarSign, TrendingUp, CheckCircle, Clock,
  AlertCircle, Download, Plus, Zap, ChevronRight, RefreshCw, X,
  FileText, QrCode, Building2, Star
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

interface Invoice {
  id: string;
  client: string;
  description: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
  method: string;
  nfe?: string;
}

const INV_COLOR: Record<InvoiceStatus, string> = {
  paid: T.success, pending: T.warning, overdue: T.danger, draft: T.textSub,
};
const INV_LABEL: Record<InvoiceStatus, string> = {
  paid: "Pago", pending: "Aguardando", overdue: "Vencido", draft: "Rascunho",
};

const INVOICES: Invoice[] = [
  { id: "FAT-2024-0042", client: "iFood S.A.",         description: "Veiculação Jul/2026 — 24 telas",    amount: 15000, due: "05/08/2026", status: "pending", method: "PIX",   nfe: "NFSe-8812" },
  { id: "FAT-2024-0041", client: "Carrefour Brasil",   description: "Campanha Jul/2026 — 18 telas",      amount: 8000,  due: "01/08/2026", status: "paid",    method: "TED",   nfe: "NFSe-8810" },
  { id: "FAT-2024-0040", client: "Unilever Brasil",    description: "Publicidade Q3 — entrada",          amount: 27000, due: "25/07/2026", status: "overdue", method: "—",     nfe: undefined   },
  { id: "FAT-2024-0039", client: "Banco Bradesco",     description: "Pacote anual — 1ª parcela",         amount: 18333, due: "01/08/2026", status: "pending", method: "Boleto",nfe: "NFSe-8808" },
  { id: "FAT-2024-0038", client: "Ambev S.A.",         description: "Veiculação Jun/2026 — 8 telas",     amount: 3500,  due: "10/07/2026", status: "paid",    method: "PIX",   nfe: "NFSe-8805" },
  { id: "FAT-2024-0037", client: "FitLife Academias",  description: "Trial 30 dias — 4 telas",           amount: 890,   due: "31/08/2026", status: "draft",   method: "—",     nfe: undefined   },
  { id: "FAT-2024-0036", client: "iFood S.A.",         description: "Veiculação Jun/2026 — 24 telas",    amount: 15000, due: "05/07/2026", status: "paid",    method: "PIX",   nfe: "NFSe-8800" },
  { id: "FAT-2024-0035", client: "Carrefour Brasil",   description: "Campanha Jun/2026 — 18 telas",      amount: 8000,  due: "01/07/2026", status: "paid",    method: "TED",   nfe: "NFSe-8799" },
];

const REVENUE_TREND = [
  { month: "Jan", revenue: 42000 }, { month: "Fev", revenue: 48000 }, { month: "Mar", revenue: 55000 },
  { month: "Abr", revenue: 51000 }, { month: "Mai", revenue: 62000 }, { month: "Jun", revenue: 68000 },
  { month: "Jul", revenue: 74500 },
];

const PLANS = [
  { name: "Starter",    price: 97,  clients: 12, color: T.textSub, icon: Star },
  { name: "Pro",        price: 290, clients: 38, color: T.primary, icon: Zap },
  { name: "Enterprise", price: 620, clients: 24, color: T.gold,    icon: Building2 },
];

export default function BillingCenter({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"invoices" | "plans" | "payouts">("invoices");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [showPix, setShowPix]   = useState<string | null>(null);

  const filtered = INVOICES.filter(inv => statusFilter === "all" || inv.status === statusFilter);
  const totalPaid    = INVOICES.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = INVOICES.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const mrr = PLANS.reduce((s, p) => s + p.price * p.clients, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <CreditCard size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Centro de Cobrança</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Faturas, pagamentos e planos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["invoices","plans","payouts"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub, border: `1px solid ${tab === t ? T.gold + "30" : "transparent"}` }}>
                {t === "invoices" ? "Faturas" : t === "plans" ? "Planos" : "Pagamentos"}
              </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black ml-2"
              style={{ background: T.primary, color: "#fff" }}>
              <Plus size={13} /> Nova Fatura
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "MRR",             value: `R$${(mrr/1000).toFixed(1)}k`, color: T.gold,    icon: TrendingUp  },
            { label: "Recebido (Jul)",  value: `R$${(totalPaid/1000).toFixed(0)}k`, color: T.success, icon: CheckCircle },
            { label: "A Receber",       value: `R$${(totalPending/1000).toFixed(0)}k`, color: T.warning, icon: Clock       },
            { label: "Em Atraso",       value: `R$${(totalOverdue/1000).toFixed(0)}k`, color: T.danger,  icon: AlertCircle },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <ChevronRight size={14} style={{ color: T.textSub }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {tab === "invoices" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black">Receita Mensal 2026</h3>
                  <p className="text-xs" style={{ color: T.textSub }}>Faturamento acumulado</p>
                </div>
                <span className="font-black text-2xl" style={{ color: T.gold }}>R$74,5k</span>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient key="grad-rev" id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.gold} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} formatter={(v: number) => [`R$${(v/1000).toFixed(1)}k`, "Receita"]} />
                  <Area key="area-revenue" type="monotone" dataKey="revenue" stroke={T.gold} fill="url(#grad-rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2">
              {(["all","paid","pending","overdue","draft"] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: statusFilter === f ? (INV_COLOR[f as InvoiceStatus] || T.primary) + "20" : T.card, color: statusFilter === f ? (INV_COLOR[f as InvoiceStatus] || T.primary) : T.textSub, border: `1px solid ${statusFilter === f ? (INV_COLOR[f as InvoiceStatus] || T.primary) + "30" : T.border}` }}>
                  {f === "all" ? "Todas" : INV_LABEL[f as InvoiceStatus]}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                    {["Fatura","Cliente","Descrição","Valor","Vencimento","Status","NFS-e","Ação"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-white/3" style={{ borderColor: T.border + "60" }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: T.textSub }}>{inv.id}</td>
                      <td className="px-4 py-3 text-xs font-bold">{inv.client}</td>
                      <td className="px-4 py-3 text-xs max-w-40 truncate" style={{ color: T.textSub }}>{inv.description}</td>
                      <td className="px-4 py-3 font-black text-sm" style={{ color: T.gold }}>R${inv.amount.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-xs">{inv.due}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: INV_COLOR[inv.status] + "20", color: INV_COLOR[inv.status] }}>
                          {INV_LABEL[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.nfe
                          ? <span className="text-xs font-mono" style={{ color: T.success }}>{inv.nfe}</span>
                          : <span className="text-xs" style={{ color: T.textSub }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {inv.status === "pending" && (
                            <button onClick={() => setShowPix(inv.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                              style={{ background: T.success + "15", color: T.success }}>
                              <QrCode size={10} /> PIX
                            </button>
                          )}
                          {inv.status === "overdue" && (
                            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                              style={{ background: T.danger + "15", color: T.danger }}>
                              Cobrar
                            </button>
                          )}
                          <button className="p-1.5 rounded-lg hover:bg-white/5">
                            <Download size={11} style={{ color: T.textSub }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "plans" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                <div key={i} className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: plan.color + "30" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: plan.color + "20" }}>
                      <plan.icon size={18} style={{ color: plan.color }} />
                    </div>
                    <div>
                      <div className="font-black">{plan.name}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{plan.clients} clientes ativos</div>
                    </div>
                  </div>
                  <div className="font-black text-4xl mb-1" style={{ color: plan.color }}>
                    R${plan.price}<span className="text-lg font-normal" style={{ color: T.textSub }}>/mês</span>
                  </div>
                  <div className="font-bold text-sm mt-3" style={{ color: T.textSub }}>
                    MRR: <span style={{ color: plan.color }}>R${(plan.price * plan.clients).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, plan.clients * 2)}%`, background: plan.color }} />
                  </div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>{plan.clients}/50 slots</div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Distribuição por Plano</h3>
              <div className="space-y-3">
                {PLANS.map(plan => {
                  const planMRR = plan.price * plan.clients;
                  const pct = Math.round(planMRR / mrr * 100);
                  return (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">{plan.name}</span>
                        <span className="font-black text-xs" style={{ color: plan.color }}>
                          R${(planMRR/1000).toFixed(1)}k ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: plan.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "payouts" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Próximos Pagamentos a Receber</h3>
              <div className="space-y-2">
                {[
                  { client: "iFood S.A.",       amount: 15000, due: "05/08", method: "PIX" },
                  { client: "Banco Bradesco",    amount: 18333, due: "01/08", method: "Boleto" },
                  { client: "FitLife Academias", amount: 890,   due: "31/08", method: "—" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                    <div>
                      <div className="text-sm font-bold">{p.client}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Vence {p.due} · {p.method}</div>
                    </div>
                    <div className="font-black" style={{ color: T.gold }}>R${p.amount.toLocaleString("pt-BR")}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-3">Conta para Recebimento</h3>
              <div className="p-4 rounded-xl space-y-1 text-xs" style={{ background: T.panel, color: T.textSub }}>
                <div className="font-bold text-sm" style={{ color: T.text }}>DOOHPLAY Tecnologia Ltda.</div>
                <div>CNPJ: 12.345.678/0001-90</div>
                <div>Banco: Nubank (260) · Ag: 0001 · CC: 12345678-9</div>
                <div>Chave PIX: 12.345.678/0001-90</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,3,14,0.85)" }}
          onClick={() => setShowPix(null)}>
          <div className="p-6 rounded-2xl border w-72 text-center"
            style={{ background: T.panel, borderColor: T.border }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black">Pagar via PIX</h3>
              <button onClick={() => setShowPix(null)}>
                <X size={16} style={{ color: T.textSub }} />
              </button>
            </div>
            <div className="w-36 h-36 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <QrCode size={72} style={{ color: T.success, opacity: 0.7 }} />
            </div>
            <div className="font-mono text-sm font-bold mb-1">12.345.678/0001-90</div>
            <div className="text-xs mb-3" style={{ color: T.textSub }}>{showPix}</div>
            <div className="font-black text-2xl" style={{ color: T.gold }}>
              R${INVOICES.find(i => i.id === showPix)?.amount.toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
