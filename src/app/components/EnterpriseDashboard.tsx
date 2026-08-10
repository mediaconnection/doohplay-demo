// EnterpriseDashboard.tsx - Full enterprise navigation hub
import { useState } from "react";
import {
  LayoutDashboard, Network, Package, Megaphone, ShoppingBag, DollarSign, Code, Play,
  Shield, Link2, Database, AlertCircle, BarChart2, Settings, Plus, Bell,
  CheckCircle2, TrendingUp, Activity, Cpu, Lock, FileText, Download,
  Globe, Filter, RefreshCw, Eye, Clock, Hash, Server, Layers, Brain, Monitor,
  Award, Zap, Target, Building2, Tv, Star, Users, Calendar, CreditCard, MessageCircle, BookOpen, Rocket,
  FlaskConical, Crown, Smartphone, Lightbulb, Layout, HandCoins, SlidersHorizontal,
  Library, BarChart3, Globe2, FileBadge,
  BellRing, DatabaseZap, Receipt, LifeBuoy,
  QrCode, CloudRain, Crosshair,
  PenTool, MapPinned, FileBarChart,
  CalendarClock, ShieldCheck, Code2,
  FileSpreadsheet, ShieldX, Wand2, Building,
  Radio, UserSquare, GitBranch, PenSquare,
  Store, Plug, BrainCircuit, BellDot,
  BadgeCheck, UserCog, SatelliteDish, Wand, PlayCircle, Gauge,
  MessageSquareCode, TvMinimalPlay, Brush,
  Presentation, AppWindow,
  Leaf, Gavel, Map,
  HeartHandshake, Sparkles, Fingerprint, Waypoints
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { MobileNav } from "./shared/MobileNav";
import { StatusBadge } from "./shared/StatusBadge";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "Executive", icon: BarChart2, id: "executive", badge: "NEW" },
  { label: "Cmd Center", icon: Globe, id: "executive-command", badge: "V22" },
  { label: "Investor", icon: TrendingUp, id: "investor-dashboard", badge: "V22" },
  { label: "Network", icon: Network, id: "network" },
  { label: "Marketplace", icon: ShoppingBag, id: "media-marketplace", badge: "V22" },
  { label: "Exchange", icon: Zap, id: "programmatic-exchange", badge: "V22" },
  { label: "Advertiser", icon: Target, id: "advertiser-center", badge: "V22" },
  { label: "Agency", icon: Building2, id: "agency-center", badge: "V22" },
  { label: "Data Intel", icon: Brain, id: "data-intelligence", badge: "V22" },
  { label: "TV Designer", icon: Tv, id: "tv-designer", badge: "NEW" },
  { label: "Onboarding", icon: Zap, id: "onboarding", badge: "NEW" },
  { label: "Parceiros", icon: Star, id: "partner-portal", badge: "NEW" },
  { label: "Relatórios", icon: BarChart2, id: "reports-center", badge: "NEW" },
  { label: "Planos", icon: DollarSign, id: "payment-plans", badge: "NEW" },
  { label: "ProofChain+", icon: Shield, id: "proofchain-center", badge: "NEW" },
  { label: "Studio", icon: Layers, id: "content-studio", badge: "NEW" },
  { label: "Data Room", icon: TrendingUp, id: "investor-dataroom", badge: "NEW" },
  { label: "DSP", icon: Zap, id: "demand-side-platform", badge: "NEW" },
  { label: "Audiência", icon: Users, id: "audience-intelligence", badge: "NEW" },
  { label: "Unicórnio", icon: Star, id: "unicorn-roadmap", badge: "NEW" },
  { label: "Login", icon: Users, id: "login", badge: "NEW" },
  { label: "Acessos", icon: Shield, id: "access-control", badge: "NEW" },
  { label: "Gates", icon: Lock, id: "feature-gates", badge: "NEW" },
  { label: "Dashboard Cliente", icon: Tv, id: "client-dashboard", badge: "NEW" },
  { label: "Advertiser Pro", icon: Target, id: "advertiser-center2", badge: "NEW" },
  { label: "Setup de Tela", icon: Zap, id: "screen-setup", badge: "NEW" },
  { label: "Criar Campanha", icon: Plus, id: "campaign-creator", badge: "NEW" },
  { label: "Verificar Prova", icon: Shield, id: "proof-verifier", badge: "NEW" },
  { label: "Notificações", icon: Bell, id: "notifications", badge: "NEW" },
  { label: "Dispositivos", icon: Tv, id: "device-manager", badge: "NEW" },
  { label: "Otimizar Receita", icon: TrendingUp, id: "revenue-optimizer", badge: "NEW" },
  { label: "Calendário", icon: Calendar, id: "content-calendar", badge: "NEW" },
  { label: "Analytics", icon: BarChart2, id: "analytics-dashboard", badge: "NEW" },
  { label: "Assinatura", icon: CreditCard, id: "billing", badge: "NEW" },
  { label: "Suporte", icon: MessageCircle, id: "support", badge: "NEW" },
  { label: "Início Rápido", icon: Star, id: "onboarding-checklist", badge: "NEW" },
  { label: "Indicações", icon: Users, id: "referral", badge: "NEW" },
  { label: "Metas", icon: Target, id: "goals", badge: "NEW" },
  { label: "Marketplace", icon: Package, id: "marketplace", badge: "NEW" },
  { label: "API & Dev", icon: Code, id: "api-center", badge: "NEW" },
  { label: "Status", icon: Activity, id: "status", badge: "NEW" },
  { label: "WhatsApp", icon: MessageCircle, id: "whatsapp", badge: "NEW" },
  { label: "Exportar", icon: Download, id: "report-exporter", badge: "NEW" },
  { label: "Playlist", icon: Play, id: "playlist", badge: "NEW" },
  { label: "Self-Serve", icon: Target, id: "advertiser-self-serve", badge: "NEW" },
  { label: "Mapa da Rede", icon: Globe, id: "network-map2", badge: "NEW" },
  { label: "DOOH AI", icon: Brain, id: "ai-assistant", badge: "NEW" },
  { label: "Ranking", icon: Award, id: "leaderboard", badge: "NEW" },
  { label: "Inventário", icon: Package, id: "inventory", badge: "NEW" },
  { label: "Franquias", icon: Building2, id: "franchise", badge: "NEW" },
  { label: "Contratos", icon: FileText, id: "contracts", badge: "NEW" },
  { label: "Templates", icon: Layers, id: "creative-templates", badge: "NEW" },
  { label: "Datas", icon: Calendar, id: "events-calendar", badge: "NEW" },
  { label: "Fiscal", icon: Shield, id: "tax-center", badge: "NEW" },
  { label: "White Label", icon: Globe, id: "white-label", badge: "NEW" },
  { label: "Audiências", icon: Target, id: "audience-builder", badge: "NEW" },
  { label: "Benchmark", icon: BarChart2, id: "benchmark", badge: "NEW" },
  { label: "Player", icon: Monitor, id: "player", badge: "NEW" },
  { label: "Integrações", icon: Zap, id: "integrations", badge: "NEW" },
  { label: "Repasses", icon: DollarSign, id: "payouts", badge: "NEW" },
  { label: "Segurança", icon: Lock, id: "security", badge: "NEW" },
  { label: "Novidades", icon: Star, id: "changelog", badge: "NEW" },
  { label: "ROI", icon: TrendingUp, id: "roi-calculator", badge: "NEW" },
  { label: "Ajuda", icon: BookOpen, id: "help-center", badge: "NEW" },
  { label: "Screen Health", icon: Activity, id: "screen-health", badge: "NEW" },
  { label: "Camp. Analytics", icon: BarChart2, id: "campaign-analytics", badge: "NEW" },
  { label: "Demo Público", icon: Play, id: "public-demo", badge: "NEW" },
  { label: "Media Kit", icon: FileText, id: "media-kit", badge: "NEW" },
  { label: "SLA", icon: Shield, id: "sla-dashboard", badge: "NEW" },
  { label: "Seja Parceiro", icon: Users, id: "partner-onboarding", badge: "NEW" },
  { label: "Alertas", icon: Bell, id: "notification-settings", badge: "NEW" },
  { label: "Monitor ao Vivo", icon: Monitor, id: "live-monitor", badge: "NEW" },
  { label: "Planej. Campanhas", icon: Calendar, id: "campaign-planner", badge: "NEW" },
  { label: "Rel. Receita", icon: TrendingUp, id: "revenue-report", badge: "NEW" },
  { label: "Crescimento", icon: Rocket, id: "growth-dashboard", badge: "NEW" },
  { label: "Creative Studio", icon: Layers, id: "ad-creative", badge: "NEW" },
  { label: "Grade de Prog.", icon: Clock, id: "screen-scheduler", badge: "NEW" },
  { label: "Portal Anunciante", icon: Star, id: "client-portal", badge: "NEW" },
  { label: "Saúde Plataforma", icon: Activity, id: "platform-health", badge: "NEW" },
  { label: "Mapa da Rede", icon: Globe, id: "map-view", badge: "NEW" },
  { label: "Motor de Leilão", icon: Zap, id: "ad-auction", badge: "NEW" },
  { label: "CPM Optimizer", icon: Brain, id: "cpm-optimizer", badge: "NEW" },
  { label: "Tour de Boas-Vindas", icon: Star, id: "onboarding-tour", badge: "NEW" },
  { label: "Teste A/B", icon: FlaskConical, id: "ab-test", badge: "NEW" },
  { label: "Super Admin", icon: Crown, id: "multi-tenant", badge: "NEW" },
  { label: "NFS-e", icon: FileText, id: "nfe-center", badge: "NEW" },
  { label: "App Mobile", icon: Smartphone, id: "mobile-dashboard", badge: "NEW" },
  { label: "Brief IA", icon: Lightbulb, id: "campaign-briefing", badge: "NEW" },
  { label: "Digital Signage", icon: Layout, id: "digital-signage", badge: "NEW" },
  { label: "Parceiros", icon: HandCoins, id: "partner-earnings", badge: "NEW" },
  { label: "Configurações", icon: SlidersHorizontal, id: "system-settings", badge: "NEW" },
  { label: "Biblioteca", icon: Library, id: "content-library", badge: "NEW" },
  { label: "Audiência IA", icon: BarChart3, id: "audience-analytics", badge: "NEW" },
  { label: "Programático", icon: Globe2, id: "programmatic-buying", badge: "NEW" },
  { label: "Contratos", icon: FileBadge, id: "contract-manager", badge: "NEW" },
  { label: "Alertas", icon: BellRing, id: "alert-center", badge: "NEW" },
  { label: "Exportar Dados", icon: DatabaseZap, id: "data-export", badge: "NEW" },
  { label: "Cobrança", icon: Receipt, id: "billing-center", badge: "NEW" },
  { label: "Suporte", icon: LifeBuoy, id: "support-center", badge: "NEW" },
  { label: "Lead Capture", icon: QrCode, id: "lead-capture", badge: "NEW" },
  { label: "Weather Ads", icon: CloudRain, id: "weather-trigger", badge: "NEW" },
  { label: "Retargeting", icon: Crosshair, id: "retargeting-engine", badge: "NEW" },
  { label: "White Label", icon: Crown, id: "white-label-admin", badge: "NEW" },
  { label: "Inventário", icon: Package, id: "inventory-manager", badge: "NEW" },
  { label: "Aprovação", icon: PenTool, id: "creative-approval", badge: "NEW" },
  { label: "Geo-Fence", icon: MapPinned, id: "geo-fencing", badge: "NEW" },
  { label: "Relatórios", icon: FileBarChart, id: "report-builder", badge: "NEW" },
  { label: "Agendamento", icon: CalendarClock, id: "ad-scheduler", badge: "NEW" },
  { label: "Compliance", icon: ShieldCheck, id: "compliance-center", badge: "NEW" },
  { label: "Benchmark", icon: TrendingUp, id: "performance-benchmark", badge: "NEW" },
  { label: "API Docs", icon: Code2, id: "api-playground", badge: "NEW" },
  { label: "Media Plan", icon: FileSpreadsheet, id: "media-plan", badge: "NEW" },
  { label: "Anti-Fraude", icon: ShieldX, id: "fraud-detection", badge: "NEW" },
  { label: "Dynamic Ad", icon: Wand2, id: "dynamic-creative", badge: "NEW" },
  { label: "Publisher", icon: Building, id: "publisher-portal", badge: "NEW" },
  { label: "Programmatic", icon: Radio, id: "programmatic-desk", badge: "NEW" },
  { label: "Audiências", icon: UserSquare, id: "audience-planner", badge: "NEW" },
  { label: "Atribuição", icon: GitBranch, id: "attribution-engine", badge: "NEW" },
  { label: "Creative Studio", icon: PenSquare, id: "creative-studio", badge: "NEW" },
  { label: "Marketplace", icon: Store, id: "marketplace-screen", badge: "NEW" },
  { label: "Integrações", icon: Plug, id: "data-integration", badge: "NEW" },
  { label: "Otimizador", icon: BrainCircuit, id: "campaign-optimizer", badge: "NEW" },
  { label: "Notificações", icon: BellDot, id: "notification-center", badge: "NEW" },
  { label: "Usuários", icon: UserCog, id: "user-management", badge: "NEW" },
  { label: "Analytics Explorer", icon: TrendingUp, id: "analytics-explorer", badge: "NEW" },
  { label: "ProofChain", icon: BadgeCheck, id: "proof-of-play", badge: "NEW" },
  { label: "Pricing Calc", icon: Receipt, id: "pricing-calculator", badge: "NEW" },
  { label: "Mapa BR", icon: SatelliteDish, id: "brazil-map", badge: "NEW" },
  { label: "Wizard Camp.", icon: Wand, id: "campaign-wizard", badge: "NEW" },
  { label: "Ad Preview", icon: PlayCircle, id: "ad-preview", badge: "NEW" },
  { label: "Realtime", icon: Gauge, id: "realtime-dashboard", badge: "NEW" },
  { label: "AI Copilot", icon: MessageSquareCode, id: "ai-copilot", badge: "NEW" },
  { label: "Nova Tela", icon: TvMinimalPlay, id: "screen-onboarding", badge: "NEW" },
  { label: "Certificado", icon: Award, id: "certificate-viewer", badge: "NEW" },
  { label: "White Label", icon: Brush, id: "white-label-preview", badge: "NEW" },
  { label: "WA Login",    icon: MessageCircle, id: "whatsapp-otp",   badge: "NEW" },
  { label: "Pitch Deck",  icon: Presentation,  id: "pitch-deck",     badge: "NEW" },
  { label: "App Android", icon: AppWindow,      id: "mobile-showcase",badge: "NEW" },
  { label: "API Docs",    icon: BookOpen,       id: "api-docs",       badge: "NEW" },
  { label: "ESG",         icon: Leaf,           id: "esg-dashboard",  badge: "NEW" },
  { label: "Forecast",    icon: TrendingUp,     id: "revenue-forecast", badge: "NEW" },
  { label: "Smart Bid",   icon: Gavel,          id: "smart-bidding",  badge: "NEW" },
  { label: "OOH Planner", icon: Map,            id: "ooh-planner",    badge: "NEW" },
  { label: "Cust. Success", icon: HeartHandshake, id: "customer-success", badge: "NEW" },
  { label: "AI Creative",  icon: Sparkles,       id: "ai-creative-lab",  badge: "NEW" },
  { label: "Pixel",        icon: Fingerprint,    id: "pixel-tracking",   badge: "NEW" },
  { label: "Network IQ",   icon: Waypoints,      id: "network-intelligence", badge: "NEW" },
  { label: "Campaigns", icon: Megaphone, id: "campaigns" },
  { label: "Retail Media", icon: ShoppingBag, id: "retail" },
  { label: "Revenue", icon: DollarSign, id: "revenue" },
  { label: "Trust Center", icon: Shield, id: "trust" },
  { label: "ProofChain", icon: Link2, id: "proofchain", badge: "LIVE" },
  { label: "Blockchain", icon: Database, id: "blockchain" },
  { label: "Audit Center", icon: Award, id: "audit-center", badge: "NEW" },
  { label: "Alerts", icon: AlertCircle, id: "alerts", badge: 3 },
  { label: "AI Revenue", icon: Brain, id: "ai-revenue", badge: "NEW" },
  { label: "Reports", icon: BarChart2, id: "reports" },
  { label: "Settings", icon: Settings, id: "settings" },
];

