import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, ArrowRight, Hash, LayoutDashboard, Megaphone, BarChart2,
  Users, Settings, Zap, Shield, Globe, DollarSign, Cpu, Bell,
  FileText, Map, Package, Tv, Layers, Store, Plug, BrainCircuit,
  TrendingUp, BadgeCheck, UserCog, Receipt, ChevronRight, Clock,
  Command, X
} from "lucide-react";
import { soundEngine } from "../utils/SoundEngine";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

interface NavEntry {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  keywords?: string[];
}

const ALL_COMMANDS: NavEntry[] = [
  { id: "enterprise",           label: "Enterprise Dashboard",   description: "Visão geral executiva da plataforma",  category: "Platform",    icon: LayoutDashboard, color: T.primary },
  { id: "executive-dashboard",  label: "Executive Dashboard",    description: "KPIs e métricas do C-level",           category: "Platform",    icon: LayoutDashboard, color: T.primary },
  { id: "executive-command",    label: "Command Center",         description: "Centro de comando em tempo real",      category: "Platform",    icon: Zap,             color: T.accent  },
  { id: "platform-health",      label: "Platform Health",        description: "Status e saúde da plataforma",        category: "Platform",    icon: Cpu,             color: T.success },
  { id: "unicorn-roadmap",      label: "Unicorn Roadmap",        description: "Roadmap rumo ao unicórnio",           category: "Platform",    icon: TrendingUp,      color: T.gold    },
  { id: "status-page",          label: "Status Page",            description: "Uptime e incidentes",                 category: "Platform",    icon: Shield,          color: T.success },
  { id: "campaign-manager",     label: "Campaign Manager",       description: "Gerenciar todas as campanhas",        category: "Campanhas",   icon: Megaphone,       color: T.primary },
  { id: "campaign-creator",     label: "Campaign Creator",       description: "Criar nova campanha",                 category: "Campanhas",   icon: Megaphone,       color: T.primary },
  { id: "campaign-planner",     label: "Campaign Planner",       description: "Planejamento e calendário",           category: "Campanhas",   icon: Megaphone,       color: T.primary },
  { id: "campaign-optimizer",   label: "Campaign Optimizer",     description: "Otimização inteligente com IA",       category: "Campanhas",   icon: BrainCircuit,    color: T.accent  },
  { id: "campaign-analytics",   label: "Campaign Analytics",     description: "Performance das campanhas",           category: "Campanhas",   icon: BarChart2,       color: T.success },
  { id: "ab-test",              label: "A/B Test Manager",       description: "Testes A/B de criativos",             category: "Campanhas",   icon: Layers,          color: T.warning },
  { id: "media-plan",           label: "Media Plan",             description: "Plano de mídia detalhado",            category: "Campanhas",   icon: FileText,        color: T.primary },
  { id: "ad-scheduler",        label: "Ad Scheduler",           description: "Agendamento de anúncios",             category: "Campanhas",   icon: Clock,           color: T.textSub },
  { id: "analytics-dashboard",  label: "Analytics Dashboard",    description: "Dashboard de analytics",             category: "Analytics",   icon: BarChart2,       color: T.success },
  { id: "analytics-explorer",   label: "Analytics Explorer",     description: "Exploração avançada de dados",       category: "Analytics",   icon: TrendingUp,      color: T.success },
  { id: "audience-analytics",   label: "Audience Analytics",     description: "Análise de audiência",               category: "Analytics",   icon: Users,           color: T.accent  },
  { id: "attribution-engine",   label: "Attribution Engine",     description: "Atribuição de conversões",           category: "Analytics",   icon: TrendingUp,      color: T.primary },
  { id: "benchmark",            label: "Benchmark",              description: "Comparativos de performance",        category: "Analytics",   icon: BarChart2,       color: T.warning },
  { id: "data-intelligence",    label: "Data Intelligence",      description: "Central de inteligência de dados",   category: "Analytics",   icon: Cpu,             color: T.accent  },
  { id: "report-builder",       label: "Report Builder",         description: "Construtor de relatórios custom",    category: "Analytics",   icon: FileText,        color: T.primary },
  { id: "audience-builder",     label: "Audience Builder",       description: "Criar segmentos de audiência",       category: "Audiências",  icon: Users,           color: T.accent  },
  { id: "audience-planner",     label: "Audience Planner",       description: "Planejamento de audiência",          category: "Audiências",  icon: Users,           color: T.accent  },
  { id: "audience-intelligence",label: "Audience Intelligence",  description: "IA para insights de audiência",      category: "Audiências",  icon: BrainCircuit,    color: T.accent  },
  { id: "geo-fencing",          label: "Geo Fencing",            description: "Segmentação geográfica",             category: "Audiências",  icon: Map,             color: T.success },
  { id: "programmatic-desk",    label: "Programmatic Desk",      description: "Mesa programática DOOH",             category: "Programmatic",icon: Cpu,             color: T.primary },
  { id: "demand-side-platform", label: "DSP",                    description: "Demand-Side Platform",              category: "Programmatic",icon: Layers,          color: T.accent  },
  { id: "ad-auction",           label: "Ad Auction Engine",      description: "Motor de leilão em tempo real",      category: "Programmatic",icon: Zap,             color: T.gold    },
  { id: "programmatic-buying",  label: "Programmatic Buying",    description: "Compra programática",               category: "Programmatic",icon: DollarSign,      color: T.primary },
  { id: "cpm-optimizer",        label: "CPM Optimizer",          description: "Otimização de CPM",                 category: "Programmatic",icon: TrendingUp,      color: T.warning },
  { id: "retargeting-engine",   label: "Retargeting Engine",     description: "Motor de retargeting",              category: "Programmatic",icon: Cpu,             color: T.accent  },
  { id: "creative-studio",      label: "Creative Studio",        description: "Estúdio de criação",                category: "Criativos",   icon: Layers,          color: T.accent  },
  { id: "creative-templates",   label: "Creative Templates",     description: "Templates de criativos",            category: "Criativos",   icon: Layers,          color: T.accent  },
  { id: "dynamic-creative",     label: "Dynamic Creative",       description: "Criativos dinâmicos",               category: "Criativos",   icon: Zap,             color: T.primary },
  { id: "creative-approval",    label: "Creative Approval",      description: "Fluxo de aprovação",                category: "Criativos",   icon: BadgeCheck,      color: T.success },
  { id: "content-studio",       label: "Content Studio",         description: "Estúdio de conteúdo",               category: "Criativos",   icon: Tv,              color: T.primary },
  { id: "ad-creative",          label: "Ad Creative Studio",     description: "Criação de anúncios",               category: "Criativos",   icon: Layers,          color: T.accent  },
  { id: "device-manager",       label: "Device Manager",         description: "Gerenciar dispositivos",            category: "Telas",       icon: Tv,              color: T.primary },
  { id: "screen-health",        label: "Screen Health",          description: "Saúde das telas",                   category: "Telas",       icon: Tv,              color: T.success },
  { id: "live-monitor",         label: "Live Monitor",           description: "Monitoramento ao vivo",             category: "Telas",       icon: Tv,              color: T.danger  },
  { id: "playlist-manager",     label: "Playlist Manager",       description: "Gerenciar playlists",               category: "Telas",       icon: Tv,              color: T.accent  },
  { id: "network-map",          label: "Network Map",            description: "Mapa da rede de telas",             category: "Telas",       icon: Map,             color: T.primary },
  { id: "digital-signage",      label: "Digital Signage",        description: "Sinalização digital",               category: "Telas",       icon: Tv,              color: T.primary },
  { id: "billing",              label: "Billing",                description: "Cobrança e pagamentos",             category: "Financeiro",  icon: DollarSign,      color: T.gold    },
  { id: "billing-center",       label: "Billing Center",         description: "Central de cobrança",               category: "Financeiro",  icon: Receipt,         color: T.gold    },
  { id: "revenue-optimizer",    label: "Revenue Optimizer",      description: "Otimizador de receita",             category: "Financeiro",  icon: TrendingUp,      color: T.success },
  { id: "pricing-calculator",   label: "Pricing Calculator",     description: "Calculadora de preços e ROI",       category: "Financeiro",  icon: Receipt,         color: T.gold    },
  { id: "payout-center",        label: "Payout Center",          description: "Pagamentos a publishers",          category: "Financeiro",  icon: DollarSign,      color: T.success },
  { id: "tax-center",           label: "Tax Center / NF-e",      description: "Fiscal e notas fiscais",            category: "Financeiro",  icon: FileText,        color: T.warning },
  { id: "proof-of-play",        label: "ProofChain",             description: "Prova de exibição blockchain",      category: "Trust",       icon: BadgeCheck,      color: T.success },
  { id: "fraud-detection",      label: "Fraud Detection",        description: "Detecção de fraude",                category: "Trust",       icon: Shield,          color: T.danger  },
  { id: "security-center",      label: "Security Center",        description: "Central de segurança",              category: "Trust",       icon: Shield,          color: T.danger  },
  { id: "compliance-center",    label: "Compliance Center",      description: "Conformidade regulatória",          category: "Trust",       icon: Shield,          color: T.warning },
  { id: "trust-center",         label: "Trust Center",           description: "Centro de confiança",               category: "Trust",       icon: Shield,          color: T.success },
  { id: "user-management",      label: "User Management",        description: "Usuários, roles e permissões",      category: "Admin",       icon: UserCog,         color: T.primary },
  { id: "multi-tenant",         label: "Multi-tenant Admin",     description: "Administração multi-tenant",        category: "Admin",       icon: Globe,           color: T.primary },
  { id: "white-label",          label: "White Label Admin",      description: "Configurações white label",         category: "Admin",       icon: Globe,           color: T.accent  },
  { id: "system-settings",      label: "System Settings",        description: "Configurações do sistema",          category: "Admin",       icon: Settings,        color: T.textSub },
  { id: "feature-gates",        label: "Feature Gates",          description: "Feature flags e gates",             category: "Admin",       icon: Zap,             color: T.accent  },
  { id: "api-center",           label: "API Center",             description: "Gestão de APIs e webhooks",         category: "Admin",       icon: Plug,            color: T.primary },
  { id: "data-integration",     label: "Data Integration",       description: "Integrações de dados",              category: "Admin",       icon: Plug,            color: T.primary },
  { id: "notification-center",  label: "Notification Center",    description: "Central de notificações",           category: "Admin",       icon: Bell,            color: T.warning },
  { id: "marketplace-screen",   label: "Marketplace",            description: "Marketplace de inventário DOOH",   category: "Marketplace", icon: Store,           color: T.gold    },
  { id: "media-marketplace",    label: "Media Marketplace",      description: "Marketplace de mídia",             category: "Marketplace", icon: Store,           color: T.gold    },
  { id: "publisher-portal",     label: "Publisher Portal",       description: "Portal do publisher",              category: "Marketplace", icon: Globe,           color: T.accent  },
  { id: "partner-portal",       label: "Partner Portal",         description: "Portal de parceiros",              category: "Marketplace", icon: Globe,           color: T.primary },
  { id: "ai-assistant",         label: "AI Assistant",           description: "Assistente IA Gemini",             category: "IA",          icon: BrainCircuit,    color: T.accent  },
  { id: "ai-revenue",           label: "AI Revenue Center",      description: "IA para otimização de receita",    category: "IA",          icon: BrainCircuit,    color: T.gold    },
  { id: "weather-trigger",      label: "Weather Trigger",        description: "Gatilhos baseados em clima",       category: "IA",          icon: Zap,             color: T.primary },
];

