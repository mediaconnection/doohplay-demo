import { useState } from "react";
import { ArrowLeft, Zap, Check, X, ExternalLink, RefreshCw, Plus, AlertCircle, ChevronRight, Settings } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type IntegrationStatus = "connected" | "disconnected" | "error" | "beta";
type IntegrationCategory = "analytics" | "payments" | "crm" | "advertising" | "productivity" | "blockchain";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  logo: string;
  color: string;
  lastSync?: string;
  events?: number;
  planReq: "starter" | "pro" | "enterprise";
}

const INTEGRATIONS: Integration[] = [
  { id: "ga4",       name: "Google Analytics 4",    description: "Audiência, conversões e atribuição",         category: "analytics",    status: "connected",    logo: "G",  color: "#E37400", lastSync: "2min atrás",    events: 1284, planReq: "starter"    },
  { id: "meta",      name: "Meta Ads",               description: "Sincronizar audiências e conversões",         category: "advertising",  status: "connected",    logo: "f",  color: "#1877F2", lastSync: "5min atrás",    events: 842,  planReq: "pro"        },
  { id: "pix",       name: "PIX via Pagar.me",       description: "Pagamentos instantâneos e split",            category: "payments",     status: "connected",    logo: "₽",  color: "#00DC82", lastSync: "1min atrás",    events: 38,   planReq: "starter"    },
  { id: "whatsapp",  name: "WhatsApp Business API",  description: "Alertas e notificações automáticas",         category: "crm",          status: "connected",    logo: "W",  color: "#25D366", lastSync: "agora",          events: 94,   planReq: "starter"    },
  { id: "polygon",   name: "Polygon Blockchain",     description: "Âncoras ProofChain on-chain",                category: "blockchain",   status: "connected",    logo: "◆",  color: "#8247E5", lastSync: "30sec atrás",   events: 420,  planReq: "starter"    },
  { id: "googleads", name: "Google Ads",             description: "Campanhas programáticas e DOOH",             category: "advertising",  status: "disconnected", logo: "G",  color: "#4285F4", planReq: "pro"             },
  { id: "hubspot",   name: "HubSpot CRM",            description: "Gestão de leads e anunciantes",              category: "crm",          status: "disconnected", logo: "H",  color: "#FF7A59", planReq: "pro"             },
  { id: "salesforce",name: "Salesforce",             description: "CRM enterprise para agências",               category: "crm",          status: "disconnected", logo: "S",  color: "#00A1E0", planReq: "enterprise"      },
  { id: "looker",    name: "Looker Studio",          description: "Dashboards customizados",                    category: "analytics",    status: "beta",         logo: "L",  color: "#4285F4", planReq: "pro"             },
  { id: "slack",     name: "Slack",                  description: "Alertas de performance no canal",            category: "productivity", status: "disconnected", logo: "S",  color: "#4A154B", planReq: "starter"         },
  { id: "zapier",    name: "Zapier",                 description: "Automações com 5.000+ apps",                 category: "productivity", status: "beta",         logo: "Z",  color: "#FF4A00", planReq: "pro"             },
  { id: "stripe",    name: "Stripe",                 description: "Pagamentos internacionais",                  category: "payments",     status: "disconnected", logo: "S",  color: "#635BFF", planReq: "pro"             },
];

const STATUS_CFG: Record<IntegrationStatus, { label: string; color: string; bg: string }> = {
  connected:    { label: "Conectado",    color: T.success, bg: T.success + "15" },
  disconnected: { label: "Desconectado", color: T.textSub, bg: T.border         },
  error:        { label: "Erro",         color: T.danger,  bg: T.danger  + "15" },
  beta:         { label: "Beta",         color: T.warning, bg: T.warning + "15" },
};

const CAT_LABELS: Record<IntegrationCategory, string> = {
  analytics: "Analytics", payments: "Pagamentos", crm: "CRM",
  advertising: "Publicidade", productivity: "Produtividade", blockchain: "Blockchain",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function IntegrationsHub({ onBack, onNavigate }: Props) {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [filter, setFilter] = useState<IntegrationCategory | "all">("all");
  const [connecting, setConnecting] = useState<string | null>(null);

  const connected = integrations.filter(i => i.status === "connected").length;

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: "connected" as IntegrationStatus, lastSync: "agora", events: 0 } : i));
      setConnecting(null);
    }, 1800);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: "disconnected" as IntegrationStatus, lastSync: undefined, events: undefined } : i));
  };

  const filtered = filter === "all" ? integrations : integrations.filter(i => i.category === filter);

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category))) as IntegrationCategory[];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Zap size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Integrações</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{connected}/{INTEGRATIONS.length} conectadas</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("api-center")}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
            API própria
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto">
          {[["all","Todos"] as const, ...categories.map(c => [c, CAT_LABELS[c]] as const)].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k as any)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all"
              style={{ borderColor: filter === k ? T.primary : "transparent", color: filter === k ? T.primary : T.textSub }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Conectadas",   value: String(connected),                                          color: T.success },
            { label: "Eventos/dia",  value: integrations.filter(i => i.events).reduce((a, i) => a + (i.events ?? 0), 0).toLocaleString("pt-BR"), color: T.primary },
            { label: "Disponíveis",  value: String(INTEGRATIONS.length - connected),                   color: T.textSub },
          ].map((k, i) => (
            <div key={i} className="p-3.5 rounded-xl border text-center" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(intg => {
            const s = STATUS_CFG[intg.status];
            const isConnecting = connecting === intg.id;
            return (
              <div key={intg.id} className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ background: T.card, borderColor: intg.status === "connected" ? T.border : T.border }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0"
                  style={{ background: intg.color + "18", color: intg.color, border: `1px solid ${intg.color}25` }}>
                  {intg.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{intg.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{intg.description}</div>
                  {intg.status === "connected" && intg.lastSync && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: T.success }}>↑ {intg.events?.toLocaleString()} eventos</span>
                      <span className="text-xs" style={{ color: T.textSub }}>sync {intg.lastSync}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {intg.status === "connected" ? (
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/5">
                        <Settings size={14} style={{ color: T.textSub }} />
                      </button>
                      <button onClick={() => handleDisconnect(intg.id)}
                        className="p-2 rounded-lg hover:bg-white/5">
                        <X size={14} style={{ color: T.danger }} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleConnect(intg.id)} disabled={isConnecting}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-60"
                      style={{ background: isConnecting ? T.panel : T.primary + "15", color: isConnecting ? T.textSub : T.primary, border: `1px solid ${T.border}` }}>
                      {isConnecting
                        ? <><div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> Conectando</>
                        : <><Plus size={12} /> Conectar</>
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <Zap size={16} style={{ color: T.gold }} />
            <div className="flex-1">
              <div className="font-bold text-sm">Webhook personalizado</div>
              <div className="text-xs" style={{ color: T.textSub }}>Receba eventos DOOHPLAY em qualquer URL via HTTP POST</div>
            </div>
            <button onClick={() => onNavigate?.("api-center")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: T.gold + "15", color: T.gold }}>
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
