import { useState } from "react";
import {
  ArrowLeft, Palette, Globe, Users, DollarSign, Settings, Eye,
  Upload, Check, ChevronRight, TrendingUp, Building2, Copy,
  Zap, Shield, Star, Plus, ExternalLink, Monitor
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type WLTab = "overview" | "branding" | "resellers" | "pricing";

interface Reseller {
  id: string;
  name: string;
  agency: string;
  city: string;
  screens: number;
  clients: number;
  monthlyRevenue: number;
  commission: number;
  status: "active" | "trial" | "suspended";
  joinDate: string;
  logo: string;
}

const RESELLERS: Reseller[] = [
  { id: "r1", name: "Marcos Alves",   agency: "Mídia SP Digital",       city: "São Paulo",    screens: 48, clients: 12, monthlyRevenue: 18400, commission: 20, status: "active",    joinDate: "Jan/2026", logo: "M" },
  { id: "r2", name: "Carolina Duarte",agency: "Outdoor Connect",         city: "Campinas",     screens: 31, clients: 8,  monthlyRevenue: 11200, commission: 18, status: "active",    joinDate: "Mar/2026", logo: "C" },
  { id: "r3", name: "Diego Ferreira", agency: "DF Publicidade",          city: "Brasília",     screens: 22, clients: 6,  monthlyRevenue: 7600,  commission: 18, status: "active",    joinDate: "Abr/2026", logo: "D" },
  { id: "r4", name: "Luana Torres",   agency: "Sul DOOH Agency",         city: "Porto Alegre", screens: 17, clients: 4,  monthlyRevenue: 5900,  commission: 15, status: "trial",     joinDate: "Jun/2026", logo: "L" },
  { id: "r5", name: "Felipe Costa",   agency: "Costa Mídia",             city: "Recife",       screens: 9,  clients: 3,  monthlyRevenue: 3100,  commission: 15, status: "trial",     joinDate: "Jul/2026", logo: "F" },
];

const STATUS_CFG = {
  active:    { label: "Ativo",     color: T.success, bg: T.success + "15" },
  trial:     { label: "Trial",     color: T.warning, bg: T.warning + "15" },
  suspended: { label: "Suspenso",  color: T.danger,  bg: T.danger  + "15" },
};

interface BrandConfig {
  name: string;
  primaryColor: string;
  accentColor: string;
  domain: string;
  logoText: string;
  tagline: string;
}

const DEFAULT_BRAND: BrandConfig = {
  name: "DOOHPLAY",
  primaryColor: "#4F6EF7",
  accentColor: "#7C5CFC",
  domain: "doohplay.com.br",
  logoText: "🎯 DOOHPLAY",
  tagline: "A plataforma DOOH que gera receita enquanto você dorme",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

function ColorSwatch({ color, label, onChange }: { color: string; label: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative cursor-pointer">
        <input type="color" value={color} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        <div className="w-10 h-10 rounded-xl border-2" style={{ background: color, borderColor: color + "80" }} />
      </label>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs font-mono" style={{ color: T.textSub }}>{color.toUpperCase()}</div>
      </div>
    </div>
  );
}

export default function WhiteLabelPortal({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<WLTab>("overview");
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalScreens = RESELLERS.reduce((a, r) => a + r.screens, 0);
  const totalRevenue = RESELLERS.reduce((a, r) => a + r.monthlyRevenue, 0);
  const totalCommission = RESELLERS.reduce((a, r) => a + r.monthlyRevenue * r.commission / 100, 0);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateBrand = (key: keyof BrandConfig, value: string) => {
    setBrand(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Globe size={18} style={{ color: T.gold }} />
            </div>
            <div>
              <h1 className="font-black text-lg">White Label Portal</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{RESELLERS.length} revendedores · {totalScreens} telas gerenciadas</p>
            </div>
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.primary + "15", color: T.primary, border: `1px solid ${T.primary}25` }}>
            <Plus size={14} /> Convidar revendedor
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-6 pb-0 flex">
          {([["overview","Visão Geral"],["branding","Marca"],["resellers","Revendedores"],["pricing","Comissões"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: tab === id ? T.primary : "transparent", color: tab === id ? T.primary : T.textSub }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Revendedores",     value: String(RESELLERS.length),                       color: T.primary, icon: Users      },
                { label: "Telas na rede",    value: String(totalScreens),                           color: T.accent,  icon: Monitor    },
                { label: "Receita total",    value: `R$${(totalRevenue / 1000).toFixed(0)}K`,       color: T.success, icon: DollarSign },
                { label: "Comissões pagas",  value: `R$${(totalCommission / 1000).toFixed(1)}K`,   color: T.gold,    icon: Star       },
              ].map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={i} className="p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon size={13} style={{ color: k.color }} />
                      <span className="text-xs" style={{ color: T.textSub }}>{k.label}</span>
                    </div>
                    <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Top resellers */}
            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: T.textSub }}>Top revendedores por receita</h3>
              <div className="space-y-2">
                {[...RESELLERS].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((r, i) => {
                  const s = STATUS_CFG[r.status];
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-4 rounded-2xl border"
                      style={{ background: T.card, borderColor: T.border }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: i === 0 ? T.gold + "20" : T.panel, color: i === 0 ? T.gold : T.textSub }}>
                        {i === 0 ? "👑" : `#${i + 1}`}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0"
                        style={{ background: T.primary + "20", color: T.primary }}>
                        {r.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{r.agency}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                        <div className="text-xs" style={{ color: T.textSub }}>{r.name} · {r.city} · {r.screens} telas · {r.clients} clientes</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm" style={{ color: T.success }}>R${r.monthlyRevenue.toLocaleString("pt-BR")}</div>
                        <div className="text-xs" style={{ color: T.gold }}>{r.commission}% comissão</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Network map teaser */}
            <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg, ${T.primary}10, ${T.accent}08)`, borderColor: T.primary + "25" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Rede White Label</h3>
                <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: T.gold + "15", color: T.gold }}>Enterprise</span>
              </div>
              <p className="text-sm mb-4" style={{ color: T.textSub }}>
                Sua rede white label está presente em <strong className="text-white">5 cidades</strong> do Brasil com <strong className="text-white">{totalScreens} telas</strong> gerando <strong style={{ color: T.success }}>R${totalRevenue.toLocaleString("pt-BR")}/mês</strong>.
              </p>
              <div className="flex gap-2">
                {["São Paulo","Campinas","Brasília","Porto Alegre","Recife"].map((c, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BRANDING */}
        {tab === "branding" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Personalizar marca</h3>
              <button onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background: previewMode ? T.primary + "20" : T.card, color: previewMode ? T.primary : T.textSub, border: `1px solid ${previewMode ? T.primary + "30" : T.border}` }}>
                <Eye size={13} /> {previewMode ? "Editando" : "Preview"}
              </button>
            </div>

            {previewMode ? (
              /* Live preview of the branded platform */
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: brand.primaryColor + "40" }}>
                {/* Fake header */}
                <div className="px-6 py-4 flex items-center gap-3"
                  style={{ background: `linear-gradient(135deg, ${brand.primaryColor}20, ${brand.accentColor}15)`, borderBottom: `1px solid ${brand.primaryColor}30` }}>
                  <div className="font-black text-lg">{brand.logoText}</div>
                  <div className="ml-auto flex gap-2">
                    {["Dashboard","Campanhas","Relatórios"].map((item, i) => (
                      <span key={i} className="text-sm" style={{ color: T.textSub }}>{item}</span>
                    ))}
                  </div>
                </div>
                {/* Fake hero */}
                <div className="px-6 py-10 text-center"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${brand.primaryColor}15, transparent 60%)` }}>
                  <div className="font-black text-3xl mb-3" style={{ color: brand.primaryColor }}>{brand.name}</div>
                  <p className="text-sm" style={{ color: T.textSub }}>{brand.tagline}</p>
                  <button className="mt-6 px-8 py-3 rounded-2xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})`, color: "#fff" }}>
                    Acessar plataforma
                  </button>
                </div>
                {/* Fake domain bar */}
                <div className="px-4 py-2.5 flex items-center gap-2 text-xs" style={{ background: T.panel, color: T.textSub }}>
                  <Globe size={11} />
                  https://{brand.domain}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Colors */}
                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h4 className="font-bold text-sm mb-4">Cores da marca</h4>
                  <div className="space-y-4">
                    <ColorSwatch color={brand.primaryColor} label="Cor primária" onChange={c => updateBrand("primaryColor", c)} />
                    <ColorSwatch color={brand.accentColor} label="Cor de destaque" onChange={c => updateBrand("accentColor", c)} />
                  </div>
                </div>

                {/* Text fields */}
                <div className="p-4 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                  <h4 className="font-bold text-sm">Identidade da marca</h4>
                  {[
                    { label: "Nome da plataforma", key: "name" as const,     placeholder: "Ex: MídiaSP Platform" },
                    { label: "Logotipo (emoji+texto)", key: "logoText" as const, placeholder: "🎯 MídiaSP" },
                    { label: "Tagline",             key: "tagline" as const, placeholder: "Sua plataforma DOOH" },
                    { label: "Domínio personalizado", key: "domain" as const, placeholder: "suaplataforma.com.br" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: T.textSub }}>{field.label}</label>
                      <input value={brand[field.key]} onChange={e => updateBrand(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                  ))}
                </div>

                {/* Domain setup */}
                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h4 className="font-bold text-sm mb-3">Configuração de DNS</h4>
                  <div className="p-3 rounded-xl font-mono text-xs" style={{ background: T.panel, color: T.textSub }}>
                    <div className="mb-2"><span style={{ color: T.primary }}>CNAME</span> {brand.domain} → <span style={{ color: T.success }}>wl.doohplay.com.br</span></div>
                    <div><span style={{ color: T.primary }}>A</span>     @ → <span style={{ color: T.success }}>35.198.15.240</span></div>
                  </div>
                  <button onClick={handleCopy}
                    className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ background: T.panel, color: copied ? T.success : T.textSub, border: `1px solid ${T.border}` }}>
                    {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar instruções</>}
                  </button>
                </div>

                <button className="w-full py-3.5 rounded-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                  Salvar e publicar marca
                </button>
              </div>
            )}
          </>
        )}

        {/* RESELLERS */}
        {tab === "resellers" && (
          <div className="space-y-3">
            {RESELLERS.map(r => {
              const s = STATUS_CFG[r.status];
              const commissionValue = r.monthlyRevenue * r.commission / 100;
              return (
                <div key={r.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                      style={{ background: T.primary + "20", color: T.primary }}>
                      {r.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{r.agency}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <div className="text-xs" style={{ color: T.textSub }}>{r.name} · {r.city} · desde {r.joinDate}</div>
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        <div>
                          <div className="text-xs" style={{ color: T.textSub }}>Telas</div>
                          <div className="font-bold text-sm">{r.screens}</div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: T.textSub }}>Clientes</div>
                          <div className="font-bold text-sm">{r.clients}</div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: T.textSub }}>Receita</div>
                          <div className="font-bold text-sm" style={{ color: T.success }}>R${(r.monthlyRevenue / 1000).toFixed(1)}K</div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: T.textSub }}>Comissão</div>
                          <div className="font-bold text-sm" style={{ color: T.gold }}>R${commissionValue.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-white/5 flex-shrink-0">
                      <Settings size={15} style={{ color: T.textSub }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRICING / COMMISSIONS */}
        {tab === "pricing" && (
          <div className="space-y-4">
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="p-4 border-b" style={{ borderColor: T.border }}>
                <h3 className="font-bold text-sm">Estrutura de comissões</h3>
              </div>
              {[
                { tier: "Starter Reseller",    screens: "1–10 telas",   commission: "15%", monthly: "R$0",      color: T.success },
                { tier: "Pro Reseller",         screens: "11–30 telas",  commission: "18%", monthly: "R$97",     color: T.primary },
                { tier: "Enterprise Reseller",  screens: "31+ telas",    commission: "20%", monthly: "R$290",    color: T.gold    },
                { tier: "Master Reseller",      screens: "100+ telas",   commission: "25%", monthly: "Negociar", color: T.accent  },
              ].map((tier, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0"
                  style={{ borderColor: T.border }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tier.color }} />
                  <div className="flex-1">
                    <div className="font-bold text-sm">{tier.tier}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tier.screens}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg" style={{ color: tier.color }}>{tier.commission}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tier.monthly}/mês</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h4 className="font-bold text-sm mb-3">Calculadora de receita</h4>
              <div className="space-y-3">
                {[
                  { label: "10 revendedores · 5 telas cada",    rev: "R$4.800/mês",  comm: "R$720/mês"  },
                  { label: "20 revendedores · 15 telas cada",   rev: "R$28.800/mês", comm: "R$5.184/mês"},
                  { label: "50 revendedores · 40 telas cada",   rev: "R$115.200/mês",comm: "R$23.040/mês"},
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                    <span className="text-xs" style={{ color: T.textSub }}>{row.label}</span>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: T.success }}>{row.rev}</div>
                      <div className="text-xs" style={{ color: T.gold }}>comissão: {row.comm}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: T.gold + "08", borderColor: T.gold + "25" }}>
              <div className="flex items-start gap-3">
                <Zap size={16} style={{ color: T.gold, marginTop: 1 }} />
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: T.gold }}>Potencial unicórnio via White Label</div>
                  <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>
                    Com 500 revendedores ativos gerenciando 50 telas cada, o GMV da rede supera <strong className="text-white">R$7,2M/mês</strong>. A DOOHPLAY recebe margem sobre toda a receita gerada na rede.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