const dark = { bg: "#020617", card: "#071225", border: "#13233E", text: "white", sub: "#94A3B8", muted: "#64748B" };

const impressionData = [
  { hour: "00h", value: 85000 }, { hour: "03h", value: 42000 }, { hour: "06h", value: 120000 },
  { hour: "09h", value: 380000 }, { hour: "12h", value: 520000 }, { hour: "15h", value: 490000 },
  { hour: "18h", value: 610000 }, { hour: "21h", value: 430000 },
];

const trustPie = [
  { name: "Verified", value: 97.3, color: "#22C55E" },
  { name: "Pending", value: 1.8, color: "#FACC15" },
  { name: "Failed", value: 0.9, color: "#EF4444" },
];

const proofEvents = [
  { time: "14:32:01", tx: "0x7f3a...d4b2", screen: "SCR-00847", status: "verified" as const, block: 19284721, impressions: 1, hash: "9b4c..." },
  { time: "14:31:58", tx: "0x2c8e...f91a", screen: "SCR-00123", status: "verified" as const, block: 19284720, impressions: 1, hash: "3d8f..." },
  { time: "14:31:55", tx: "0x9b1d...a337", screen: "SCR-00512", status: "verified" as const, block: 19284719, impressions: 1, hash: "7a2e..." },
  { time: "14:31:51", tx: "0x4e7f...c28b", screen: "SCR-00089", status: "pending" as const, block: 19284718, impressions: 1, hash: "1f5b..." },
  { time: "14:31:47", tx: "0x1b3c...e84a", screen: "SCR-01024", status: "verified" as const, block: 19284717, impressions: 1, hash: "6c9d..." },
];

