import { useState } from "react";
import {
  ArrowLeft, Plus, Download, Filter, Search, Shield, TrendingUp, Eye,
  DollarSign, Activity, Users, BarChart2, ChevronRight, CheckCircle2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const dark = { bg: "#020617", card: "#071225", border: "#13233E", sub: "#94A3B8" };

const campaigns = [
  { name: "Bradesco Black Friday", advertiser: "Bradesco", screens: 320, impressions: "1.2M", budget: "R$ 180K", used: 72, status: "active", trust: 98.9, cpm: "R$ 8.50", reach: "890K" },
  { name: "iFood Cupons", advertiser: "iFood", screens: 210, impressions: "980K", budget: "R$ 140K", used: 58, status: "active", trust: 97.8, cpm: "R$ 7.20", reach: "720K" },
  { name: "Natura Perfumes", advertiser: "Natura", screens: 180, impressions: "650K", budget: "R$ 90K", used: 85, status: "paused", trust: 96.5, cpm: "R$ 6.90", reach: "510K" },
  { name: "Samsung Galaxy A", advertiser: "Samsung", screens: 410, impressions: "2.1M", budget: "R$ 320K", used: 41, status: "active", trust: 99.1, cpm: "R$ 9.80", reach: "1.4M" },
  { name: "Ambev Verão", advertiser: "Ambev", screens: 290, impressions: "1.8M", budget: "R$ 210K", used: 93, status: "active", trust: 97.2, cpm: "R$ 7.60", reach: "1.1M" },
];

const deliveryData = [
  { hour: "00h", value: 12000 }, { hour: "03h", value: 6000 }, { hour: "06h", value: 28000 },
  { hour: "09h", value: 95000 }, { hour: "12h", value: 142000 }, { hour: "15h", value: 128000 },
  { hour: "18h", value: 178000 }, { hour: "21h", value: 110000 },
];

const regionData = [
  { region: "São Paulo", value: 42 }, { region: "Rio", value: 18 },
  { region: "MG", value: 14 }, { region: "PR", value: 11 }, { region: "Outros", value: 15 },
];

const statusColor = (s: string) => s === "active"
  ? { bg: "#22C55E20", text: "#22C55E", label: "Ativo" }
  : { bg: "#FACC1520", text: "#FACC15", label: "Pausado" };

interface CampaignManagerProps {
  onBack: () => void;
}

export default function CampaignManager({ onBack }: CampaignManagerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = campaigns.filter(c =>
    (statusFilter === "all" || c.status === statusFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.advertiser.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg }}>
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: dark.sub }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Campaign Performance Center</h1>
            <p className="text-xs" style={{ color: dark.sub }}>124 campanhas · 18 agências · Proof-of-Play auditável</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
            <Activity size={11} className="animate-pulse" /> LIVE
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border" style={{ color: dark.sub, borderColor: dark.border }}>
            <Download size={14} /> Exportar relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
            <Plus size={15} /> Criar campanha
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Impressões", value: "6.7M", icon: Eye, color: "#00A3FF" },
            { label: "Reach", value: "4.6M", icon: Users, color: "#22C55E" },
            { label: "Freqüência", value: "1.46", icon: Activity, color: "#FACC15" },
            { label: "CPM médio", value: "R$ 7.90", icon: BarChart2, color: "#2563EB" },
            { label: "Budget usado", value: "R$ 940K", icon: DollarSign, color: "#FF6B00" },
            { label: "ROI estimado", value: "3.2x", icon: TrendingUp, color: "#22C55E" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl p-4 border flex flex-col gap-2" style={{ background: dark.card, borderColor: dark.border }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: dark.sub }}>{kpi.label}</span>
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
              <p className="font-bold text-lg text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Entrega por hora</h3>
                <p className="text-xs" style={{ color: dark.sub }}>Impressões entregues nas últimas 24h</p>
              </div>
              <span className="text-sm font-bold" style={{ color: "#00A3FF", fontFamily: "'Inter Tight', sans-serif" }}>6.7M total</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={deliveryData}>
                <defs>
                  <linearGradient id="cm-delivery-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, "Impressões"]} contentStyle={{ borderRadius: 8, border: `1px solid ${dark.border}`, background: dark.card, color: "#CBD5E1", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#cm-delivery-grad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Distribuição por região</h3>
            <div className="space-y-3">
              {regionData.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#94A3B8" }}>{r.region}</span>
                    <span className="font-mono font-bold" style={{ color: "#00A3FF" }}>{r.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark.bg }}>
                    <div className="h-full rounded-full" style={{ width: `${r.value}%`, backgroundColor: "#00A3FF", opacity: 0.4 + (r.value / 100) * 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
          <div className="p-5 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: dark.border }}>
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg" style={{ backgroundColor: dark.bg, border: `1px solid ${dark.border}` }}>
              <Search size={14} style={{ color: dark.sub }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar campanha ou anunciante..."
                className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-[#475569]"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "paused"].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={statusFilter === f ? { backgroundColor: "#2563EB20", color: "#60A5FA" } : { color: dark.sub }}
                >
                  {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Pausados"}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border" style={{ color: dark.sub, borderColor: dark.border }}>
              <Filter size={13} /> Filtros
            </button>
          </div>

          <div className="grid text-xs px-5 py-2.5" style={{ color: dark.sub, gridTemplateColumns: "2fr 1.2fr 80px 100px 120px 100px 70px 60px" }}>
            <span>Campaign</span><span>Advertiser</span><span>Screens</span><span>Impressions</span>
            <span>Budget</span><span>Status</span><span>Trust</span><span></span>
          </div>

          <div className="divide-y" style={{ borderColor: dark.border }}>
            {filtered.map((c, i) => {
              const sc = statusColor(c.status);
              return (
                <div key={i} className="grid items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors" style={{ gridTemplateColumns: "2fr 1.2fr 80px 100px 120px 100px 70px 60px" }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: dark.sub }}>CPM {c.cpm} · Reach {c.reach}</p>
                  </div>
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{c.advertiser}</p>
                  <p className="text-sm font-mono text-white">{c.screens}</p>
                  <p className="text-sm font-mono text-white">{c.impressions}</p>
                  <div>
                    <p className="text-sm text-white font-mono">{c.budget}</p>
                    <div className="mt-1 w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: dark.bg }}>
                      <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${c.used}%` }} />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: dark.sub }}>{c.used}% usado</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit" style={{ backgroundColor: sc.bg, color: sc.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.text }} />
                    {sc.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Shield size={12} style={{ color: "#00A3FF" }} />
                    <span className="text-sm font-bold font-mono" style={{ color: "#00A3FF" }}>{c.trust}</span>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: dark.sub }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Status de Proof-of-Play</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>97.3% verificado</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Proofs gerados", value: "6.7M", color: "#22C55E", icon: CheckCircle2 },
              { label: "Verificados on-chain", value: "6.52M", color: "#00A3FF", icon: Shield },
              { label: "Pendentes", value: "120K", color: "#FACC15", icon: Activity },
              { label: "Com falha", value: "60K", color: "#EF4444", icon: Activity },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: dark.bg }}>
                <s.icon size={14} style={{ color: s.color }} className="mb-1" />
                <p className="font-bold text-lg text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</p>
                <p className="text-xs" style={{ color: dark.sub }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
