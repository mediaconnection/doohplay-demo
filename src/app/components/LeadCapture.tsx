import { useState } from "react";
import {
  ArrowLeft, QrCode, Smartphone, MessageSquare, Users, TrendingUp,
  CheckCircle, Download, Plus, Search, Filter, Zap, Eye, Clock,
  MapPin, Tag, ChevronRight, X, Copy, BarChart2, RefreshCw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type CaptureMethod = "qr" | "sms" | "nfc" | "url";
type LeadStatus = "new" | "contacted" | "converted" | "lost";

interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  method: CaptureMethod;
  campaign: string;
  screen: string;
  city: string;
  capturedAt: string;
  status: LeadStatus;
  score: number;
}

const METHOD_COLOR: Record<CaptureMethod, string> = {
  qr: T.primary, sms: T.success, nfc: T.accent, url: T.gold,
};
const METHOD_LABEL: Record<CaptureMethod, string> = {
  qr: "QR Code", sms: "SMS", nfc: "NFC Tap", url: "Link curto",
};
const STATUS_COLOR: Record<LeadStatus, string> = {
  new: T.primary, contacted: T.warning, converted: T.success, lost: T.textSub,
};
const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Novo", contacted: "Contactado", converted: "Convertido", lost: "Perdido",
};

const LEADS: Lead[] = [
  { id: "L001", name: "Rafael Souza",    phone: "+55 11 98765-4321", email: "rafael@email.com", method: "qr",  campaign: "iFood OOH Jul",     screen: "Shopping Ibirapuera", city: "São Paulo",    capturedAt: "23/07 10:12", status: "new",       score: 88 },
  { id: "L002", name: "Camila Rocha",    phone: "+55 11 97654-3210", email: undefined,           method: "sms", campaign: "FitLife Academia",  screen: "Metro Paulista",      city: "São Paulo",    capturedAt: "23/07 09:44", status: "contacted", score: 72 },
  { id: "L003", name: undefined,         phone: "+55 21 96543-2109", email: undefined,           method: "nfc", campaign: "Bradesco Ads",      screen: "Aeroporto GRU T2",   city: "Guarulhos",    capturedAt: "23/07 08:30", status: "converted", score: 95 },
  { id: "L004", name: "Bruno Lima",      phone: "+55 11 95432-1098", email: "bruno@empresa.com", method: "url", campaign: "Carrefour Jul",     screen: "Av. Paulista 1000",  city: "São Paulo",    capturedAt: "22/07 19:55", status: "new",       score: 61 },
  { id: "L005", name: "Patrícia Neves",  phone: "+55 31 94321-0987", email: undefined,           method: "qr",  campaign: "Unilever Q3",       screen: "Shopping Iguatemi",   city: "São Paulo",    capturedAt: "22/07 18:20", status: "converted", score: 91 },
  { id: "L006", name: undefined,         phone: "+55 11 93210-9876", email: undefined,           method: "sms", campaign: "iFood OOH Jul",     screen: "Shopping Ibirapuera", city: "São Paulo",    capturedAt: "22/07 17:05", status: "lost",      score: 34 },
  { id: "L007", name: "Thiago Martins",  phone: "+55 41 92109-8765", email: "thiago@tech.io",   method: "url", campaign: "Bradesco Ads",      screen: "Rodoviária Tietê",    city: "São Paulo",    capturedAt: "22/07 15:40", status: "new",       score: 78 },
  { id: "L008", name: "Isabela Dias",    phone: "+55 85 91098-7654", email: undefined,           method: "nfc", campaign: "FitLife Academia",  screen: "Av. Boa Viagem",      city: "Recife",       capturedAt: "22/07 14:10", status: "contacted", score: 66 },
  { id: "L009", name: "Leonardo Faria",  phone: "+55 11 90987-6543", email: "leo@startup.com",  method: "qr",  campaign: "Ambev Verão",       screen: "Parque Ibirapuera",   city: "São Paulo",    capturedAt: "21/07 20:30", status: "converted", score: 87 },
  { id: "L010", name: "Mariana Esteves", phone: "+55 71 89876-5432", email: undefined,           method: "sms", campaign: "Carrefour Jul",     screen: "Shopping Barra",      city: "Salvador",     capturedAt: "21/07 16:00", status: "new",       score: 55 },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  leads: 8 + i * 3 + Math.floor(Math.random() * 8),
  converted: 2 + i + Math.floor(Math.random() * 3),
}));

const METHOD_STATS = [
  { method: "QR Code",   count: 1840, pct: 42, color: T.primary },
  { method: "SMS",       count: 1100, pct: 25, color: T.success },
  { method: "NFC Tap",   count: 880,  pct: 20, color: T.accent  },
  { method: "Link curto",count: 570,  pct: 13, color: T.gold    },
];

