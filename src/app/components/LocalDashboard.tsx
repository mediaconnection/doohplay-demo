import { useState } from "react";
import {
  LayoutDashboard, Tv, FileVideo, Megaphone, DollarSign, BarChart2, Settings,
  Bell, Plus, TrendingUp, Calendar, ChevronRight, Eye, Wifi, Play,
  AlertCircle, CheckCircle2, ArrowUp, Download, Image, Film, Clock,
  RefreshCw, Zap, Star, MessageSquare, MapPin
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { Sidebar } from "./shared/Sidebar";
import { MobileNav } from "./shared/MobileNav";
import { KPICard } from "./shared/KPICard";
import { StatusBadge } from "./shared/StatusBadge";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { label: "Minha TV", icon: Tv, id: "tv" },
  { label: "Conteúdo", icon: FileVideo, id: "content" },
  { label: "Anúncios", icon: Megaphone, id: "ads", badge: 3 },
  { label: "Ganhos", icon: DollarSign, id: "earnings" },
  { label: "Relatórios", icon: BarChart2, id: "reports" },
  { label: "Configurações", icon: Settings, id: "settings" },
];

const revenueData = [
  { mes: "Jan", valor: 520 }, { mes: "Fev", valor: 640 }, { mes: "Mar", valor: 590 },
  { mes: "Abr", valor: 720 }, { mes: "Mai", valor: 680 }, { mes: "Jun", valor: 847 },
];

const weekData = [
  { day: "Seg", views: 380 }, { day: "Ter", views: 420 }, { day: "Qua", views: 510 },
  { day: "Qui", views: 480 }, { day: "Sex", views: 620 }, { day: "Sáb", views: 540 }, { day: "Dom", views: 290 },
];

const activeAds = [
  { name: "Bradesco — Black Friday", category: "Banco", views: 1240, status: "active" as const, revenue: "R$ 180", logo: "🏦" },
  { name: "iFood — Cupom 30%", category: "Delivery", views: 980, status: "active" as const, revenue: "R$ 140", logo: "🍔" },
  { name: "Natura — Perfumes", category: "Beleza", views: 650, status: "paused" as const, revenue: "R$ 90", logo: "💄" },
];

const paymentHistory = [
  { date: "10 Mai", amount: "R$ 720,00", status: "Pago", method: "PIX" },
  { date: "10 Abr", amount: "R$ 680,00", status: "Pago", method: "PIX" },
  { date: "10 Mar", amount: "R$ 590,00", status: "Pago", method: "PIX" },
  { date: "10 Fev", amount: "R$ 640,00", status: "Pago", method: "PIX" },
];

const contentItems = [
  { title: "Promoção Pão Francês", type: "Imagem", duration: "15s", status: "active" as const, views: 2840 },
  { title: "Cardápio do Dia", type: "Vídeo", duration: "30s", status: "active" as const, views: 1920 },
  { title: "Promoção Fim de Semana", type: "Imagem", duration: "10s", status: "paused" as const, views: 740 },
  { title: "Boas-vindas Clientes", type: "Vídeo", duration: "20s", status: "active" as const, views: 3120 },
];

interface LocalDashboardProps {
  onBack: () => void;
}

