import { useState } from "react";
import {
  ArrowLeft, Search, Upload, Grid, List, Filter, Play, Image, FileVideo,
  Clock, Eye, Star, Trash2, Download, Copy, Tag, FolderOpen, Plus,
  CheckCircle, AlertCircle, Zap, ArrowUpRight, Film, Layers
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type AssetType = "video" | "image" | "template" | "html5";
type AssetStatus = "approved" | "pending" | "rejected";

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  size: string;
  duration?: string;
  resolution: string;
  tags: string[];
  views: number;
  plays: number;
  uploadedAt: string;
  advertiser: string;
  color: string;
  aspectRatio: string;
}

const STATUS_COLOR: Record<AssetStatus, string> = {
  approved: T.success, pending: T.warning, rejected: T.danger,
};
const STATUS_LABEL: Record<AssetStatus, string> = {
  approved: "Aprovado", pending: "Pendente", rejected: "Rejeitado",
};
const TYPE_ICON: Record<AssetType, any> = {
  video: FileVideo, image: Image, template: Layers, html5: Zap,
};
const TYPE_COLOR: Record<AssetType, string> = {
  video: T.primary, image: T.accent, template: T.gold, html5: T.success,
};

const ASSETS: Asset[] = [
  { id: "a1",  name: "Hamburguer Artesanal 30s",   type: "video",    status: "approved",  size: "48 MB",  duration: "0:30", resolution: "1920×1080", tags: ["alimentação","promo"], views: 14280, plays: 12400, uploadedAt: "10/07/2026", advertiser: "Burguer Co.",   color: "#FF6B35", aspectRatio: "16:9" },
  { id: "a2",  name: "Academia FitLife Banner",    type: "image",    status: "approved",  size: "3.2 MB", duration: undefined,   resolution: "1080×1920", tags: ["fitness","vertical"],  views: 8900, plays: 0,     uploadedAt: "12/07/2026", advertiser: "FitLife",       color: "#00DC82", aspectRatio: "9:16" },
  { id: "a3",  name: "Template Promoção Black",    type: "template", status: "approved",  size: "1.1 MB", duration: undefined,   resolution: "1920×1080", tags: ["template","promo"],    views: 3200, plays: 0,     uploadedAt: "08/07/2026", advertiser: "DOOHPLAY",      color: "#FFD700", aspectRatio: "16:9" },
  { id: "a4",  name: "Lançamento Perfume 15s",     type: "video",    status: "pending",   size: "22 MB",  duration: "0:15", resolution: "1080×1080", tags: ["beleza","luxo"],       views: 0,    plays: 0,     uploadedAt: "22/07/2026", advertiser: "Parfum Brazil", color: "#7C5CFC", aspectRatio: "1:1"  },
  { id: "a5",  name: "Farmácia 24h Animado",       type: "html5",   status: "approved",  size: "620 KB", duration: "0:10", resolution: "1920×1080", tags: ["saúde","urgente"],     views: 22100, plays: 19800, uploadedAt: "05/07/2026", advertiser: "Drogasil+",     color: "#FF4D6A", aspectRatio: "16:9" },
  { id: "a6",  name: "Imóvel Alphaville",          type: "image",    status: "rejected",  size: "5.8 MB", duration: undefined,   resolution: "1920×540",  tags: ["imóvel"],             views: 0,    plays: 0,     uploadedAt: "18/07/2026", advertiser: "Lopes Imóveis", color: "#4A5280", aspectRatio: "32:9" },
  { id: "a7",  name: "Delivery Rápido 60s",        type: "video",    status: "approved",  size: "91 MB",  duration: "1:00", resolution: "1920×1080", tags: ["food","delivery"],     views: 31000, plays: 27600, uploadedAt: "01/07/2026", advertiser: "iFood OOH",     color: "#EA1D2C", aspectRatio: "16:9" },
  { id: "a8",  name: "Template Countdown Evento",  type: "template", status: "approved",  size: "890 KB", duration: undefined,   resolution: "1080×1920", tags: ["evento","template"],  views: 1800, plays: 0,     uploadedAt: "14/07/2026", advertiser: "DOOHPLAY",      color: "#FFAA00", aspectRatio: "9:16" },
  { id: "a9",  name: "Pet Shop Mega Promoção",     type: "image",    status: "approved",  size: "2.4 MB", duration: undefined,   resolution: "1920×1080", tags: ["pet","promo"],         views: 9400, plays: 0,     uploadedAt: "16/07/2026", advertiser: "Pet Center",    color: "#4F6EF7", aspectRatio: "16:9" },
  { id: "a10", name: "App Download CTA HTML5",     type: "html5",   status: "pending",   size: "340 KB", duration: "0:20", resolution: "1080×1920", tags: ["tech","app"],          views: 0,    plays: 0,     uploadedAt: "21/07/2026", advertiser: "Fintech BR",    color: "#00DC82", aspectRatio: "9:16" },
  { id: "a11", name: "Curso Online 30s",           type: "video",    status: "approved",  size: "38 MB",  duration: "0:30", resolution: "1920×1080", tags: ["educação"],            views: 7200, plays: 6100, uploadedAt: "09/07/2026", advertiser: "EduPlay",       color: "#7C5CFC", aspectRatio: "16:9" },
  { id: "a12", name: "Supermercado Ofertas",       type: "image",    status: "approved",  size: "4.1 MB", duration: undefined,   resolution: "1920×1080", tags: ["varejo","promoção"],  views: 18700, plays: 0,    uploadedAt: "03/07/2026", advertiser: "Carrefour OOH", color: "#FFD700", aspectRatio: "16:9" },
];