export default function LeadCapture({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"leads" | "capture" | "analytics">("leads");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [activeMethod, setActiveMethod] = useState<CaptureMethod>("qr");
  const [copied, setCopied]     = useState(false);

  const filtered = LEADS.filter(l => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search && !(l.name || "").toLowerCase().includes(search.toLowerCase()) && !l.campaign.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalLeads     = LEADS.length;
  const totalConverted = LEADS.filter(l => l.status === "converted").length;
  const convRate       = Math.round(totalConverted / totalLeads * 100);
  const avgScore       = Math.round(LEADS.reduce((s, l) => s + l.score, 0) / LEADS.length);

  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const captureURL = `https://d.oo/${activeMethod === "qr" ? "qr" : activeMethod === "sms" ? "sms" : activeMethod === "nfc" ? "nfc" : "lnk"}/ABC123`;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <QrCode size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Lead Capture</h1>
                <p className="text-xs" style={{ color: T.textSub }}>QR Code · NFC · SMS · Link — captura da tela para o CRM</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["leads","capture","analytics"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.success + "20" : "transparent", color: tab === t ? T.success : T.textSub, border: `1px solid ${tab === t ? T.success + "30" : "transparent"}` }}>
                {t === "leads" ? "Leads" : t === "capture" ? "Configurar Captura" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Leads Captados",    value: totalLeads,          color: T.primary, icon: Users },
            { label: "Taxa de Conversão", value: `${convRate}%`,      color: T.success, icon: TrendingUp },
            { label: "Lead Score Médio",  value: `${avgScore}/100`,   color: T.gold,    icon: Zap },
            { label: "Canais Ativos",     value: 4,                   color: T.accent,  icon: QrCode },
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

        {/* LEADS TAB */}
        {tab === "leads" && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar leads..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                {(["all","new","contacted","converted","lost"] as const).map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: statusFilter === f ? (STATUS_COLOR[f as LeadStatus] || T.primary) + "20" : T.card, color: statusFilter === f ? (STATUS_COLOR[f as LeadStatus] || T.primary) : T.textSub, border: `1px solid ${statusFilter === f ? (STATUS_COLOR[f as LeadStatus] || T.primary) + "30" : T.border}` }}>
                    {f === "all" ? "Todos" : STATUS_LABEL[f as LeadStatus]}
                  </button>
                ))}
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={13} /> CSV
                </button>
              </div>

              {/* Table */}
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                      {["Lead","Canal","Campanha","Tela","Captado em","Score","Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <tr key={lead.id} onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                        className="border-b cursor-pointer hover:bg-white/3 transition-colors"
                        style={{ borderColor: T.border + "60", background: selected?.id === lead.id ? T.primary + "08" : "transparent" }}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-xs">{lead.name || <span style={{ color: T.textSub }}>Anônimo</span>}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>{lead.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-black" style={{ color: METHOD_COLOR[lead.method] }}>
                            {METHOD_LABEL[lead.method]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs truncate max-w-28" style={{ color: T.textSub }}>{lead.campaign}</td>
                        <td className="px-4 py-3 text-xs truncate max-w-28" style={{ color: T.textSub }}>{lead.screen}</td>
                        <td className="px-4 py-3 text-xs">{lead.capturedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full" style={{ background: T.border }}>
                              <div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: lead.score >= 80 ? T.success : lead.score >= 60 ? T.warning : T.danger }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: lead.score >= 80 ? T.success : lead.score >= 60 ? T.warning : T.danger }}>{lead.score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: STATUS_COLOR[lead.status] + "20", color: STATUS_COLOR[lead.status] }}>
                            {STATUS_LABEL[lead.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail */}
            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-3" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>LEAD {selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div>
                  <div className="font-black">{selected.name || "Anônimo"}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{selected.phone}</div>
                  {selected.email && <div className="text-xs" style={{ color: T.textSub }}>{selected.email}</div>}
                </div>
                {[
                  { label: "Canal",      value: METHOD_LABEL[selected.method], color: METHOD_COLOR[selected.method] },
                  { label: "Campanha",   value: selected.campaign },
                  { label: "Tela",       value: selected.screen },
                  { label: "Cidade",     value: selected.city },
                  { label: "Captado em", value: selected.capturedAt },
                  { label: "Score",      value: `${selected.score}/100`, color: selected.score >= 80 ? T.success : T.warning },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold" style={{ color: (r as any).color || T.text }}>{r.value}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2 rounded-xl text-xs font-black" style={{ background: T.success, color: "#000" }}>
                    Marcar Convertido
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                    Enviar WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAPTURE CONFIG TAB */}
        {tab === "capture" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Método de Captura</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["qr","sms","nfc","url"] as CaptureMethod[]).map(method => {
                    const Icon = method === "qr" ? QrCode : method === "sms" ? MessageSquare : method === "nfc" ? Smartphone : Zap;
                    return (
                      <button key={method} onClick={() => setActiveMethod(method)}
                        className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
                        style={{ background: activeMethod === method ? METHOD_COLOR[method] + "20" : T.panel, border: `2px solid ${activeMethod === method ? METHOD_COLOR[method] : T.border}` }}>
                        <Icon size={24} style={{ color: METHOD_COLOR[method] }} />
                        <span className="text-sm font-black" style={{ color: activeMethod === method ? METHOD_COLOR[method] : T.textSub }}>
                          {METHOD_LABEL[method]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Formulário de Captura</h3>
                <div className="space-y-2">
                  {[
                    { label: "Nome (opcional)", on: true },
                    { label: "Telefone", on: true },
                    { label: "E-mail", on: false },
                    { label: "Aceite LGPD", on: true },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                      <span className="text-sm">{f.label}</span>
                      <div className="relative w-9 h-5 rounded-full" style={{ background: f.on ? T.success : T.border }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white" style={{ left: f.on ? "calc(100% - 18px)" : "2px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Destino dos Leads</h3>
                {["CRM DOOHPLAY","Google Sheets","HubSpot","Webhook personalizado"].map((dest, i) => (
                  <div key={i} className="flex items-center gap-2 py-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? T.success : T.border }} />
                    <span className="text-sm">{dest}</span>
                    {i === 0 && <span className="text-xs font-bold ml-auto" style={{ color: T.success }}>Ativo</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Preview na Tela</h3>
                <div className="rounded-2xl overflow-hidden" style={{ background: T.bg, border: `1px solid ${T.border}`, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: METHOD_COLOR[activeMethod] + "20", border: `2px solid ${METHOD_COLOR[activeMethod]}40` }}>
                      {activeMethod === "qr"
                        ? <QrCode size={36} style={{ color: METHOD_COLOR[activeMethod] }} />
                        : activeMethod === "sms"
                        ? <MessageSquare size={36} style={{ color: METHOD_COLOR[activeMethod] }} />
                        : activeMethod === "nfc"
                        ? <Smartphone size={36} style={{ color: METHOD_COLOR[activeMethod] }} />
                        : <Zap size={36} style={{ color: METHOD_COLOR[activeMethod] }} />
                      }
                    </div>
                    <div className="font-black text-sm">
                      {activeMethod === "qr" ? "Escaneie o QR Code" : activeMethod === "sms" ? "Envie SMS para 31133" : activeMethod === "nfc" ? "Toque seu celular aqui" : "Acesse o link"}
                    </div>
                    <div className="text-xs mt-1" style={{ color: T.textSub }}>
                      {activeMethod === "url" ? "doohplay.com.br/promo" : "Ganhe desconto exclusivo!"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: T.panel }}>
                  <span className="text-xs font-mono flex-1 truncate" style={{ color: T.textSub }}>{captureURL}</span>
                  <button onClick={copyLink} className="flex items-center gap-1 text-xs font-bold" style={{ color: copied ? T.success : T.primary }}>
                    {copied ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>CONFORMIDADE LGPD</div>
                <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>
                  Todos os dados coletados são armazenados com criptografia AES-256. O opt-in é registrado com timestamp e IP para fins de auditoria. Dados excluídos em 24h mediante solicitação.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Leads × Conversões — 14 dias</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Captura diária acumulada</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="grad-leads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="grad-conv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.success} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                    <Area type="monotone" dataKey="leads" stroke={T.primary} fill="url(#grad-leads)" strokeWidth={2} />
                    <Area type="monotone" dataKey="converted" stroke={T.success} fill="url(#grad-conv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Leads por Canal</h3>
                <div className="space-y-3">
                  {METHOD_STATS.map(ms => (
                    <div key={ms.method}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">{ms.method}</span>
                        <span className="font-black text-sm" style={{ color: ms.color }}>{ms.count.toLocaleString("pt-BR")} ({ms.pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${ms.pct * 2.4}%`, background: ms.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Top Campanhas por Leads</h3>
              <div className="space-y-2">
                {[
                  { campaign: "iFood OOH Jul",    leads: 1420, conv: 284, rate: 20, color: T.primary },
                  { campaign: "Bradesco Ads",      leads: 980,  conv: 245, rate: 25, color: T.accent  },
                  { campaign: "FitLife Academia",  leads: 760,  conv: 152, rate: 20, color: T.success },
                  { campaign: "Carrefour Jul",     leads: 620,  conv: 93,  rate: 15, color: T.gold    },
                  { campaign: "Unilever Q3",       leads: 410,  conv: 115, rate: 28, color: T.warning },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: T.panel }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                      style={{ background: c.color + "20", color: c.color }}>{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{c.campaign}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{c.leads} leads · {c.conv} convertidos</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black" style={{ color: c.color }}>{c.rate}%</div>
                      <div className="text-xs" style={{ color: T.textSub }}>conversão</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