const campaigns = [
  { name: "Samsung Q4 2026", agency: "WPP Brazil", screens: 248, impressions: "1.24M", completion: 94.2, trust: 98, budget: "R$ 482K", status: "active" as const },
  { name: "Bradesco Black Nov", agency: "AlmapBBDO", screens: 189, impressions: "980K", completion: 91.7, trust: 97, budget: "R$ 310K", status: "active" as const },
  { name: "iFood SP Metro", agency: "DPZ&T", screens: 92, impressions: "720K", completion: 88.1, trust: 95, budget: "R$ 185K", status: "active" as const },
  { name: "Natura Natal", agency: "Y&R", screens: 311, impressions: "540K", completion: 99.2, trust: 99, budget: "R$ 620K", status: "active" as const },
];

const networkScreens = [
  { region: "São Paulo", online: 412, total: 430, sla: "98.7%" },
  { region: "Rio de Janeiro", online: 218, total: 224, sla: "97.9%" },
  { region: "Minas Gerais", online: 184, total: 196, sla: "95.1%" },
  { region: "Paraná", online: 142, total: 148, sla: "96.8%" },
  { region: "Bahia", online: 98, total: 108, sla: "90.4%" },
  { region: "Outras", online: 135, total: 141, sla: "95.7%" },
];

