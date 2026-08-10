import { useState } from "react";
import {
  ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, Plus, Search,
  Download, Send, Eye, Pen, X, Shield, Calendar, DollarSign, Building2
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ContractStatus = "active" | "pending_sign" | "expired" | "draft" | "cancelled";

interface Contract {
  id: string; title: string; client: string; cnpj: string;
  value: number; startDate: string; endDate: string;
  status: ContractStatus; screens: number; signedAt?: string;
  hash?: string; type: string; autoRenew: boolean;
}

const STATUS_COLOR: Record<ContractStatus, string> = {
  active: T.success, pending_sign: T.warning, expired: T.textSub, draft: T.primary, cancelled: T.danger,
};
const STATUS_LABEL: Record<ContractStatus, string> = {
  active: "Vigente", pending_sign: "Aguard. Assinatura", expired: "Expirado", draft: "Rascunho", cancelled: "Cancelado",
};
const STATUS_ICON: Record<ContractStatus, any> = {
  active: CheckCircle, pending_sign: Clock, expired: AlertCircle, draft: Pen, cancelled: X,
};

const CONTRACTS: Contract[] = [
  { id: "CTR-2024-0018", title: "Campanha Anual iFood DOOH",       client: "iFood S.A.",         cnpj: "14.380.200/0001-21", value: 180000, startDate: "01/01/2026", endDate: "31/12/2026", status: "active",       screens: 24, signedAt: "28/12/2025", hash: "a3f9b2c1", type: "Anual",      autoRenew: true  },
  { id: "CTR-2025-0001", title: "Publicidade Carrefour 6 meses",   client: "Carrefour Brasil",   cnpj: "45.543.915/0001-81", value: 96000,  startDate: "01/07/2026", endDate: "31/12/2026", status: "active",       screens: 18, signedAt: "25/06/2026", hash: "d71e44f8", type: "Semestral",  autoRenew: false },
  { id: "CTR-2025-0002", title: "Mídia OOH Unilever Q3",           client: "Unilever Brasil",    cnpj: "17.320.700/0001-06", value: 54000,  startDate: "01/07/2026", endDate: "30/09/2026", status: "pending_sign", screens: 12, signedAt: undefined, hash: undefined, type: "Trimestral", autoRenew: false },
  { id: "CTR-2025-0003", title: "Bradesco Ads Programa Anual",     client: "Banco Bradesco S.A.",cnpj: "60.746.948/0001-12", value: 220000, startDate: "01/08/2026", endDate: "31/07/2027", status: "pending_sign", screens: 35, signedAt: undefined, hash: undefined, type: "Anual",      autoRenew: true  },
  { id: "CTR-2024-0012", title: "Ambev Verão 2025/2026",           client: "Ambev S.A.",         cnpj: "07.526.557/0001-00", value: 42000,  startDate: "01/11/2025", endDate: "28/02/2026", status: "expired",      screens: 8,  signedAt: "20/10/2025", hash: "7c3a9e12", type: "Sazonal",    autoRenew: false },
  { id: "CTR-2025-0004", title: "FitLife Academia 3 meses",        client: "FitLife Academias",  cnpj: "32.198.240/0001-55", value: 12000,  startDate: "01/08/2026", endDate: "31/10/2026", status: "draft",        screens: 4,  signedAt: undefined, hash: undefined, type: "Trimestral", autoRenew: false },
  { id: "CTR-2025-0005", title: "Pet Center Promoção Natal",       client: "Pet Center Brasil",  cnpj: "04.622.001/0001-81", value: 18000,  startDate: "01/11/2026", endDate: "31/12/2026", status: "draft",        screens: 6,  signedAt: undefined, hash: undefined, type: "Sazonal",    autoRenew: false },
];

const CLAUSES = [
  "Veiculação mínima garantida de 8 exibições/hora/tela durante horário comercial (06h–22h).",
  "Material publicitário deverá ser entregue com 72h de antecedência em formato .MP4 ou .PNG 1920×1080.",
  "DOOHPLAY garante ProofChain — registro em blockchain de cada exibição com hash RSA-SHA256.",
  "Cancelamento com reembolso proporcional até 10 dias antes do início da veiculação.",
  "Penalidade de 2% ao mês sobre valor do contrato em caso de inadimplência.",
];

export default function ContractManager({ onBack, onNavigate }: Props) {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<ContractStatus | "all">("all");
  const [selected, setSelected] = useState<Contract | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [signing, setSigning]   = useState<string | null>(null);
  const [signedIds, setSignedIds] = useState<Set<string>>(new Set());

  const filtered = CONTRACTS.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalActive = CONTRACTS.filter(c => c.status === "active").reduce((s, c) => s + c.value, 0);
  const pendingCount = CONTRACTS.filter(c => c.status === "pending_sign").length;

  function signContract(id: string) {
    setSigning(id);
    setTimeout(() => { setSigning(null); setSignedIds(prev => new Set([...prev, id])); }, 2400);
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <FileText size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Gestão de Contratos</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Contratos, assinatura digital e vigência</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black" style={{ background: T.primary, color: "#fff" }}>
            <Plus size={14} /> Novo Contrato
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Receita Contratada",  value: `R$${(totalActive/1000).toFixed(0)}k`, color: T.gold,    icon: DollarSign },
              { label: "Contratos Vigentes",  value: CONTRACTS.filter(c=>c.status==="active").length, color: T.success, icon: CheckCircle },
              { label: "Aguard. Assinatura",  value: pendingCount,   color: T.warning, icon: Clock },
              { label: "Rascunhos",           value: CONTRACTS.filter(c=>c.status==="draft").length, color: T.primary, icon: Pen },
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.color + "20" }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <div>
                  <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-44">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar contratos..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
            {(["all","active","pending_sign","draft","expired"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: filter === f ? (STATUS_COLOR[f as ContractStatus] || T.primary) + "20" : T.card, color: filter === f ? (STATUS_COLOR[f as ContractStatus] || T.primary) : T.textSub, border: `1px solid ${filter === f ? (STATUS_COLOR[f as ContractStatus] || T.primary) + "30" : T.border}` }}>
                {f === "all" ? "Todos" : STATUS_LABEL[f as ContractStatus]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(contract => {
              const StatusIcon = STATUS_ICON[contract.status];
              const isSelected = selected?.id === contract.id;
              const wasJustSigned = signedIds.has(contract.id);
              return (
                <div key={contract.id} onClick={() => setSelected(isSelected ? null : contract)}
                  className="p-4 rounded-2xl border cursor-pointer transition-all"
                  style={{ background: T.card, borderColor: isSelected ? T.primary : T.border }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-sm">{contract.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: STATUS_COLOR[wasJustSigned ? "active" : contract.status] + "20", color: STATUS_COLOR[wasJustSigned ? "active" : contract.status] }}>
                          <StatusIcon size={10} className="inline mr-1" />
                          {wasJustSigned ? "Vigente" : STATUS_LABEL[contract.status]}
                        </span>
                        {contract.autoRenew && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: T.accent + "20", color: T.accent }}>Auto-renov.</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: T.textSub }}>
                        <span><Building2 size={10} className="inline mr-1" />{contract.client}</span>
                        <span><Calendar size={10} className="inline mr-1" />{contract.startDate} – {contract.endDate}</span>
                        <span>{contract.screens} telas</span>
                        <span className="font-mono">{contract.id}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-lg" style={{ color: T.gold }}>R${(contract.value/1000).toFixed(0)}k</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{contract.type}</div>
                    </div>
                  </div>
                  {(contract.hash || wasJustSigned) && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: T.success }}>
                      <Shield size={10} />
                      <span className="font-mono">Hash: {contract.hash || "e4f1a2b9"}...</span>
                      <span style={{ color: T.textSub }}>· ProofChain verificado</span>
                    </div>
                  )}
                  {contract.status === "pending_sign" && !wasJustSigned && (
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); signContract(contract.id); }}
                        disabled={signing === contract.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
                        style={{ background: T.success, color: "#000", opacity: signing === contract.id ? 0.7 : 1 }}>
                        {signing === contract.id ? (
                          <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full" style={{ animation: "spin 0.6s linear infinite" }} /> Assinando...</>
                        ) : (
                          <><Pen size={11} /> Assinar Digitalmente</>
                        )}
                      </button>
                      <button onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                        <Send size={11} /> Enviar p/ Assinatura
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: T.textSub }}>DETALHES</span>
                <button onClick={() => setSelected(null)}><X size={14} style={{ color: T.textSub }} /></button>
              </div>
              <h3 className="font-black text-sm mb-1">{selected.title}</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>{selected.client}</p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "CNPJ",       value: selected.cnpj },
                  { label: "Valor",      value: `R$${selected.value.toLocaleString("pt-BR")}`, color: T.gold },
                  { label: "Tipo",       value: selected.type },
                  { label: "Telas",      value: `${selected.screens} telas` },
                  { label: "Vigência",   value: `${selected.startDate} → ${selected.endDate}` },
                  ...(selected.signedAt ? [{ label: "Assinado", value: selected.signedAt, color: T.success }] : []),
                  ...(selected.hash ? [{ label: "Hash", value: `${selected.hash}...`, color: T.success, mono: true }] : []),
                ].map((row, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <span className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{row.label}</span>
                    <span className={`text-xs font-bold text-right ${(row as any).mono ? "font-mono" : ""}`} style={{ color: (row as any).color || T.text }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                  <Eye size={12} /> Visualizar PDF
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold" style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={12} /> Download .PDF
                </button>
                {selected.status === "active" && (
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold" style={{ background: T.danger + "10", color: T.danger, border: `1px solid ${T.danger}20` }}>
                    <X size={12} /> Cancelar Contrato
                  </button>
                )}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black text-sm mb-3">Cláusulas Padrão</h3>
              <div className="space-y-2.5">
                {CLAUSES.map((clause, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs" style={{ background: T.primary + "20", color: T.primary }}>{i + 1}</div>
                    <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>{clause}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(2,3,14,0.85)" }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg p-6 rounded-2xl border" style={{ background: T.panel, borderColor: T.border }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Novo Contrato</h2>
              <button onClick={() => setShowNew(false)}><X size={16} style={{ color: T.textSub }} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Título do Contrato", placeholder: "Ex: Campanha Anual FitLife 2026" },
                { label: "Empresa / Anunciante", placeholder: "Razão social" },
                { label: "CNPJ", placeholder: "00.000.000/0001-00" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-bold block mb-1" style={{ color: T.textSub }}>{f.label.toUpperCase()}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {["DATA INÍCIO","DATA FIM"].map(lbl => (
                  <div key={lbl}>
                    <label className="text-xs font-bold block mb-1" style={{ color: T.textSub }}>{lbl}</label>
                    <input type="date" className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: T.textSub }}>VALOR TOTAL (R$)</label>
                <input type="number" placeholder="0,00" className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>Cancelar</button>
              <button onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-xl text-sm font-black" style={{ background: T.primary, color: "#fff" }}>Criar Rascunho</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
