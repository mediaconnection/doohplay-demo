import { useState } from "react";
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle, ChevronRight, TrendingUp, Download, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type PayoutStatus = "paid" | "processing" | "pending" | "failed";

interface Payout {
  id: string; amount: number; period: string; date: string;
  method: "pix" | "ted"; status: PayoutStatus; txId?: string;
  breakdown: { label: string; amount: number }[];
}

const PAYOUTS: Payout[] = [
  { id: "p1", amount: 1240.50, period: "Jul/2026 (parcial)", date: "23/07/2026", method: "pix", status: "processing", breakdown: [{ label: "AutoFinance SA", amount: 720.00 }, { label: "TechStore Brasil", amount: 520.50 }] },
  { id: "p2", amount: 3841.20, period: "Jun/2026",           date: "05/07/2026", method: "pix", status: "paid",       txId: "E00038166202407051438K1Q5X", breakdown: [{ label: "TechStore Brasil", amount: 1480.00 }, { label: "iFood S.A.", amount: 980.00 }, { label: "AutoFinance SA", amount: 861.20 }, { label: "FitPlus Gym", amount: 520.00 }] },
  { id: "p3", amount: 2190.00, period: "Mai/2026",           date: "05/06/2026", method: "pix", status: "paid",       txId: "E00038166202406051212R7F9A", breakdown: [{ label: "Drogaria SP", amount: 1100.00 }, { label: "AutoFinance SA", amount: 1090.00 }] },
  { id: "p4", amount: 1640.80, period: "Abr/2026",           date: "05/05/2026", method: "ted", status: "paid",       txId: "TED-2026050502481234", breakdown: [{ label: "iFood S.A.", amount: 1640.80 }] },
  { id: "p5", amount: 982.40,  period: "Mar/2026",           date: "05/04/2026", method: "pix", status: "paid",       txId: "E00038166202604051044M2N8B", breakdown: [{ label: "TechStore Brasil", amount: 982.40 }] },
];

const HISTORY_DATA = [
  { month: "Fev", amount: 640 }, { month: "Mar", amount: 982 },
  { month: "Abr", amount: 1641 }, { month: "Mai", amount: 2190 },
  { month: "Jun", amount: 3841 }, { month: "Jul", amount: 1241 },
];

const STATUS_CFG: Record<PayoutStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  paid:       { label: "Pago",         color: T.success, bg: T.success + "15", icon: CheckCircle  },
  processing: { label: "Processando",  color: T.primary, bg: T.primary + "15", icon: Clock        },
  pending:    { label: "Pendente",     color: T.warning, bg: T.warning + "15", icon: AlertCircle  },
  failed:     { label: "Falhou",       color: T.danger,  bg: T.danger  + "15", icon: AlertCircle  },
};

interface Props { onBack: () => void; }

export default function PayoutCenter({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const nextPayout = new Date(2026, 7, 5);
  const daysUntil = Math.ceil((nextPayout.getTime() - Date.now()) / 86400000);
  const pendingAmount = PAYOUTS.filter(p => p.status === "processing").reduce((a, p) => a + p.amount, 0);
  const totalPaid = PAYOUTS.filter(p => p.status === "paid").reduce((a, p) => a + p.amount, 0);

  const handleRequest = () => {
    setRequesting(true);
    setTimeout(() => { setRequesting(false); setRequested(true); }, 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
              <DollarSign size={18} style={{ color: T.success }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Pagamentos</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Recebimentos e histórico de repasses</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Processando",     value: `R$${pendingAmount.toFixed(2)}`,          color: T.primary, sub: "em trânsito"          },
            { label: "Próximo pagto.",  value: `${daysUntil}d`,                          color: T.warning, sub: "dia 5 de Agosto"       },
            { label: "Total recebido",  value: `R$${(totalPaid / 1000).toFixed(1)}K`,   color: T.success, sub: "desde o início"        },
          ].map((k, i) => (
            <div key={i} className="p-3.5 rounded-xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
              <div className="text-xs" style={{ color: T.textSub, opacity: 0.6 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Histórico de repasses</h3>
            <span className="text-xs font-black" style={{ color: T.success }}>+500% em 5 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={HISTORY_DATA}>
              <defs>
                <linearGradient key="payout-grad" id="payout-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "Repasse"]} />
              <Area type="monotone" dataKey="amount" key="payout-area" stroke={T.success} fill="url(#payout-grad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.success + "20" }}>
            <span className="font-black text-sm" style={{ color: T.success }}>PIX</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Chave PIX cadastrada</div>
            <div className="text-xs font-mono" style={{ color: T.textSub }}>carlos.zimerman@gmail.com</div>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>Alterar</button>
        </div>
        {!requested ? (
          <div className="p-4 rounded-2xl border" style={{ background: T.primary + "08", borderColor: T.primary + "25" }}>
            <div className="flex items-start gap-3">
              <Zap size={16} style={{ color: T.primary, marginTop: 1 }} />
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">Antecipação disponível</div>
                <p className="text-sm" style={{ color: T.textSub }}>Antecipe <strong className="text-white">R${pendingAmount.toFixed(2)}</strong> agora com taxa de 1,5%. Crédito em até 1h.</p>
                <button onClick={handleRequest} disabled={requesting} className="mt-3 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff", opacity: requesting ? 0.7 : 1 }}>
                  {requesting ? <><div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />Processando...</> : <><Zap size={13} />Antecipar agora</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border text-center" style={{ background: T.success + "08", borderColor: T.success + "30" }}>
            <CheckCircle size={28} className="mx-auto mb-2" style={{ color: T.success }} />
            <div className="font-bold">Antecipação solicitada!</div>
            <p className="text-xs mt-1" style={{ color: T.textSub }}>R${pendingAmount.toFixed(2)} chegam à sua conta em até 1h.</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-bold text-sm" style={{ color: T.textSub }}>Histórico detalhado</h3>
          {PAYOUTS.map(p => {
            const s = STATUS_CFG[p.status];
            const Icon = s.icon;
            const isExpanded = expanded === p.id;
            return (
              <div key={p.id} className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
                <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setExpanded(isExpanded ? null : p.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}><Icon size={18} style={{ color: s.color }} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{p.period}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{p.date} · {p.method.toUpperCase()}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-sm" style={{ color: p.status === "paid" ? T.success : T.text }}>R${p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{p.breakdown.length} campanhas</div>
                  </div>
                  <ChevronRight size={14} style={{ color: T.textSub, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {isExpanded && (
                  <div className="border-t px-4 pb-4" style={{ borderColor: T.border }}>
                    <div className="pt-3 space-y-2">
                      {p.breakdown.map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span style={{ color: T.textSub }}>{b.label}</span>
                          <span className="font-bold">R${b.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {p.txId && <div className="pt-2 mt-2 border-t" style={{ borderColor: T.border }}><div className="text-xs font-mono" style={{ color: T.textSub }}>ID: {p.txId}</div></div>}
                    </div>
                    <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                      <Download size={11} /> Comprovante PDF
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