const RECENT_KEY = "doohplay_recent_cmds";
const MAX_RECENT = 5;

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecent(id: string) {
  const list = [id, ...getRecent().filter(x => x !== id)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export default function CommandPalette({ open, onClose, onNavigate }: Props) {
  const [query, setQuery]   = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const recent = useMemo(() => getRecent(), [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_COMMANDS
      .filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.keywords || []).some(k => k.includes(q))
      )
      .slice(0, 9);
  }, [query]);

  const recentEntries = useMemo(() =>
    recent.map(id => ALL_COMMANDS.find(c => c.id === id)).filter(Boolean) as NavEntry[],
    [recent]
  );

  const displayed = query.trim() ? results : recentEntries;

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  const go = (entry: NavEntry) => {
    saveRecent(entry.id);
    soundEngine.play("navigate");
    onNavigate(entry.id);
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, displayed.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === "Enter" && displayed[cursor]) go(displayed[cursor]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, cursor, displayed]);

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const grouped = query.trim() ? null :
    Object.entries(
      recentEntries.reduce((acc, e) => ({ ...acc, [e.category]: [...(acc[e.category] || []), e] }), {} as Record<string, NavEntry[]>)
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      style={{ background: "rgba(5,6,14,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>

      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: T.card, border: `1px solid ${T.border}` }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: T.border }}>
          <Search size={18} style={{ color: T.textSub }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar telas, módulos, configurações…"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: T.text }} />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 rounded-lg hover:bg-white/5">
              <X size={14} style={{ color: T.textSub }} />
            </button>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold" style={{ background: T.panel, color: T.textSub }}>
            ESC
          </div>
        </div>

        <div ref={listRef} className="max-h-96 overflow-y-auto py-2">
          {displayed.length === 0 && query && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: T.textSub }}>
              Nenhum resultado para "{query}"
            </div>
          )}
          {displayed.length === 0 && !query && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: T.textSub }}>
              <Command size={24} className="mx-auto mb-2 opacity-40" />
              Digite para buscar qualquer módulo
            </div>
          )}

          {!query && recentEntries.length > 0 && (
            <div className="px-4 pt-1 pb-0.5 text-xs font-black" style={{ color: T.textSub }}>
              RECENTES
            </div>
          )}

          {displayed.map((entry, i) => (
            <button key={entry.id} onClick={() => go(entry)}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left"
              style={{ background: cursor === i ? T.primary + "15" : "transparent" }}
              onMouseEnter={() => setCursor(i)}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: entry.color + "20" }}>
                <entry.icon size={15} style={{ color: entry.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight" style={{ color: T.text }}>{entry.label}</div>
                <div className="text-xs truncate" style={{ color: T.textSub }}>{entry.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-md font-bold"
                  style={{ background: T.panel, color: T.textSub }}>
                  {entry.category}
                </span>
                {cursor === i && <ChevronRight size={14} style={{ color: T.primary }} />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: T.panel }}>⇕</kbd> navegar</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: T.panel }}>↵</kbd> abrir</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: T.panel }}>ESC</kbd> fechar</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black" style={{ color: T.textSub }}>
            <Hash size={10} />
            {ALL_COMMANDS.length} módulos
          </div>
        </div>
      </div>
    </div>
  );
}
