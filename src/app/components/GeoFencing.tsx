import { useState } from "react";
import {
  ArrowLeft, MapPin, Circle, Square, Zap, Users, TrendingUp,
  Plus, Trash2, Edit3, Eye, CheckCircle, Play, Pause,
  Navigation, Target, BarChart2, RefreshCw, X
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ZoneShape = "circle" | "polygon" | "corridor";
type ZoneStatus = "active" | "paused" | "draft";

interface GeoZone {
  id: string;
  name: string;
  shape: ZoneShape;
  city: string;
  radius?: number;
  area: number;
  campaign: string;
  status: ZoneStatus;
  dailyReach: number;
  impressions: number;
  screens: number;
  ctr: number;
  triggers: number;
}

const SHAPE_META: Record<ZoneShape, { label: string; color: string; icon: any }> = {
  circle:   { label: "Raio Circular",  color: T.primary, icon: Circle    },
  polygon:  { label: "Polígono",       color: T.accent,  icon: Square    },
  corridor: { label: "Corredor",       color: T.gold,    icon: Navigation },
};

const STATUS_META: Record<ZoneStatus, { label: string; color: string }> = {
  active: { label: "Ativa",   color: T.success },
  paused: { label: "Pausada", color: T.warning },
  draft:  { label: "Rascunho",color: T.textSub },
};

const ZONES: GeoZone[] = [
  { id: "GZ-01", name: "Raio Shopping Ibirapuera",    shape: "circle",   city: "São Paulo",      radius: 500,  area: 0.78,  campaign: "Ambev Verão",     status: "active", dailyReach: 38000, impressions: 142000, screens: 6,  ctr: 2.4, triggers: 284 },
  { id: "GZ-02", name: "Corredor Paulista–Consolação",shape: "corridor", city: "São Paulo",      radius: undefined, area: 1.2, campaign: "Bradesco Ads",  status: "active", dailyReach: 61000, impressions: 228000, screens: 9,  ctr: 3.1, triggers: 501 },
  { id: "GZ-03", name: "Aeroporto GRU — 2km",         shape: "circle",   city: "Guarulhos",      radius: 2000, area: 12.6, campaign: "iFood Premium",    status: "active", dailyReach: 22000, impressions: 80000,  screens: 4,  ctr: 4.2, triggers: 198 },
  { id: "GZ-04", name: "Zona Sul — Polígono",         shape: "polygon",  city: "São Paulo",      radius: undefined, area: 28.4,campaign: "Carrefour Jul", status: "paused", dailyReach: 0,     impressions: 0,      screens: 12, ctr: 0,   triggers: 0   },
  { id: "GZ-05", name: "Bairro de Boa Viagem",        shape: "circle",   city: "Recife",         radius: 800,  area: 2.0,  campaign: "FitLife Academia", status: "active", dailyReach: 18000, impressions: 64000,  screens: 3,  ctr: 1.8, triggers: 112 },
  { id: "GZ-06", name: "Entorno do Pelourinho",       shape: "polygon",  city: "Salvador",       radius: undefined, area: 0.6, campaign: "Unilever Q3",  status: "draft",  dailyReach: 0,     impressions: 0,      screens: 2,  ctr: 0,   triggers: 0   },
];

const DAILY_REACH = [
  { hour: "6h",  reach: 4200 },
  { hour: "8h",  reach: 14800 },
  { hour: "10h", reach: 18300 },
  { hour: "12h", reach: 22100 },
  { hour: "14h", reach: 19600 },
  { hour: "16h", reach: 21400 },
  { hour: "18h", reach: 28900 },
  { hour: "20h", reach: 24100 },
  { hour: "22h", reach: 12500 },
];

const CITY_DATA = [
  { city: "São Paulo",  zones: 3, reach: 121000, color: T.primary },
  { city: "Guarulhos",  zones: 1, reach: 22000,  color: T.accent  },
  { city: "Recife",     zones: 1, reach: 18000,  color: T.gold    },
  { city: "Salvador",   zones: 1, reach: 0,      color: T.textSub },
];

export default function GeoFencing({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"zones" | "create" | "analytics">("zones");
  const [selected, setSelected] = useState<GeoZone | null>(null);
  const [zones, setZones]       = useState<GeoZone[]>(ZONES);
  const [newName, setNewName]   = useState("");
  const [newShape, setNewShape] = useState<ZoneShape>("circle");
  const [newRadius, setNewRadius] = useState("500");
  const [newCity, setNewCity]   = useState("São Paulo");
  const [newCampaign, setNewCampaign] = useState("Ambev Verão");

  function toggleZone(id: string) {
    setZones(z => z.map(zone => zone.id !== id ? zone : {
      ...zone,
      status: zone.status === "active" ? "paused" : "active",
    }));
  }

  function deleteZone(id: string) {
    setZones(z => z.filter(zone => zone.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function createZone() {
    if (!newName) return;
    const zone: GeoZone = {
      id: `GZ-0${zones.length + 1}`, name: newName, shape: newShape,
      city: newCity, radius: newShape === "circle" ? parseInt(newRadius) : undefined,
      area: newShape === "circle" ? Math.PI * (parseInt(newRadius) / 1000) ** 2 : 1.0,
      campaign: newCampaign, status: "draft",
      dailyReach: 0, impressions: 0, screens: 0, ctr: 0, triggers: 0,
    };
    setZones(z => [zone, ...z]);
    setNewName("");
    setTab("zones");
  }

  const activeZones   = zones.filter(z => z.status === "active").length;
  const totalReach    = zones.reduce((s, z) => s + z.dailyReach, 0);
  const totalTriggers = zones.reduce((s, z) => s + z.triggers, 0);
  const totalScreens  = zones.filter(z => z.status === "active").reduce((s, z) => s + z.screens, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <MapPin size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Geo-Fencing</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Segmentação por raio, polígono e corredor geográfico</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["zones","create","analytics"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.success + "20" : "transparent", color: tab === t ? T.success : T.textSub, border: `1px solid ${tab === t ? T.success + "30" : "transparent"}` }}>
                {t === "zones" ? "Zonas" : t === "create" ? "Criar Zona" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Zonas Ativas",       value: activeZones,                             color: T.success, icon: MapPin   },
            { label: "Alcance Diário",     value: `${(totalReach / 1000).toFixed(0)}k`,   color: T.primary, icon: Users    },
            { label: "Triggers (30d)",     value: totalTriggers.toLocaleString("pt-BR"),  color: T.gold,    icon: Zap      },
            { label: "Telas Cobertas",     value: totalScreens,                            color: T.accent,  icon: Target   },
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

        {tab === "zones" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border, height: 280, position: "relative" }}>
                <div className="absolute inset-0" style={{
                  background: `repeating-linear-gradient(0deg, ${T.border}30 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, ${T.border}30 0px, transparent 1px, transparent 40px), ${T.bg}`,
                }} />
                {[
                  { x: 38, y: 45, r: 60,  color: T.primary, label: "Ibirapuera", active: true  },
                  { x: 55, y: 30, r: 90,  color: T.accent,  label: "Paulista",   active: true  },
                  { x: 75, y: 55, r: 45,  color: T.gold,    label: "GRU",        active: true  },
                  { x: 20, y: 65, r: 70,  color: T.textSub, label: "Zona Sul",   active: false },
                ].map((z, i) => (
                  <div key={i} className="absolute rounded-full border-2 flex items-end justify-center pb-1"
                    style={{
                      left: `${z.x}%`, top: `${z.y}%`,
                      width: z.r, height: z.r,
                      marginLeft: -z.r / 2, marginTop: -z.r / 2,
                      borderColor: z.color + (z.active ? "80" : "30"),
                      background: z.color + (z.active ? "12" : "06"),
                    }}>
                    <span className="text-xs font-black" style={{ color: z.color, fontSize: 9 }}>{z.label}</span>
                  </div>
                ))}
                <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-lg" style={{ background: T.panel, color: T.textSub }}>
                  Visualização esquemática
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {[{ c: T.primary, l: "Ativa" }, { c: T.textSub, l: "Pausada" }, { c: T.accent, l: "Corredor" }].map((leg, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: leg.c + "60", border: `1px solid ${leg.c}` }} />
                      <span className="text-xs" style={{ color: T.textSub }}>{leg.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {zones.map(zone => {
                  const sm = SHAPE_META[zone.shape];
                  const st = STATUS_META[zone.status];
                  const ShapeIcon = sm.icon;
                  return (
                    <div key={zone.id} onClick={() => setSelected(selected?.id === zone.id ? null : zone)}
                      className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all"
                      style={{ background: T.card, borderColor: selected?.id === zone.id ? T.success + "50" : T.border }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: sm.color + "20" }}>
                          <ShapeIcon size={17} style={{ color: sm.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black">{zone.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: st.color + "20", color: st.color }}>{st.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                            <span><MapPin size={9} className="inline mr-0.5" />{zone.city}</span>
                            <span>{sm.label}{zone.radius ? ` · ${zone.radius}m` : ""}</span>
                            <span>{zone.area.toFixed(1)} km²</span>
                            <span>·</span>
                            <span>{zone.campaign}</span>
                          </div>
                        </div>
                        {zone.status !== "draft" && (
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <div className="font-black">{zone.dailyReach > 0 ? `${(zone.dailyReach / 1000).toFixed(0)}k` : "—"}</div>
                              <div className="text-xs" style={{ color: T.textSub }}>alcance/dia</div>
                            </div>
                            <div>
                              <div className="font-black" style={{ color: T.gold }}>{zone.ctr > 0 ? `${zone.ctr}%` : "—"}</div>
                              <div className="text-xs" style={{ color: T.textSub }}>CTR</div>
                            </div>
                            <div>
                              <div className="font-black" style={{ color: zone.screens > 0 ? T.success : T.textSub }}>{zone.screens}</div>
                              <div className="text-xs" style={{ color: T.textSub }}>telas</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1 ml-2">
                          {zone.status !== "draft" && (
                            <button onClick={e => { e.stopPropagation(); toggleZone(zone.id); }}
                              className="p-2 rounded-lg hover:bg-white/5">
                              {zone.status === "active"
                                ? <Pause size={14} style={{ color: T.warning }} />
                                : <Play size={14} style={{ color: T.success }} />}
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); deleteZone(zone.id); }}
                            className="p-2 rounded-lg hover:bg-white/5">
                            <Trash2 size={14} style={{ color: T.danger }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div>
                  <div className="font-black text-sm">{selected.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{selected.city}</div>
                </div>
                {[
                  { label: "Forma",           value: SHAPE_META[selected.shape].label,    color: SHAPE_META[selected.shape].color },
                  { label: "Status",          value: STATUS_META[selected.status].label,  color: STATUS_META[selected.status].color },
                  { label: "Campanha",        value: selected.campaign },
                  { label: "Raio",            value: selected.radius ? `${selected.radius}m` : "N/A" },
                  { label: "Área",            value: `${selected.area.toFixed(1)} km²` },
                  { label: "Telas cobertas",  value: `${selected.screens}` },
                  { label: "Alcance/dia",     value: selected.dailyReach > 0 ? `${(selected.dailyReach / 1000).toFixed(0)}k` : "—" },
                  { label: "CTR",             value: selected.ctr > 0 ? `${selected.ctr}%` : "—", color: T.gold },
                  { label: "Triggers (30d)",  value: `${selected.triggers}`, color: T.primary },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold" style={{ color: (r as any).color || T.text }}>{r.value}</span>
                  </div>
                ))}
                <div className="pt-2 space-y-2">
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                    Ativar Zona
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                    Editar Zona
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "create" && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-black text-lg mb-6">Nova Zona de Geo-Fencing</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>NOME DA ZONA</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Raio Shopping Morumbi 500m"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>

              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>TIPO DE ZONA</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["circle","polygon","corridor"] as ZoneShape[]).map(shape => {
                    const meta = SHAPE_META[shape];
                    const Icon = meta.icon;
                    return (
                      <button key={shape} onClick={() => setNewShape(shape)}
                        className="p-4 rounded-xl flex flex-col items-center gap-2"
                        style={{ background: newShape === shape ? meta.color + "20" : T.panel, border: `2px solid ${newShape === shape ? meta.color : T.border}` }}>
                        <Icon size={22} style={{ color: meta.color }} />
                        <span className="text-xs font-black" style={{ color: newShape === shape ? meta.color : T.textSub }}>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newShape === "circle" && (
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>RAIO (metros)</label>
                  <input type="range" min={100} max={5000} step={100}
                    value={newRadius} onChange={e => setNewRadius(e.target.value)}
                    className="w-full" style={{ accentColor: T.primary }} />
                  <div className="text-center font-black mt-1" style={{ color: T.primary }}>{parseInt(newRadius).toLocaleString("pt-BR")}m</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>CIDADE</label>
                  <select value={newCity} onChange={e => setNewCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    {["São Paulo","Rio de Janeiro","Brasília","Curitiba","Salvador","Recife","Guarulhos"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>CAMPANHA</label>
                  <select value={newCampaign} onChange={e => setNewCampaign(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    {["Ambev Verão","Bradesco Ads","iFood OOH Jul","Carrefour Jul","FitLife Academia","Unilever Q3"].map(cp => (
                      <option key={cp} value={cp}>{cp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={createZone}
                  className="flex-1 py-3 rounded-xl font-black text-sm" style={{ background: T.success, color: "#000" }}>
                  Criar Zona de Geo-Fencing
                </button>
                <button onClick={() => setTab("zones")}
                  className="px-5 py-3 rounded-xl font-bold text-sm" style={{ background: T.border, color: T.textSub }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Alcance por Hora — Hoje</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Pessoas dentro das zonas ativas ao longo do dia</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={DAILY_REACH} barSize={22}>
                    <XAxis dataKey="hour" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [v.toLocaleString("pt-BR"), "Alcance"]} />
                    <Bar key="bar-reach" dataKey="reach" radius={[6, 6, 0, 0]}>
                      {DAILY_REACH.map((_, i) => (
                        <Cell key={`cell-reach-${i}`} fill={i >= 5 && i <= 7 ? T.success : T.primary + "AA"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Alcance por Cidade</h3>
                <div className="space-y-3">
                  {CITY_DATA.map((cd, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">{cd.city}</span>
                        <span className="font-black text-sm" style={{ color: cd.color }}>
                          {cd.reach > 0 ? `${(cd.reach / 1000).toFixed(0)}k` : "—"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${cd.reach / 1210}%`, background: cd.color }} />
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{cd.zones} zona(s)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4">Performance das Zonas Ativas</h3>
              <div className="space-y-2">
                {zones.filter(z => z.status === "active").map((z, i) => {
                  const sm = SHAPE_META[z.shape];
                  const ShapeIcon = sm.icon;
                  return (
                    <div key={z.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: T.panel }}>
                      <ShapeIcon size={15} style={{ color: sm.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-bold">{z.name}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{z.city} · {z.campaign}</div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="font-black text-sm">{(z.dailyReach / 1000).toFixed(0)}k</div>
                          <div className="text-xs" style={{ color: T.textSub }}>alcance</div>
                        </div>
                        <div>
                          <div className="font-black text-sm" style={{ color: T.gold }}>{z.ctr}%</div>
                          <div className="text-xs" style={{ color: T.textSub }}>CTR</div>
                        </div>
                        <div>
                          <div className="font-black text-sm" style={{ color: T.success }}>{z.triggers}</div>
                          <div className="text-xs" style={{ color: T.textSub }}>triggers</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
