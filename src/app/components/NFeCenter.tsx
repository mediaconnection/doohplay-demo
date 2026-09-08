import { useState } from "react";
import { ArrowLeft, FileText, Download, CheckCircle, Clock, AlertTriangle, Plus, Search, Building2, DollarSign, Calendar, Hash, Eye, Send, X, RefreshCw } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type NFStatus = "authorized" | "processing" | "rejected" | "cancelled";

interface NFe {
  id: number; numero: string; serie: string; chave: string;
  emitente: string; destinatario: string; cnpjDest: string;
  valor: number; servico: string; status: NFStatus;
  emitida: string; vencimento: string; protocolo?: string;
  pdf?: string;
}

const NFS: NFe[] = [
  { id: 1,  numero: "000001", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0122 5501", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "Bar & Grill Network LTDA",      cnpjDest: "12.345.678/0001-90", valor: 9400,  servico: "Plataforma SaaS DOOH + Publicidade Digital", status: "authorized", emitida: "01/07/2026", vencimento: "30/07/2026", protocolo: "135230000000001" },
  { id: 2,  numero: "000002", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0222 5502", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "EduTech Screens S.A.",         cnpjDest: "98.765.432/0001-11", valor: 19220, servico: "Plataforma SaaS DOOH — Plano Enterprise Jul/26",  status: "authorized", emitida: "01/07/2026", vencimento: "30/07/2026", protocolo: "135230000000002" },
  { id: 3,  numero: "000003", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0322 5503", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "Saúde+ Clínicas LTDA",         cnpjDest: "11.222.333/0001-44", valor: 11160, servico: "Plataforma SaaS DOOH — Plano Enterprise Jul/26",  status: "authorized", emitida: "01/07/2026", vencimento: "30/07/2026", protocolo: "135230000000003" },
  { id: 4,  numero: "000004", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0422 5504", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "FitLife Academias LTDA",       cnpjDest: "44.555.666/0001-77", valor: 3480,  servico: "Plataforma SaaS DOOH — Plano Pro Jul/26",        status: "authorized", emitida: "01/07/2026", vencimento: "30/07/2026", protocolo: "135230000000004" },
  { id: 5,  numero: "000005", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0522 5505", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "FarmaRede Drogarias LTDA",     cnpjDest: "55.666.777/0001-88", valor: 2320,  servico: "Plataforma SaaS DOOH — Plano Pro Jul/26",        status: "processing", emitida: "23/07/2026", vencimento: "22/08/2026" },
  { id: 6,  numero: "000006", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0622 5506", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "Kings Barbearia ME",           cnpjDest: "66.777.888/0001-99", valor: 291,   servico: "Plataforma SaaS DOOH — Plano Starter Jul/26",    status: "authorized", emitida: "01/07/2026", vencimento: "30/07/2026", protocolo: "135230000000006" },
  { id: 7,  numero: "000007", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0722 5507", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "Varejo Express LTDA",          cnpjDest: "77.888.999/0001-00", valor: 290,   servico: "Plataforma SaaS DOOH — Plano Pro Jun/26",        status: "cancelled", emitida: "01/06/2026", vencimento: "30/06/2026", protocolo: "135230000000007" },
  { id: 8,  numero: "000008", serie: "1", chave: "3526 0723 0000 0191 5500 1000 0010 0000 0822 5508", emitente: "DOOHPLAY TECNOLOGIA LTDA", destinatario: "Pets & CIA ME",               cnpjDest: "88.999.000/0001-11", valor: 97,    servico: "Plataforma SaaS DOOH — Plano Starter Jul/26",    status: "rejected", emitida: "23/07/2026", vencimento: "22/08/2026" },
];

const statusCfg: Record<NFStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  authorized: { label: "Autorizada", color: T.success,  icon: CheckCircle },
  processing: { label: "Processando", color: T.warning, icon: Clock },
  rejected:   { label: "Rejeitada",  color: T.danger,   icon: AlertTriangle },
  cancelled:  { label: "Cancelada",  color: T.textSub,  icon: X },
};

const ISS_RATE = 0.05; // 5% ISS padrão

export default function NFeCenter({ onBack, onNavigate }: Props) {
  const [nfs, setNfs]         = useState<NFe[]>(NFS);
  const [selected, setSelected] = useState<NFe | null>(null);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ destinatario: "", cnpj: "", valor: 0, servico: "Plataforma SaaS DOOH" });

  const filtered = nfs.filter(n =>
    n.destinatario.toLowerCase().includes(search.toLowerCase()) ||
    n.numero.includes(search)
  );

  const totalAuthorized = nfs.filter(n => n.status === "authorized").reduce((a, n) => a + n.valor, 0);
  const pendingCount    = nfs.filter(n => n.status === "processing").length;
  const totalISS        = totalAuthorized * ISS_RATE;

  const emitir = () => {
    const newNF: NFe = {
      id: Date.now(), numero: String(nfs.length + 1).padStart(6, "0"),
      serie: "1", chave: `3526 0723 0000 0191 5500 1000 0010 0000 ${String(nfs.length + 1).padStart(4,"0")}22 55${String(nfs.length + 1).padStart(2,"0")}`,
      emitente: "DOOHPLAY TECNOLOGIA LTDA",
      destinatario: form.destinatario, cnpjDest: form.cnpj,
      valor: form.valor, servico: form.servico,
      status: "processing", emitida: "23/07/2026", vencimento: "22/08/2026",
    };
    setNfs(prev => [newNF, ...prev]);
    setShowForm(false);
    setForm({ destinatario: "", cnpj: "", valor: 0, servico: "Plataforma SaaS DOOH" });
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <FileText size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Central de NFS-e</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Nota Fiscal de Serviço Eletrônica — DOOHPLAY</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.primary, color: "#fff" }}>
            <Plus size={14} /> Emitir NFS-e
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total autorizado",  value: `R$${totalAuthorized.toLocaleString("pt-BR")}`, color: T.success, icon: CheckCircle },
            { label: "NFS-e emitidas",    value: nfs.filter(n => n.status === "authorized").length, color: T.primary, icon: FileText },
            { label: "ISS retido (5%)",   value: `R$${totalISS.toLocaleString("pt-BR")}`,           color: T.warning, icon: DollarSign },
            { label: "Pendentes SEFAZ",   value: pendingCount, color: pendingCount > 0 ? T.warning : T.textSub, icon: Clock },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEFAZ status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: T.success + "08", borderColor: T.success + "30" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: T.success }} />
          <span className="text-sm font-medium">SEFAZ-SP operacional · Versão NFS-e 2.03 · Última comunicação: 23/07/2026 14:47</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <Search size={14} style={{ color: T.textSub }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por destinatário ou número..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.text }} />
        </div>

        {/* NF List */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                {["Nº / Série", "Destinatário", "Serviço", "Valor", "ISS (5%)", "Status", "Emitida", "Ações"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((nf, i) => {
                const cfg = statusCfg[nf.status];
                return (
                  <tr key={nf.id} className="cursor-pointer hover:bg-white/2 transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
                    onClick={() => setSelected(selected?.id === nf.id ? null : nf)}>
                    <td className="px-4 py-3 font-mono text-sm">
                      <div style={{ color: T.text }}>{nf.numero}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Série {nf.serie}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm truncate max-w-40">{nf.destinatario}</div>
                      <div className="text-xs font-mono" style={{ color: T.textSub }}>{nf.cnpjDest}</div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-36 truncate" style={{ color: T.textSub }}>{nf.servico}</td>
                    <td className="px-4 py-3 font-black text-sm" style={{ color: T.gold }}>R${nf.valor.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: T.warning }}>R${(nf.valor * ISS_RATE).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <cfg.icon size={12} style={{ color: cfg.color }} />
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{nf.emitida}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {nf.status === "authorized" && (
                          <button onClick={e => e.stopPropagation()} title="Baixar PDF"
                            className="p-1.5 rounded-lg hover:bg-white/5">
                            <Download size={13} style={{ color: T.primary }} />
                          </button>
                        )}
                        {nf.status === "processing" && (
                          <button onClick={e => e.stopPropagation()} title="Consultar SEFAZ"
                            className="p-1.5 rounded-lg hover:bg-white/5">
                            <RefreshCw size={13} style={{ color: T.warning }} />
                          </button>
                        )}
                        <button onClick={e => e.stopPropagation()} title="Visualizar"
                          className="p-1.5 rounded-lg hover:bg-white/5">
                          <Eye size={13} style={{ color: T.textSub }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* NF detail */}
        {selected && (
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-lg">NFS-e Nº {selected.numero} — Série {selected.serie}</h3>
                <p className="text-xs mt-0.5 font-mono" style={{ color: T.textSub }}>Chave: {selected.chave}</p>
              </div>
              <button onClick={() => setSelected(null)}><X size={16} style={{ color: T.textSub }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl" style={{ background: T.panel }}>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>EMITENTE</div>
                <div className="font-bold">{selected.emitente}</div>
                <div className="text-sm mt-0.5" style={{ color: T.textSub }}>CNPJ: 00.000.000/0001-00</div>
                <div className="text-sm" style={{ color: T.textSub }}>São Paulo — SP</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: T.panel }}>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>DESTINATÁRIO / TOMADOR</div>
                <div className="font-bold">{selected.destinatario}</div>
                <div className="text-sm mt-0.5 font-mono" style={{ color: T.textSub }}>CNPJ: {selected.cnpjDest}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: T.panel }}>
              <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>DISCRIMINAÇÃO DO SERVIÇO</div>
              <div className="text-sm">{selected.servico}</div>
              <div className="text-xs mt-1" style={{ color: T.textSub }}>LC 116/2003 — Item 1.07 — Suporte de informática</div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Valor do serviço", value: `R$${selected.valor.toLocaleString("pt-BR")}`, color: T.gold },
                { label: "ISS (5%)", value: `R$${(selected.valor * 0.05).toLocaleString("pt-BR")}`, color: T.warning },
                { label: "Emitida em", value: selected.emitida, color: T.text },
                { label: "Protocolo SEFAZ", value: selected.protocolo ?? "—", color: T.success },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                  <div className="font-black text-base mb-0.5" style={{ color: d.color }}>{d.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{d.label}</div>
                </div>
              ))}
            </div>
            {selected.status === "authorized" && (
              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                  <Download size={14} /> Baixar PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                  <Send size={14} /> Enviar por e-mail
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md p-6 rounded-3xl border" style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">Emitir NFS-e</h3>
              <button onClick={() => setShowForm(false)}><X size={16} style={{ color: T.textSub }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Razão social do tomador</label>
                <input value={form.destinatario} onChange={e => setForm(f => ({ ...f, destinatario: e.target.value }))}
                  placeholder="Ex: Empresa LTDA"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>CNPJ</label>
                <input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-mono"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Valor (R$)</label>
                <input type="number" value={form.valor || ""} onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                {form.valor >= 200 && (
                  <div className="text-xs mt-1" style={{ color: T.warning }}>
                    ISS estimado: R${(form.valor * 0.05).toFixed(2)} (5%)
                  </div>
                )}
                {form.valor > 0 && form.valor < 200 && (
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>Abaixo de R$200 — NFS-e opcional</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Discriminação do serviço</label>
                <input value={form.servico} onChange={e => setForm(f => ({ ...f, servico: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                Cancelar
              </button>
              <button onClick={emitir} disabled={!form.destinatario || !form.cnpj || form.valor <= 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: form.destinatario && form.cnpj && form.valor > 0 ? T.primary : T.textSub, color: "#fff" }}>
                Emitir para SEFAZ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