const FILTERS = ["Todos", "video", "image", "template", "html5"];
const STATUS_FILTERS = ["Todos", "approved", "pending", "rejected"];
const SORTS = ["Mais recentes", "Mais vistos", "Tamanho", "Nome"];

function AssetCard({ asset, selected, onSelect }: { asset: Asset; selected: boolean; onSelect: () => void }) {
  const Icon = TYPE_ICON[asset.type];
  return (
    <div onClick={onSelect}
      className="rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]"
      style={{ background: T.card, borderColor: selected ? T.primary : T.border, boxShadow: selected ? `0 0 0 2px ${T.primary}40` : "none" }}>
      <div className="relative rounded-t-2xl overflow-hidden" style={{ aspectRatio: asset.aspectRatio === "9:16" ? "9/16" : asset.aspectRatio === "1:1" ? "1/1" : "16/9", maxHeight: 140, background: asset.color + "20" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={28} style={{ color: asset.color, opacity: 0.7 }} />
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(0,0,0,0.7)", color: TYPE_COLOR[asset.type] }}>
            {asset.type.toUpperCase()}
          </span>
        </div>
        {asset.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)" }}>
            <Clock size={9} style={{ color: "#fff" }} />
            <span className="text-xs text-white font-bold">{asset.duration}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[asset.status] }} />
        </div>
      </div>
      <div className="p-3">
        <div className="font-bold text-xs truncate mb-1">{asset.name}</div>
        <div className="text-xs mb-2 truncate" style={{ color: T.textSub }}>{asset.advertiser}</div>
        <div className="flex items-center justify-between text-xs" style={{ color: T.textSub }}>
          <span>{asset.resolution}</span>
          <span>{asset.size}</span>
        </div>
        {(asset.views > 0 || asset.plays > 0) && (
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: T.textSub }}>
            {asset.views > 0 && <span><Eye size={9} className="inline mr-0.5" />{(asset.views/1000).toFixed(1)}k</span>}
            {asset.plays > 0 && <span><Play size={9} className="inline mr-0.5" />{(asset.plays/1000).toFixed(1)}k</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContentLibrary({ onBack, onNavigate }: Props) {
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [sort, setSort]             = useState("Mais recentes");
  const [viewMode, setViewMode]     = useState<"grid" | "list">("grid");
  const [selected, setSelected]     = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);

  const filtered = ASSETS.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.advertiser.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "Todos" && a.type !== typeFilter) return false;
    if (statusFilter !== "Todos" && a.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "Mais vistos") return b.views - a.views;
    if (sort === "Nome") return a.name.localeCompare(b.name);
    return 0;
  });

  const selAsset = ASSETS.find(a => a.id === selected);

  const totalSize = ASSETS.reduce((s, a) => s + parseFloat(a.size), 0);
  const totalViews = ASSETS.reduce((s, a) => s + a.views, 0);
  const totalPlays = ASSETS.reduce((s, a) => s + a.plays, 0);

  function simulateUpload() {
    setUploading(true);
    setTimeout(() => setUploading(false), 2200);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Film size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Biblioteca de Conteúdo</h1>
                <p className="text-xs" style={{ color: T.textSub }}>{ASSETS.length} assets · {totalSize.toFixed(0)} MB total</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")} className="p-2 rounded-lg transition-all"
              style={{ background: viewMode === "grid" ? T.primary + "20" : "transparent", color: viewMode === "grid" ? T.primary : T.textSub }}>
              <Grid size={16} />
            </button>
            <button onClick={() => setViewMode("list")} className="p-2 rounded-lg transition-all"
              style={{ background: viewMode === "list" ? T.primary + "20" : "transparent", color: viewMode === "list" ? T.primary : T.textSub }}>
              <List size={16} />
            </button>
            <button onClick={simulateUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ml-2"
              style={{ background: T.primary, color: "#fff" }}>
              {uploading ? (
                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.6s linear infinite" }} /> Enviando...</>
              ) : (
                <><Upload size={14} /> Enviar Asset</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-5 pb-4 grid grid-cols-4 gap-4">
            {[
              { label: "Total de Assets",     value: ASSETS.length,                     color: T.primary, icon: FolderOpen },
              { label: "Visualizações",        value: (totalViews/1000).toFixed(1)+"k",  color: T.accent,  icon: Eye },
              { label: "Reproduções",          value: (totalPlays/1000).toFixed(1)+"k",  color: T.success, icon: Play },
              { label: "Pendentes aprovação",  value: ASSETS.filter(a=>a.status==="pending").length, color: T.warning, icon: AlertCircle },
            ].map((k, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.color + "20" }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <div>
                  <div className="font-black text-lg leading-none" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar assets..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: typeFilter === f ? T.primary + "20" : T.card, color: typeFilter === f ? T.primary : T.textSub, border: `1px solid ${typeFilter === f ? T.primary + "30" : T.border}` }}>
                  {f === "Todos" ? "Todos" : f === "video" ? "Vídeo" : f === "image" ? "Imagem" : f === "template" ? "Template" : "HTML5"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: statusFilter === f ? (STATUS_COLOR[f as AssetStatus] || T.primary) + "20" : T.card, color: statusFilter === f ? (STATUS_COLOR[f as AssetStatus] || T.primary) : T.textSub, border: `1px solid ${statusFilter === f ? (STATUS_COLOR[f as AssetStatus] || T.primary) + "30" : T.border}` }}>
                  {f === "Todos" ? "Todos" : STATUS_LABEL[f as AssetStatus]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(asset => (
                  <AssetCard key={asset.id} asset={asset} selected={selected === asset.id}
                    onSelect={() => setSelected(selected === asset.id ? null : asset.id)} />
                ))}
                <button onClick={simulateUpload}
                  className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-36 transition-all hover:border-opacity-80"
                  style={{ borderColor: T.border, color: T.textSub }}>
                  <Plus size={20} />
                  <span className="text-xs font-bold">Enviar</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                      {["Nome","Tipo","Anunciante","Resolução","Tamanho","Views","Status","Ações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(asset => {
                      const Icon = TYPE_ICON[asset.type];
                      return (
                        <tr key={asset.id} onClick={() => setSelected(asset.id === selected ? null : asset.id)}
                          className="border-b cursor-pointer hover:bg-white/3"
                          style={{ borderColor: T.border + "60", background: selected === asset.id ? T.primary + "08" : "transparent" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon size={14} style={{ color: TYPE_COLOR[asset.type], flexShrink: 0 }} />
                              <span className="font-bold text-xs truncate max-w-36">{asset.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold uppercase" style={{ color: TYPE_COLOR[asset.type] }}>{asset.type}</span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{asset.advertiser}</td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: T.textSub }}>{asset.resolution}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{asset.size}</td>
                          <td className="px-4 py-3 text-xs">
                            {asset.views > 0 ? <span style={{ color: T.accent }}>{(asset.views/1000).toFixed(1)}k</span> : <span style={{ color: T.textSub }}>—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: STATUS_COLOR[asset.status] + "20", color: STATUS_COLOR[asset.status] }}>
                              {STATUS_LABEL[asset.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-white/5" onClick={e => e.stopPropagation()}>
                                <Download size={11} style={{ color: T.textSub }} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-white/5" onClick={e => e.stopPropagation()}>
                                <Copy size={11} style={{ color: T.textSub }} />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-white/5" onClick={e => e.stopPropagation()}>
                                <Trash2 size={11} style={{ color: T.danger }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selAsset && (
          <div className="w-72 border-l overflow-y-auto flex-shrink-0" style={{ borderColor: T.border, background: T.panel }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: T.textSub }}>DETALHES</span>
                <button onClick={() => setSelected(null)} className="text-xs" style={{ color: T.textSub }}>✕</button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4 flex items-center justify-center"
                style={{ height: 130, background: selAsset.color + "20", border: `1px solid ${selAsset.color}30` }}>
                {(() => { const Icon = TYPE_ICON[selAsset.type]; return <Icon size={40} style={{ color: selAsset.color, opacity: 0.7 }} />; })()}
              </div>

              <h3 className="font-black text-sm mb-1">{selAsset.name}</h3>
              <div className="text-xs mb-4" style={{ color: T.textSub }}>{selAsset.advertiser}</div>

              <div className="space-y-2 mb-4">
                {[
                  { label: "Tipo",        value: selAsset.type.toUpperCase() },
                  { label: "Status",      value: STATUS_LABEL[selAsset.status], color: STATUS_COLOR[selAsset.status] },
                  { label: "Resolução",   value: selAsset.resolution },
                  { label: "Proporção",   value: selAsset.aspectRatio },
                  { label: "Tamanho",     value: selAsset.size },
                  ...(selAsset.duration ? [{ label: "Duração", value: selAsset.duration }] : []),
                  { label: "Enviado em",  value: selAsset.uploadedAt },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: T.textSub }}>{row.label}</span>
                    <span className="text-xs font-bold" style={{ color: (row as any).color || T.text }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {selAsset.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {(selAsset.views > 0 || selAsset.plays > 0) && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selAsset.views > 0 && (
                    <div className="p-3 rounded-xl text-center" style={{ background: T.card }}>
                      <div className="font-black text-lg" style={{ color: T.accent }}>{(selAsset.views/1000).toFixed(1)}k</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Views</div>
                    </div>
                  )}
                  {selAsset.plays > 0 && (
                    <div className="p-3 rounded-xl text-center" style={{ background: T.card }}>
                      <div className="font-black text-lg" style={{ color: T.success }}>{(selAsset.plays/1000).toFixed(1)}k</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Plays</div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {selAsset.status === "pending" && (
                  <button className="w-full py-2 rounded-xl text-sm font-black"
                    style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                    <CheckCircle size={13} className="inline mr-1.5" />Aprovar Asset
                  </button>
                )}
                <button onClick={() => onNavigate?.("screen-scheduler")}
                  className="w-full py-2 rounded-xl text-sm font-black"
                  style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                  <ArrowUpRight size={13} className="inline mr-1.5" />Agendar na Tela
                </button>
                <button className="w-full py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <Download size={13} className="inline mr-1.5" />Download Original
                </button>
                <button className="w-full py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.danger + "10", color: T.danger, border: `1px solid ${T.danger}20` }}>
                  <Trash2 size={13} className="inline mr-1.5" />Excluir Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