const blockchainBlocks = [
  { block: "19284721", time: "14:32:01", txs: 847, size: "1.2 MB", root: "0x9b4c...f21a", anchored: true },
  { block: "19284720", time: "14:31:58", txs: 923, size: "1.4 MB", root: "0x3d8f...b09c", anchored: true },
  { block: "19284719", time: "14:31:55", txs: 701, size: "1.1 MB", root: "0x7a2e...c34d", anchored: true },
  { block: "19284718", time: "14:31:51", txs: 1024, size: "1.6 MB", root: "0x1f5b...e87f", anchored: false },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  userSession?: { name?: string; plan?: string; profile?: string; phone?: string } | null;
  screens?: { id: string; name: string; status: string }[];
  aiQuota?: { used: number; limit: number; remaining: number } | null;
  onLogout?: () => void;
}

function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border ${className}`} style={{ background: dark.card, borderColor: dark.border }}>
      {children}
    </div>
  );
}

function DarkKPI({ title, value, change, up, icon: Icon, color, bg }: any) {
  return (
    <DarkCard className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: dark.sub }}>{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <div className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
          <TrendingUp size={10} className={up ? "" : "rotate-180"} />
          {change}
        </div>
      </div>
    </DarkCard>
  );
}

function OverviewView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DarkKPI title="Impressões hoje" value="4.2M" change="+8.4% vs ontem" up icon={Activity} color="#00A3FF" bg="#00A3FF15" />
        <DarkKPI title="Telas ativas" value="1.189/1.247" change="58 offline" up={false} icon={Cpu} color="#22C55E" bg="#22C55E15" />
        <DarkKPI title="SLA da rede" value="98.7%" change="+0.3pp" up icon={TrendingUp} color="#22C55E" bg="#22C55E15" />
        <DarkKPI title="Trust Score" value="97.3" change="Excelente" up icon={Shield} color="#00A3FF" bg="#00A3FF15" />
        <DarkKPI title="Receita" value="R$ 847K" change="+21% MoM" up icon={DollarSign} color="#22C55E" bg="#22C55E15" />
        <DarkKPI title="Campanhas" value="124" change="18 agências" up={false} icon={Megaphone} color="#2563EB" bg="#2563EB15" />
        <DarkKPI title="Proofs verificados" value="2.8M" change="hoje" up icon={CheckCircle2} color="#22C55E" bg="#22C55E15" />
        <DarkKPI title="Alertas críticos" value="3" change="2 novos" up={false} icon={AlertCircle} color="#EF4444" bg="#EF444415" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DarkCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Impressões em tempo real</h3>
              <p className="text-xs" style={{ color: dark.sub }}>Últimas 24h · atualização a cada 30s</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
              <Activity size={11} className="animate-pulse" /> LIVE
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={impressionData}>
              <defs>
                <linearGradient key="ent-cyan-grad" id="ent-cyan-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00A3FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis key="ent-xaxis" dataKey="hour" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis key="ent-yaxis" hide />
              <Tooltip key="ent-tooltip" formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, "Impressões"]} contentStyle={{ borderRadius: 8, border: `1px solid ${dark.border}`, background: dark.card, color: "#CBD5E1", fontSize: 12 }} />
              <Area key="ent-area" type="monotone" dataKey="value" stroke="#00A3FF" strokeWidth={2} fill="url(#ent-cyan-grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DarkCard>
        <DarkCard className="p-5">
          <h3 className="font-semibold text-white mb-1">Trust Score</h3>
          <p className="text-xs mb-4" style={{ color: dark.sub }}>Verificação criptográfica em tempo real</p>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <PieChart width={140} height={140}>
                <Pie key="pie-data" data={trustPie} cx={70} cy={70} innerRadius={48} outerRadius={64} dataKey="value" strokeWidth={0}>
                  {trustPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-white">97.3</span>
                <span className="text-xs text-[#22C55E]">Excelente</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {trustPie.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold" style={{ color: item.color }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </DarkCard>
      </div>
      <DarkCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">ProofChain — Verificações recentes</h3>
            <p className="text-xs" style={{ color: dark.sub }}>Cada exibição registrada imutavelmente</p>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: "#00A3FF", borderColor: "#00A3FF40" }}>Ver ProofChain completo</button>
        </div>
        <div className="space-y-2">
          {proofEvents.slice(0, 3).map((ev, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: dark.bg }}>
              <CheckCircle2 size={16} style={{ color: ev.status === "verified" ? "#22C55E" : "#FACC15" }} className="shrink-0" />
              <span className="font-mono text-xs" style={{ color: dark.sub }}>{ev.time}</span>
              <span className="font-mono text-xs font-medium" style={{ color: "#00A3FF" }}>{ev.tx}</span>
              <span className="text-xs flex-1" style={{ color: dark.sub }}>{ev.screen}</span>
              <span className="font-mono text-xs" style={{ color: dark.muted }}>#{ev.block}</span>
              <StatusBadge status={ev.status} customLabel={ev.status === "verified" ? "Verificado" : "Pendente"} />
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

export default function EnterpriseDashboard({ onBack, onNavigate, userSession, screens, aiQuota, onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("overview");

  const renderContent = () => {
    switch (activeNav) {
      case "trust": return <div className="p-8 text-white">Trust Center View</div>;
      case "proofchain": return <div className="p-8 text-white">ProofChain View</div>;
      case "blockchain": return <div className="p-8 text-white">Blockchain View</div>;
      case "campaigns": return <div className="p-8 text-white">Campaigns View</div>;
      case "network": return <div className="p-8 text-white">Network View</div>;
      default: return <OverviewView />;
    }
  };

  const titles: Record<string, string> = {
    overview: "Network Operations Center", network: "Network",
    campaigns: "Campaign Performance", trust: "Trust Center",
    proofchain: "ProofChain", blockchain: "Blockchain",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: dark.bg }}>
      <aside className="w-60 flex flex-col h-full shrink-0 border-r hidden md:flex" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="p-5 border-b" style={{ borderColor: dark.border }}>
          <button onClick={onBack} className="flex items-center gap-2">
            <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2563EB" />
              <rect x="6" y="8" width="8" height="16" rx="2" fill="white" />
              <rect x="18" y="8" width="8" height="10" rx="2" fill="#00A3FF" />
              <rect x="18" y="22" width="8" height="2" rx="1" fill="#22C55E" />
            </svg>
            <span className="text-white font-bold">DOOHPLAY</span>
          </button>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "#00A3FF20", color: "#00A3FF" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]" /> Enterprise
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              const deepLink = item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => deepLink && onNavigate ? onNavigate(deepLink) : setActiveNav(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={isActive ? { backgroundColor: "#00A3FF20", color: "#00A3FF" } : { color: dark.sub }}
                  >
                    <item.icon size={16} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: isActive ? "#00A3FF30" : dark.bg, color: isActive ? "#00A3FF" : dark.sub }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: dark.border }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00A3FF] flex items-center justify-center text-white text-xs font-bold">AG</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Agência Mídia SA</p>
              <p className="text-xs truncate" style={{ color: dark.sub }}>enterprise@midia.com</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b px-6 py-4 flex items-center justify-between shrink-0" style={{ background: dark.card, borderColor: dark.border }}>
          <div>
            <h1 className="font-bold text-white">{titles[activeNav] ?? activeNav}</h1>
            <p className="text-xs" style={{ color: dark.sub }}>
              {userSession ? `${userSession.name ?? "Usuário"} · Plano ${userSession.plan ?? "starter"}` : "Proof-of-Play Auditável"} · {screens?.length ?? 0} telas · Real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
              <Activity size={12} className="animate-pulse" /> LIVE
            </div>
            <button onClick={() => onNavigate?.("notifications")} className="relative p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>
            {userSession && onLogout ? (
              <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border" style={{ borderColor: dark.border, color: dark.sub }}>Sair</button>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB]">
                <Plus size={16} /> New Campaign
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6" style={{ background: dark.bg }}>
          {renderContent()}
        </main>
      </div>
      <MobileNav items={navItems.slice(0, 5)} activeItem={activeNav} onNavigate={setActiveNav} accentColor="#00A3FF" />
    </div>
  );
}
