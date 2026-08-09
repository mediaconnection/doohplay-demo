import { ArrowLeft, Plus, Download, TrendingUp, DollarSign, QrCode, Tag, BarChart2, ShoppingBag, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const dark = { bg: "#020617", card: "#071225", border: "#13233E", sub: "#94A3B8" };

const revenueByChannel = [
  { mes: "Jan", local: 180000, nacional: 320000 }, { mes: "Fev", local: 210000, nacional: 380000 },
  { mes: "Mar", local: 195000, nacional: 350000 }, { mes: "Abr", local: 240000, nacional: 420000 },
  { mes: "Mai", local: 270000, nacional: 460000 }, { mes: "Jun", local: 310000, nacional: 537000 },
];

const byCategory = [
  { name: "Farmácia", value: 28, color: "#22C55E" }, { name: "Padaria", value: 22, color: "#2563EB" },
  { name: "Academia", value: 18, color: "#00A3FF" }, { name: "Mercado", value: 16, color: "#FF6B00" },
  { name: "Restaurante", value: 16, color: "#FACC15" },
];

const topAdvertisers = [
  { name: "Bradesco", segment: "Banco", revenue: "R$ 182K", growth: "+24%", screens: 320 },
  { name: "iFood", segment: "Delivery", revenue: "R$ 141K", growth: "+18%", screens: 210 },
  { name: "Natura", segment: "Beleza", revenue: "R$ 93K", growth: "+12%", screens: 180 },
  { name: "Samsung", segment: "Tech", revenue: "R$ 321K", growth: "+31%", screens: 410 },
  { name: "Ambev", segment: "Bebidas", revenue: "R$ 212K", growth: "+9%", screens: 290 },
];

const storeRanking = [
  { name: "Drogasil Paulista", segment: "Farmácia", revenue: "R$ 8.200", qr: 412, coupons: 87 },
  { name: "Padaria Modelo", segment: "Padaria", revenue: "R$ 4.700", qr: 284, coupons: 63 },
  { name: "Smart Fit Centro", segment: "Academia", revenue: "R$ 6.100", qr: 198, coupons: 41 },
  { name: "Carrefour Morumbi", segment: "Mercado", revenue: "R$ 12.400", qr: 640, coupons: 148 },
];

interface RetailMediaCenterProps {
  onBack: () => void;
}

export default function RetailMediaCenter({ onBack }: RetailMediaCenterProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Retail Media Revenue Center</h1>
            <p className="text-xs" style={{ color: dark.sub }}>Monetização de telas em pontos de venda · Junho 2026</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border" style={{ color: dark.sub, borderColor: dark.border }}>
            <Download size={14} /> Exportar performance
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90">
            <Plus size={15} /> Criar pacote de mídia
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Receita total", value: "R$ 847K", sub: "+21% MoM", color: "#22C55E", icon: DollarSign },
            { label: "Receita local", value: "R$ 310K", sub: "lojas parceiras", color: "#2563EB", icon: ShoppingBag },
            { label: "Receita nacional", value: "R$ 537K", sub: "anunciantes nacionais", color: "#00A3FF", icon: BarChart2 },
            { label: "Revenue Share", value: "36.6%", sub: "para parceiros", color: "#FF6B00", icon: TrendingUp },
          ].map((k, i) => (
            <div key={i} className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: dark.sub }}>{k.label}</span>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{k.value}</p>
              <p className="text-xs mt-1" style={{ color: k.color }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "QR Scans", value: "12.480", icon: QrCode, color: "#00A3FF" },
            { label: "Cupons resgatados", value: "2.840", icon: Tag, color: "#22C55E" },
            { label: "Conversion Lift", value: "+18.4%", icon: TrendingUp, color: "#FF6B00" },
          ].map((k, i) => (
            <div key={i} className="rounded-xl p-4 border flex items-center gap-4" style={{ background: dark.card, borderColor: dark.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${k.color}15` }}>
                <k.icon size={20} style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{k.value}</p>
                <p className="text-xs" style={{ color: dark.sub }}>{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by channel */}
          <div className="lg:col-span-2 rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Receita por canal</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5" style={{ color: "#2563EB" }}><span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB] inline-block" /> Local</span>
                <span className="flex items-center gap-1.5" style={{ color: "#00A3FF" }}><span className="w-2.5 h-2.5 rounded-sm bg-[#00A3FF] inline-block" /> Nacional</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={revenueByChannel}>
                <defs>
                  <linearGradient key="rm-local-grad" id="rm-local-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient key="rm-nacional-grad" id="rm-nacional-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00A3FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`R$ ${(v / 1000).toFixed(0)}K`]} contentStyle={{ borderRadius: 8, border: `1px solid ${dark.border}`, background: dark.card, color: "#CBD5E1", fontSize: 11 }} />
                <Area key="area-local" type="monotone" dataKey="local" stroke="#2563EB" strokeWidth={2} fill="url(#rm-local-grad)" dot={false} name="Local" />
                <Area key="area-nacional" type="monotone" dataKey="nacional" stroke="#00A3FF" strokeWidth={2} fill="url(#rm-nacional-grad)" dot={false} name="Nacional" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* By category pie */}
          <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
            <h3 className="font-semibold text-white mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Por segmento</h3>
            <div className="flex justify-center mb-4">
              <PieChart width={140} height={140}>
                <Pie key="pie-data" data={byCategory} cx={70} cy={70} innerRadius={42} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {byCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-2">
              {byCategory.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-mono font-bold" style={{ color: c.color }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top advertisers */}
        <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: dark.border }}>
            <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Top Anunciantes</h3>
            <Star size={16} className="text-[#FACC15]" />
          </div>
          <div className="divide-y" style={{ borderColor: dark.border }}>
            {topAdvertisers.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                <span className="text-sm font-mono font-bold w-5" style={{ color: dark.sub }}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#2563EB20" }}>
                  <ShoppingBag size={14} className="text-[#2563EB]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  <p className="text-xs" style={{ color: dark.sub }}>{a.segment} · {a.screens} telas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{a.revenue}</p>
                  <p className="text-xs" style={{ color: "#22C55E" }}>{a.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store ranking */}
        <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
          <div className="p-5 border-b" style={{ borderColor: dark.border }}>
            <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ranking de Lojas</h3>
          </div>
          <div className="grid text-xs px-5 py-2.5" style={{ color: dark.sub, gridTemplateColumns: "2fr 1fr 100px 80px 80px" }}>
            <span>Loja</span><span>Segmento</span><span>Receita</span><span>QR Scans</span><span>Cupons</span>
          </div>
          <div className="divide-y" style={{ borderColor: dark.border }}>
            {storeRanking.map((s, i) => (
              <div key={i} className="grid items-center px-5 py-3 hover:bg-white/[0.02]" style={{ gridTemplateColumns: "2fr 1fr 100px 80px 80px" }}>
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs" style={{ color: dark.sub }}>{s.segment}</p>
                <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{s.revenue}</p>
                <p className="text-sm font-mono text-white">{s.qr}</p>
                <p className="text-sm font-mono text-white">{s.coupons}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
