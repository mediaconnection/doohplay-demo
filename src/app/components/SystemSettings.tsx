import { useState } from "react";
import { ArrowLeft, Settings, Shield, Bell, Globe, CreditCard, Key, Mail, Webhook, Save, Eye, EyeOff, Copy, Check, AlertTriangle, Database, Palette, Zap, RefreshCw, ChevronRight, Lock, Unlock } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Tab = "general" | "security" | "notifications" | "billing" | "integrations" | "developer";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "general",       label: "Geral",          icon: Settings  },
  { id: "security",      label: "Segurança",       icon: Shield    },
  { id: "notifications", label: "Notificações",    icon: Bell      },
  { id: "billing",       label: "Cobrança",        icon: CreditCard },
  { id: "integrations",  label: "Integrações",     icon: Webhook   },
  { id: "developer",     label: "Desenvolvedor",   icon: Key       },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
      style={{ background: on ? T.success : T.border }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: T.border + "60" }}>
      <div className="flex-1 pr-6">
        <div className="text-sm font-bold">{label}</div>
        {description && <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SystemSettings({ onBack, onNavigate }: Props) {
  const [tab, setTab]             = useState<Tab>("general");
  const [saved, setSaved]         = useState(false);
  const [showKey, setShowKey]     = useState(false);
  const [copied, setCopied]       = useState(false);

  const [platformName, setPlatformName] = useState("DOOHPLAY");
  const [timezone, setTimezone]         = useState("America/Sao_Paulo");
  const [language, setLanguage]         = useState("pt-BR");
  const [currency, setCurrency]         = useState("BRL");
  const [theme, setTheme]               = useState("dark");

  const [mfa, setMfa]             = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [auditLog, setAuditLog]   = useState(true);
  const [rls, setRls]             = useState(true);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [screenOffline, setScreenOffline] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [reportReady, setReportReady] = useState(true);

  const [supabase, setSupabase]   = useState(true);
  const [gemini, setGemini]       = useState(true);
  const [polygon, setPolygon]     = useState(true);
  const [whatsapp, setWhatsapp]   = useState(true);
  const [stripe, setStripe]       = useState(false);
  const [mailgun, setMailgun]     = useState(true);

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function copyKey() { setCopied(true); setTimeout(() => setCopied(false), 2000); }

  const API_KEY = "dpk_live_1a2b3c4d5e6f7g8h9i0j_DOOHPLAY_PLATFORM";

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Settings size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Configurações</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Configurações globais da plataforma DOOHPLAY</p>
              </div>
            </div>
          </div>
          <button onClick={save}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
            style={{ background: saved ? T.success : T.primary, color: saved ? "#000" : "#fff" }}>
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex gap-6">
        <div className="w-52 flex-shrink-0">
          <div className="space-y-1 sticky top-24">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all"
                style={{ background: tab === t.id ? T.primary + "20" : "transparent", color: tab === t.id ? T.primary : T.textSub, border: `1px solid ${tab === t.id ? T.primary + "30" : "transparent"}` }}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {tab === "general" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Informações da Plataforma</h3>
                <p className="text-xs mb-5" style={{ color: T.textSub }}>Configurações básicas do sistema</p>
                <SettingRow label="Nome da plataforma" description="Aparece no painel e e-mails enviados">
                  <input value={platformName} onChange={e => setPlatformName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm w-44"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </SettingRow>
                <SettingRow label="Fuso horário" description="Usado em relatórios e agendamentos">
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm w-52"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    <option>America/Sao_Paulo</option>
                    <option>America/Recife</option>
                    <option>America/Manaus</option>
                    <option>America/Noronha</option>
                  </select>
                </SettingRow>
                <SettingRow label="Idioma padrão">
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm w-32"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </SettingRow>
                <SettingRow label="Moeda" description="Padrão para relatórios financeiros">
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm w-32"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    <option>BRL</option><option>USD</option><option>EUR</option>
                  </select>
                </SettingRow>
                <SettingRow label="Tema" description="Aparência do painel">
                  <div className="flex items-center gap-2">
                    {["dark","light"].map(th => (
                      <button key={th} onClick={() => setTheme(th)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize"
                        style={{ background: theme === th ? T.primary + "25" : T.panel, color: theme === th ? T.primary : T.textSub, border: `1px solid ${theme === th ? T.primary + "40" : T.border}` }}>
                        {th === "dark" ? "Escuro" : "Claro"}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Versão & Sistema</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Versão da plataforma", value: "v4.7.2"       },
                    { label: "App Android",           value: "v0.7.1"       },
                    { label: "SDK DOOHPLAY",          value: "v2.3.0"       },
                    { label: "Supabase project",      value: "mdlbajg..."   },
                    { label: "Ambiente",              value: "Production"   },
                    { label: "Último deploy",         value: "22/07/2026"  },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                      <div className="text-xs" style={{ color: T.textSub }}>{item.label}</div>
                      <div className="font-black text-sm mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Segurança</h3>
              <p className="text-xs mb-5" style={{ color: T.textSub }}>Configure autenticação e controle de acesso</p>
              <SettingRow label="Autenticação Multi-Fator (MFA)" description="WhatsApp OTP obrigatório para todos os logins">
                <Toggle on={mfa} onChange={setMfa} />
              </SettingRow>
              <SettingRow label="IP Whitelist" description="Restringir acesso ao painel por IP">
                <Toggle on={ipWhitelist} onChange={setIpWhitelist} />
              </SettingRow>
              <SettingRow label="Timeout de sessão" description="Encerrar sessão após 8h de inatividade">
                <Toggle on={sessionTimeout} onChange={setSessionTimeout} />
              </SettingRow>
              <SettingRow label="Log de auditoria" description="Registrar todas as ações de usuários">
                <Toggle on={auditLog} onChange={setAuditLog} />
              </SettingRow>
              <SettingRow label="Row Level Security (RLS)" description="Supabase RLS ativo — nunca desabilitar em produção">
                <div className="flex items-center gap-2">
                  {rls ? <Lock size={14} style={{ color: T.success }} /> : <Unlock size={14} style={{ color: T.danger }} />}
                  <Toggle on={rls} onChange={setRls} />
                </div>
              </SettingRow>
              <div className="mt-5 p-4 rounded-xl flex items-start gap-3" style={{ background: T.warning + "10", border: `1px solid ${T.warning}30` }}>
                <AlertTriangle size={16} style={{ color: T.warning, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: T.warning }}>Aviso de segurança</div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>
                    Nunca cole a Service Role Key do Supabase no chat ou no código frontend. Use variáveis de ambiente (.env.local) ou Supabase MCP (OAuth) para acesso autenticado.
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Notificações</h3>
              <p className="text-xs mb-5" style={{ color: T.textSub }}>Configure como e quando receber alertas</p>
              <div className="text-xs font-bold mb-3" style={{ color: T.textSub }}>CANAIS</div>
              <SettingRow label="E-mail" description="Relatórios e alertas críticos por e-mail">
                <Toggle on={emailAlerts} onChange={setEmailAlerts} />
              </SettingRow>
              <SettingRow label="WhatsApp" description="Alertas em tempo real via WhatsApp Business">
                <Toggle on={whatsappAlerts} onChange={setWhatsappAlerts} />
              </SettingRow>
              <SettingRow label="Push no app" description="Notificações push no app Android DOOHPLAY">
                <Toggle on={pushNotif} onChange={setPushNotif} />
              </SettingRow>
              <div className="text-xs font-bold mb-3 mt-5" style={{ color: T.textSub }}>EVENTOS</div>
              <SettingRow label="Tela offline" description="Alertar quando uma tela ficar offline por mais de 5 min">
                <Toggle on={screenOffline} onChange={setScreenOffline} />
              </SettingRow>
              <SettingRow label="Pagamento recebido" description="Confirmar depósitos e assinaturas">
                <Toggle on={paymentAlert} onChange={setPaymentAlert} />
              </SettingRow>
              <SettingRow label="Relatório pronto" description="Notificar quando relatório mensal for gerado">
                <Toggle on={reportReady} onChange={setReportReady} />
              </SettingRow>
              <div className="mt-4">
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>E-MAIL DE ALERTAS</label>
                <input defaultValue="ops@doohplay.com.br"
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Plano Atual</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Você está no plano Enterprise</p>
                <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg,${T.accent}20,${T.primary}20)`, border: `1px solid ${T.primary}30` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-xl" style={{ color: T.primary }}>Enterprise</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Telas ilimitadas · Multi-tenant · SLA 99.9%</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl" style={{ color: T.gold }}>R$620<span className="text-sm font-normal">/mês</span></div>
                      <div className="text-xs" style={{ color: T.success }}>Próxima cobrança: 01/08/2026</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Método de Pagamento</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                  <div className="w-10 h-7 rounded flex items-center justify-center font-black text-xs" style={{ background: T.primary }}>VISA</div>
                  <div>
                    <div className="text-sm font-bold">•••• •••• •••• 4242</div>
                    <div className="text-xs" style={{ color: T.textSub }}>Exp. 12/2027</div>
                  </div>
                  <button className="ml-auto text-xs font-bold" style={{ color: T.primary }}>Alterar</button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl mt-2" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                  <div className="w-10 h-7 rounded flex items-center justify-center font-black text-xs" style={{ background: T.success + "20", color: T.success }}>PIX</div>
                  <div className="text-sm font-bold">Chave: 12.345.678/0001-90</div>
                  <button className="ml-auto text-xs font-bold" style={{ color: T.primary }}>Usar</button>
                </div>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Histórico de Faturas</h3>
                <div className="space-y-2">
                  {["Jul 2026","Jun 2026","Mai 2026","Abr 2026"].map((month, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: T.border + "60" }}>
                      <div>
                        <div className="text-sm font-bold">{month} — Enterprise</div>
                        <div className="text-xs" style={{ color: T.textSub }}>NFS-e disponível</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold" style={{ color: T.gold }}>R$620,00</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>Pago</span>
                        <button className="text-xs" style={{ color: T.primary }}>PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "integrations" && (
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Integrações</h3>
              <p className="text-xs mb-5" style={{ color: T.textSub }}>Serviços conectados à plataforma DOOHPLAY</p>
              {[
                { name: "Supabase",              desc: "Banco de dados e autenticação principal",         enabled: supabase,  set: setSupabase,  color: T.success, badge: "Core"       },
                { name: "Google Gemini AI",       desc: "Geração de conteúdo e análise inteligente",     enabled: gemini,    set: setGemini,    color: T.primary, badge: "IA"         },
                { name: "Polygon Blockchain",     desc: "ProofChain — prova imutável de veiculação",     enabled: polygon,   set: setPolygon,   color: T.accent,  badge: "Web3"       },
                { name: "WhatsApp Business API",  desc: "OTP login e notificações em tempo real",       enabled: whatsapp,  set: setWhatsapp,  color: T.success, badge: "Auth"       },
                { name: "Stripe",                 desc: "Processamento de pagamentos internacional",    enabled: stripe,    set: setStripe,    color: T.primary, badge: "Pagamentos" },
                { name: "Mailgun",                desc: "Envio de e-mails transacionais",               enabled: mailgun,   set: setMailgun,   color: T.warning, badge: "E-mail"     },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b" style={{ borderColor: T.border + "60" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: svc.color + "20" }}>
                      <Zap size={14} style={{ color: svc.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{svc.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: svc.color + "20", color: svc.color }}>{svc.badge}</span>
                      </div>
                      <div className="text-xs" style={{ color: T.textSub }}>{svc.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: svc.enabled ? T.success : T.textSub }}>
                      {svc.enabled ? "Conectado" : "Desconectado"}
                    </span>
                    <Toggle on={svc.enabled} onChange={svc.set} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "developer" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">API Keys</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Use para integrar com sistemas externos via REST API</p>
                <div className="p-4 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold">Chave de API — Live</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Criada em 10/01/2026 · Nunca expira</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded hover:bg-white/5">
                        {showKey ? <EyeOff size={13} style={{ color: T.textSub }} /> : <Eye size={13} style={{ color: T.textSub }} />}
                      </button>
                      <button onClick={copyKey} className="p-1.5 rounded hover:bg-white/5">
                        {copied ? <Check size={13} style={{ color: T.success }} /> : <Copy size={13} style={{ color: T.textSub }} />}
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-xs p-2 rounded-lg" style={{ background: T.bg, color: showKey ? T.success : T.textSub }}>
                    {showKey ? API_KEY : "dpk_live_" + "•".repeat(36)}
                  </div>
                </div>
                <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.danger + "15", color: T.danger, border: `1px solid ${T.danger}25` }}>
                  <RefreshCw size={13} /> Regenerar Chave
                </button>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Webhooks</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Receba eventos em tempo real no seu endpoint</p>
                <div className="space-y-2">
                  {[
                    { event: "screen.offline",    url: "https://api.meuapp.com/hooks/screen",   active: true  },
                    { event: "campaign.started",  url: "https://api.meuapp.com/hooks/campaign", active: true  },
                    { event: "payment.received",  url: "https://api.meuapp.com/hooks/payment",  active: false },
                  ].map((wh, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: wh.active ? T.success : T.textSub }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-mono" style={{ color: T.accent }}>{wh.event}</div>
                        <div className="text-xs truncate" style={{ color: T.textSub }}>{wh.url}</div>
                      </div>
                      <button className="text-xs" style={{ color: T.primary }}>Edit</button>
                    </div>
                  ))}
                </div>
                <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                  + Adicionar Webhook
                </button>
              </div>
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.danger + "30" }}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={15} style={{ color: T.danger }} />
                  <h3 className="font-black" style={{ color: T.danger }}>Zona de Perigo</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Ações irreversíveis. Confirme antes de prosseguir.</p>
                <div className="space-y-2">
                  {[
                    { label: "Exportar todos os dados",  desc: "Download de todos os dados da plataforma em JSON" },
                    { label: "Limpar cache global",       desc: "Resetar cache de todas as telas e campanhas" },
                    { label: "Resetar configurações",    desc: "Reverter todas as configs para padrão de fábrica" },
                  ].map((action, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-bold">{action.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{action.desc}</div>
                      </div>
                      <button className="px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: T.danger + "15", color: T.danger, border: `1px solid ${T.danger}25` }}>
                        Executar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