function DashboardView() {
  return (
    <div className="space-y-6">
      {/* TV Status banner */}
      <div className="bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
            <Tv size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#15803D]">Sua TV está online e funcionando</p>
            <p className="text-xs text-[#15803D]/70">Última sincronização: 2 minutos atrás · 3 anúncios em exibição</p>
          </div>
        </div>
        <StatusBadge status="online" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Receita este mês" value="R$ 847" change="+23% vs mai" changeType="up" icon={DollarSign} iconColor="#22C55E" iconBg="#DCFCE7" />
        <KPICard title="Saldo a receber" value="R$ 847" suffix="em 10/Jul" icon={Calendar} iconColor="#2563EB" iconBg="#DBEAFE" />
        <KPICard title="Campanhas ativas" value="3" change="1 pausada" changeType="neutral" icon={Play} iconColor="#FF6B00" iconBg="#FFF7ED" />
        <KPICard title="Visualizações" value="2.870" change="+12% esta semana" changeType="up" icon={Eye} iconColor="#00A3FF" iconBg="#E0F2FE" />
        <KPICard title="Status da TV" value="Online" suffix="SCR-00847" icon={Wifi} iconColor="#22C55E" iconBg="#DCFCE7" />
      </div>

      {/* Minha TV Agora */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Minha TV Agora</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#DCFCE7", color: "#15803D" }}>Ao vivo na sua TV</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* TV Mockup */}
          <div className="lg:col-span-2 p-5 flex items-center justify-center bg-[#020617]" style={{ minHeight: 200 }}>
            <div className="relative w-full max-w-sm">
              <div className="rounded-2xl overflow-hidden border-4 border-[#1E293B] shadow-2xl" style={{ background: "#020617" }}>
                <div className="aspect-video relative flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0F172A 0%, #020617 100%)" }}>
                  <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 50% 40%, #22C55E, transparent 60%)" }} />
                  <div className="relative z-10 text-center px-6">
                    <p className="text-[#22C55E] text-xs font-mono uppercase tracking-widest mb-2">☕ Promoção do Dia</p>
                    <p className="text-white text-2xl font-extrabold mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Café + Pão de Queijo</p>
                    <p className="text-4xl font-extrabold" style={{ color: "#22C55E", fontFamily: "'Inter Tight', sans-serif" }}>R$ 9,90</p>
                    <p className="text-white/40 text-xs mt-3">Bradesco · Válido hoje</p>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#22C55E] rounded-full px-2.5 py-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-[10px] font-bold">AO VIVO</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2 py-1">
                    <p className="text-white/70 text-[10px] font-mono">00:12 restante</p>
                  </div>
                </div>
                <div className="flex justify-center pb-1 pt-0.5" style={{ background: "#0F172A" }}>
                  <div className="w-16 h-0.5 rounded-full" style={{ background: "#1E293B" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Em exibição agora</p>
              <p className="font-semibold text-foreground">Café + Pão de Queijo</p>
              <p className="text-sm text-muted-foreground">Bradesco Black Friday · ativo</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-border">
              <div className="w-20 h-20 rounded-lg overflow-hidden" style={{ background: "#000" }}>
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <rect width="80" height="80" fill="white" />
                  <rect x="5" y="5" width="20" height="20" rx="2" fill="#020617" />
                  <rect x="8" y="8" width="14" height="14" rx="1" fill="white" />
                  <rect x="11" y="11" width="8" height="8" fill="#020617" />
                  <rect x="55" y="5" width="20" height="20" rx="2" fill="#020617" />
                  <rect x="58" y="8" width="14" height="14" rx="1" fill="white" />
                  <rect x="61" y="11" width="8" height="8" fill="#020617" />
                  <rect x="5" y="55" width="20" height="20" rx="2" fill="#020617" />
                  <rect x="8" y="58" width="14" height="14" rx="1" fill="white" />
                  <rect x="11" y="61" width="8" height="8" fill="#020617" />
                  {[30,33,36,39,42,45,48,51].map((x, i) => (
                    <rect key={i} x={x} y={5} width="2" height="2" fill="#020617" />
                  ))}
                  {[30,36,42,48].map((y, i) => (
                    <rect key={i} x={5} y={y} width="2" height="2" fill="#020617" />
                  ))}
                  {[30,33,39,45,51].map((y, i) => (
                    <rect key={i} x={55} y={y} width="2" height="2" fill="#020617" />
                  ))}
                  {[30,33,36,39,42,45,48].map((x, i) => (
                    <rect key={i} x={x} y={30 + i * 3} width="2" height="2" fill="#020617" />
                  ))}
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Escaneie para ver a promoção</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Próximo anúncio</span>
                <span className="font-medium text-foreground">iFood · 00:43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visualizações hoje</span>
                <span className="font-medium text-foreground">847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ganho hoje</span>
                <span className="font-bold" style={{ color: "#22C55E" }}>R$ 42,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Quanto ganhei este mês?</h3>
              <p className="text-xs text-muted-foreground">Receita dos últimos 6 meses</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#22C55E]" style={{ fontFamily: "'Inter Tight', sans-serif" }}>R$ 847</p>
              <p className="text-xs text-[#22C55E] flex items-center gap-1 justify-end"><TrendingUp size={12} /> +23%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="local-green-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [`R$ ${v}`, "Receita"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="valor" stroke="#22C55E" strokeWidth={2.5} fill="url(#local-green-grad)" dot={false} activeDot={{ r: 5, fill: "#22C55E" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Calendário de pagamentos</h3>
          <div className="space-y-3">
            {[
              { date: "10 Jun", amount: "R$ 420,00", status: "Processado", highlight: false },
              { date: "10 Jul", amount: "R$ 847,00", status: "Agendado", highlight: true },
              { date: "10 Ago", amount: "R$ —", status: "Pendente", highlight: false },
            ].map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${p.highlight ? "bg-[#EFF6FF] border border-[#BFDBFE]" : "bg-secondary"}`}>
                <div>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                  <p className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{p.amount}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  p.status === "Processado" ? "bg-[#DCFCE7] text-[#15803D]" :
                  p.status === "Agendado" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-secondary text-muted-foreground"
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold text-[#22C55E] border border-[#22C55E] hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-2">
            <DollarSign size={14} /> Ver meus ganhos
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Quais anúncios estão rodando?</h3>
          <button className="text-sm text-[#2563EB] font-medium hover:underline">Ver todos</button>
        </div>
        <div className="space-y-2">
          {activeAds.map((ad, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-border flex items-center justify-center text-xl shrink-0">{ad.logo}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ad.name}</p>
                <p className="text-xs text-muted-foreground">{ad.category} · {ad.views.toLocaleString()} visualizações</p>
              </div>
              <StatusBadge status={ad.status} />
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[#22C55E]">{ad.revenue}</p>
                <p className="text-xs text-muted-foreground">este mês</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#EFF6FF] to-[#E0F2FE] border border-[#BFDBFE] rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#1D4ED8]">Adicione uma promoção da sua loja</p>
            <p className="text-sm text-[#1D4ED8]/80">Aumente o engajamento em até 40% com conteúdo próprio.</p>
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0">
          <Plus size={14} /> Adicionar promoção
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#00A3FF] flex items-center justify-center">
            <Star size={13} className="text-white" />
          </div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Sugestões de IA</h3>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "#EFF6FF", color: "#2563EB" }}>4 oportunidades</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: "⏰", color: "#2563EB", bg: "#EFF6FF", title: "Ative o horário das 18h–20h", desc: "Seu fill rate é de apenas 45% neste período. A IA encontrou 3 anunciantes disponíveis.", gain: "+R$ 62/mês" },
            { icon: "🏦", color: "#22C55E", bg: "#F0FDF4", title: "Novo anunciante disponível: Banco Itaú", desc: "Campanha de 90 dias · CPM R$ 12,00 · alto match com seu público.", gain: "+R$ 240/mês" },
            { icon: "☀️", color: "#F59E0B", bg: "#FFFBEB", title: "Adicione promoção de fim de tarde", desc: "Telas com conteúdo próprio 16h–18h têm 3× mais engajamento.", gain: "+34% views" },
            { icon: "💡", color: "#8B5CF6", bg: "#F5F3FF", title: "Potencial não realizado: R$ 320/mês", desc: "Com 3 melhorias simples, você pode chegar a R$ 1.167/mês até setembro.", gain: "R$ 1.167 em set/26" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer group" style={{ background: "#F8FAFC" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.gain}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#00A3FF] hover:opacity-90 flex items-center justify-center gap-2">
          <Star size={14} /> Ver AI Revenue Center completo
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ganhos Futuros</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {[
            { mes: "Jul/26", valor: "R$ 980", label: "Receita prevista", color: "#2563EB", bg: "#EFF6FF" },
            { mes: "Ago/26", valor: "R$ 1.120", label: "Estimado pela IA", color: "#22C55E", bg: "#F0FDF4" },
            { mes: "Set/26", valor: "R$ 1.240", label: "Projeção otimista", color: "#22C55E", bg: "#F0FDF4" },
          ].map((p, i) => (
            <div key={i} className="rounded-xl p-4 text-center" style={{ background: p.bg, border: `1px solid ${p.color}20` }}>
              <p className="text-xs text-muted-foreground mb-1">{p.mes}</p>
              <p className="text-2xl font-extrabold" style={{ color: p.color, fontFamily: "'Inter Tight', sans-serif" }}>{p.valor}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4" style={{ background: "#F8FAFC" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">Projeção de crescimento</p>
            <p className="text-xs" style={{ color: "#22C55E" }}>+46% em 3 meses</p>
          </div>
          <div className="flex items-end gap-1.5 h-10">
            {[847, 980, 1120, 1240].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / 1240) * 100}%`, background: i === 0 ? "#22C55E" : `#22C55E${Math.round(40 + i * 20).toString(16)}` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Jun/26</span><span>Jul/26</span><span>Ago/26</span><span>Set/26</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MinhaTVView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-[#020617] aspect-video relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#020617]" />
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-3">🥐</div>
              <p className="text-white font-bold text-xl" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Pão Francês</p>
              <p className="text-[#00A3FF] text-sm mt-1">R$ 0,89 cada</p>
              <p className="text-white/50 text-xs mt-3">Exibindo agora · Bradesco Next</p>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#22C55E] rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">AO VIVO</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">TV Entrada Principal</p>
                <p className="text-xs text-muted-foreground">SCR-00847 · Android TV 11</p>
              </div>
              <StatusBadge status="online" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Sinal", value: "Excelente", color: "#22C55E" },
                { label: "Uptime", value: "99.8%", color: "#22C55E" },
                { label: "Temp.", value: "42°C", color: "#FACC15" },
              ].map((s, i) => (
                <div key={i} className="bg-secondary rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Informações da Tela</h3>
            <div className="space-y-2">
              {[
                { label: "Modelo", value: "Chromecast 4K" },
                { label: "SO", value: "Android TV 11" },
                { label: "App versão", value: "v2.4.1" },
                { label: "Resolução", value: "1920 × 1080 (FHD)" },
                { label: "IP local", value: "192.168.0.24" },
                { label: "Última sync", value: "há 2 min" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ações</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Reiniciar app", icon: RefreshCw, color: "#2563EB" },
                { label: "Forçar sync", icon: Wifi, color: "#22C55E" },
                { label: "Screenshot", icon: Image, color: "#FF6B00" },
                { label: "Suporte", icon: MessageSquare, color: "#00A3FF" },
              ].map((action, i) => (
                <button key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                  <action.icon size={16} style={{ color: action.color }} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Playlist em execução</h3>
          <span className="text-xs text-muted-foreground">8 itens · ~3min loop</span>
        </div>
        <div className="space-y-2">
          {[
            { order: 1, name: "Bradesco — Black Friday", dur: "15s", type: "Anúncio", active: true },
            { order: 2, name: "Cardápio do Dia", dur: "30s", type: "Conteúdo", active: false },
            { order: 3, name: "iFood — Cupom 30%", dur: "15s", type: "Anúncio", active: false },
            { order: 4, name: "Boas-vindas Clientes", dur: "20s", type: "Conteúdo", active: false },
          ].map((item) => (
            <div key={item.order} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${item.active ? "bg-[#EFF6FF] border border-[#BFDBFE]" : "hover:bg-secondary"}`}>
              <span className="text-xs font-mono text-muted-foreground w-5">{item.order}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.type === "Anúncio" ? "#EFF6FF" : "#F0FDF4" }}>
                {item.active
                  ? <Play size={14} className="text-[#2563EB]" />
                  : item.type === "Anúncio"
                    ? <Megaphone size={14} className="text-[#2563EB]" />
                    : <Film size={14} className="text-[#22C55E]" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.type === "Anúncio" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#DCFCE7] text-[#15803D]"}`}>{item.type}</span>
              <span className="text-xs font-mono text-muted-foreground">{item.dur}</span>
              {item.active && <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GanhosView() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
        <p className="text-sm opacity-80 mb-1">Saldo a receber</p>
        <p className="text-5xl font-extrabold mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>R$ 847,00</p>
        <p className="text-sm opacity-70">Pagamento em 10 de julho de 2026 · via PIX</p>
        <div className="flex items-center gap-4 mt-5">
          <button className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#2563EB] hover:opacity-90 transition-opacity flex items-center gap-2">
            <Download size={14} /> Extrato PDF
          </button>
          <button className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2">
            <ArrowUp size={14} /> Solicitar adiantamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total acumulado", value: "R$ 4.197", sub: "desde o início", color: "#22C55E" },
          { label: "Média mensal", value: "R$ 699", sub: "últimos 6 meses", color: "#2563EB" },
          { label: "Melhor mês", value: "R$ 847", sub: "Junho 2026", color: "#FF6B00" },
          { label: "Anúncios pagantes", value: "3", sub: "ativos este mês", color: "#00A3FF" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="font-bold text-xl" style={{ color: s.color, fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Visualizações por dia</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barSize={32}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => [`${v} views`, "Visualizações"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Bar dataKey="views" fill="#22C55E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Histórico de pagamentos</h3>
          <button className="text-sm text-[#2563EB] font-medium hover:underline flex items-center gap-1">
            <Download size={14} /> Exportar
          </button>
        </div>
        <div className="space-y-2">
          {paymentHistory.map((p, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{p.date}</p>
                <p className="text-xs text-muted-foreground">{p.method}</p>
              </div>
              <span className="text-xs bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 rounded-full font-medium">{p.status}</span>
              <p className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{p.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Meu Conteúdo</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus vídeos, imagens e promoções</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
          <Plus size={16} /> Adicionar conteúdo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contentItems.map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center relative">
              <div className="text-4xl">{item.type === "Vídeo" ? "🎦" : "🖼️"}</div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                {item.type === "Vídeo"
                  ? <Film size={12} className="text-[#2563EB]" />
                  : <Image size={12} className="text-[#2563EB]" />}
                <span className="text-xs text-[#2563EB] font-medium bg-white/80 px-1.5 py-0.5 rounded">{item.type}</span>
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="text-xs text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">{item.duration}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{item.title}</p>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye size={12} /> {item.views.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#F8FAFC] to-[#EFF6FF] border-2 border-dashed border-[#BFDBFE] rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-3">
          <Plus size={24} className="text-[#2563EB]" />
        </div>
        <p className="font-semibold text-foreground mb-1">Adicionar nova promoção</p>
        <p className="text-sm text-muted-foreground mb-4">Upload de imagem ou vídeo da sua loja</p>
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
          Escolher arquivo
        </button>
      </div>
    </div>
  );
}

export default function LocalDashboard({ onBack }: LocalDashboardProps) {
  const [activeNav, setActiveNav] = useState("dashboard");

  const renderContent = () => {
    switch (activeNav) {
      case "tv": return <MinhaTVView />;
      case "earnings": return <GanhosView />;
      case "content": return <ContentView />;
      default: return <DashboardView />;
    }
  };

  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    tv: "Minha TV",
    content: "Conteúdo",
    ads: "Anúncios",
    earnings: "Ganhos",
    reports: "Relatórios",
    settings: "Configurações",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar items={navItems} activeItem={activeNav} onNavigate={setActiveNav} tier="local" onBack={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              {titles[activeNav]} — Padaria São Paulo
            </h1>
            <p className="text-xs text-muted-foreground">Sexta-feira, 07 de junho de 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#22C55E] hover:opacity-90 transition-opacity">
              <Plus size={16} /> Adicionar promoção
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      <MobileNav items={navItems} activeItem={activeNav} onNavigate={setActiveNav} accentColor="#22C55E" />
    </div>
  );
}
