import { useState } from "react";
import {
  ArrowLeft, Palette, Globe, Upload, Eye, CheckCircle, Sliders,
  Monitor, Smartphone, LayoutDashboard, Megaphone, BarChart2, Settings
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const PRESETS = [
  { id: "doohplay",  name: "DOOHPLAY",      primary: "#4F6EF7", bg: "#05060E", panel: "#0A0C18", text: "#ECF0FF", logo: "D"  },
  { id: "mediatech", name: "MediaTech Ads", primary: "#E63946", bg: "#0A0005", panel: "#140008", text: "#FFF0F0", logo: "M"  },
  { id: "adnova",    name: "AdNova",        primary: "#00B894", bg: "#00100A", panel: "#041410", text: "#E0FFF8", logo: "AN" },
  { id: "screen360", name: "Screen360",     primary: "#F9A825", bg: "#0A0800", panel: "#140E00", text: "#FFF8E0", logo: "S"  },
  { id: "pixelmedia",name: "PixelMedia",    primary: "#9C27B0", bg: "#080010", panel: "#0E0018", text: "#F3E0FF", logo: "PM" },
  { id: "custom",    name: "Personalizado", primary: "#4F6EF7", bg: "#05060E", panel: "#0A0C18", text: "#ECF0FF", logo: "?"  },
];

export default function WhiteLabelPreview({ onBack }: Props) {
  const [preset, setPreset]           = useState(PRESETS[0]);
  const [customPrimary, setCustomPrimary] = useState("#4F6EF7");
  const [customBg, setCustomBg]       = useState("#05060E");
  const [brandName, setBrandName]     = useState("DOOHPLAY");
  const [domain, setDomain]           = useState("app.minhaempresa.com.br");
  const [activeNav, setActiveNav]     = useState("dashboard");
  const [device, setDevice]           = useState<"desktop" | "mobile">("desktop");

  const colors = preset.id === "custom"
    ? { primary: customPrimary, bg: customBg, panel: "#0A0C18", text: "#ECF0FF" }
    : preset;

  const navItems = [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "campaigns",  label: "Campanhas",  icon: Megaphone       },
    { id: "analytics",  label: "Analytics",  icon: BarChart2       },
    { id: "settings",   label: "Config.",    icon: Settings        },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Palette size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">White Label Preview</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Simule como a plataforma aparece com sua marca</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "desktop", icon: Monitor    },
              { id: "mobile",  icon: Smartphone },
            ].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setDevice(id as any)}
                className="p-2.5 rounded-xl transition-all"
                style={{ background: device === id ? T.accent + "20" : T.card, color: device === id ? T.accent : T.textSub, border: `1px solid ${device === id ? T.accent + "40" : T.border}` }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">

        {/* Controls panel */}
        <div className="space-y-4">
          {/* Presets */}
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>TEMAS PRONTOS</div>
            <div className="space-y-2">
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => { setPreset(p); if (p.id !== "custom") setBrandName(p.name); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{ background: preset.id === p.id ? p.primary + "15" : "transparent", border: `1px solid ${preset.id === p.id ? p.primary + "40" : "transparent"}` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: p.primary, color: "#fff" }}>{p.logo}</div>
                  <span className="text-sm font-bold" style={{ color: T.text }}>{p.name}</span>
                  {preset.id === p.id && <CheckCircle size={12} style={{ color: p.primary }} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand settings */}
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>MARCA</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: T.textSub }}>Nome da plataforma</label>
                <input value={brandName} onChange={e => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: T.textSub }}>Domínio</label>
                <input value={domain} onChange={e => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>
          </div>

          {/* Custom colors */}
          {preset.id === "custom" && (
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>CORES CUSTOMIZADAS</div>
              <div className="space-y-3">
                {[
                  { label: "Cor primária", value: customPrimary, set: setCustomPrimary },
                  { label: "Fundo",        value: customBg,      set: setCustomBg      },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center gap-3">
                    <input type="color" value={value} onChange={e => set(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border-0"
                      style={{ background: "transparent" }} />
                    <div>
                      <div className="text-xs font-bold" style={{ color: T.text }}>{label}</div>
                      <div className="text-xs font-mono" style={{ color: T.textSub }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>MÓDULOS INCLUÍDOS</div>
            <div className="space-y-2">
              {["Campaign Manager","Analytics Dashboard","ProofChain","Audience Builder","Billing","API Access"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={13} style={{ color: colors.primary }} />
                  <span style={{ color: T.text }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="col-span-2">
          <div className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: T.textSub }}>
            <Eye size={11} /> PREVIEW — {device === "desktop" ? "Desktop" : "Mobile"} · {domain}
          </div>

          {device === "desktop" ? (
            /* Desktop preview */
            <div className="rounded-2xl overflow-hidden border shadow-2xl"
              style={{ background: colors.bg, borderColor: T.border }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: T.panel, borderBottom: `1px solid ${T.border}` }}>
                <div className="flex gap-1.5">
                  {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                </div>
                <div className="flex-1 mx-4 px-3 py-1 rounded-md text-xs font-mono" style={{ background: T.card, color: T.textSub }}>
                  https://{domain}
                </div>
              </div>

              {/* App layout */}
              <div className="flex" style={{ minHeight: 460 }}>
                {/* Sidebar */}
                <div className="w-48 flex-shrink-0 border-r py-4" style={{ background: colors.panel || colors.bg, borderColor: colors.primary + "20" }}>
                  {/* Brand */}
                  <div className="px-4 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                        style={{ background: colors.primary, color: "#fff" }}>
                        {brandName.slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-black text-sm" style={{ color: colors.text }}>{brandName}</span>
                    </div>
                  </div>
                  {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveNav(item.id)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                      style={{ background: activeNav === item.id ? colors.primary + "20" : "transparent" }}>
                      <item.icon size={14} style={{ color: activeNav === item.id ? colors.primary : colors.text + "80" }} />
                      <span className="text-xs font-bold" style={{ color: activeNav === item.id ? colors.primary : colors.text + "80" }}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-black text-base" style={{ color: colors.text }}>
                      {navItems.find(n => n.id === activeNav)?.label}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full" style={{ background: colors.primary + "30" }} />
                    </div>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Impressões", value: "2.4M",   color: colors.primary },
                      { label: "Receita",    value: "R$84k",  color: "#00DC82"      },
                      { label: "CTR",        value: "4.8%",   color: "#FFAA00"      },
                    ].map((kpi, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: colors.primary + "10", border: `1px solid ${colors.primary}20` }}>
                        <div className="font-black text-base" style={{ color: kpi.color }}>{kpi.value}</div>
                        <div className="text-xs" style={{ color: colors.text + "60" }}>{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-xl p-4 flex items-center justify-center"
                    style={{ background: colors.primary + "08", border: `1px dashed ${colors.primary}25`, height: 120 }}>
                    <div className="flex items-end gap-1">
                      {[40,65,45,80,60,90,70,85,55,75,95,68].map((h, i) => (
                        <div key={i} className="w-4 rounded-t transition-all"
                          style={{ height: `${h * 0.9}px`, background: i === 11 ? colors.primary : colors.primary + "40" }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom domain bar */}
              <div className="px-4 py-2 text-xs text-center border-t" style={{ borderColor: T.border, color: T.textSub }}>
                Powered by {brandName} · {domain}
              </div>
            </div>
          ) : (
            /* Mobile preview */
            <div className="flex justify-center">
              <div className="w-64 rounded-[2.5rem] overflow-hidden border-4 shadow-2xl"
                style={{ background: colors.bg, borderColor: T.border }}>
                {/* Status bar */}
                <div className="px-6 py-2 flex items-center justify-between text-xs"
                  style={{ background: colors.bg, color: colors.text + "80" }}>
                  <span>9:41</span><span>●●●</span>
                </div>
                {/* App header */}
                <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: colors.primary + "20" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
                    style={{ background: colors.primary, color: "#fff" }}>
                    {brandName.slice(0,2).toUpperCase()}
                  </div>
                  <span className="font-black text-sm" style={{ color: colors.text }}>{brandName}</span>
                </div>
                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="font-black text-sm" style={{ color: colors.text }}>Dashboard</div>
                  {[
                    { label: "Impressões", value: "2.4M",  color: colors.primary },
                    { label: "Receita",    value: "R$84k", color: "#00DC82"      },
                  ].map((kpi, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: colors.primary + "15" }}>
                      <div className="font-black text-lg" style={{ color: kpi.color }}>{kpi.value}</div>
                      <div className="text-xs" style={{ color: colors.text + "60" }}>{kpi.label}</div>
                    </div>
                  ))}
                  {/* Mini chart */}
                  <div className="rounded-xl p-3 flex items-end gap-0.5"
                    style={{ background: colors.primary + "08", height: 60 }}>
                    {[30,50,40,70,55,80,65].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t"
                        style={{ height: `${h * 0.5}px`, background: i === 5 ? colors.primary : colors.primary + "40" }} />
                    ))}
                  </div>
                </div>
                {/* Bottom nav */}
                <div className="px-2 py-3 flex items-center justify-around border-t" style={{ borderColor: colors.primary + "20" }}>
                  {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveNav(item.id)} className="flex flex-col items-center gap-0.5">
                      <item.icon size={16} style={{ color: activeNav === item.id ? colors.primary : colors.text + "50" }} />
                      <span className="text-xs" style={{ color: activeNav === item.id ? colors.primary : colors.text + "50", fontSize: 9 }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Plan card */}
          <div className="mt-4 p-4 rounded-2xl border flex items-center justify-between"
            style={{ background: T.card, borderColor: T.border }}>
            <div>
              <div className="font-black" style={{ color: T.text }}>White Label Enterprise</div>
              <div className="text-sm" style={{ color: T.textSub }}>Domínio próprio · Sem marca DOOHPLAY · API completa · SLA 99.9%</div>
            </div>
            <div className="text-right">
              <div className="font-black text-xl" style={{ color: T.gold }}>R$620<span className="text-sm font-normal">/mês</span></div>
              <button className="px-4 py-2 rounded-xl text-xs font-black mt-1"
                style={{ background: T.gold + "20", color: T.gold }}>
                Ativar White Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
