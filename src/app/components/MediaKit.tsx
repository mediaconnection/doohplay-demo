import { useState } from "react";
import { ArrowLeft, Download, Share2, Eye, Copy, CheckCircle, Tv, Shield, Zap, DollarSign, Users, Globe, Star, ChevronRight, FileText, Image, Play, Package } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Asset = { id: string; title: string; type: "pdf" | "deck" | "image" | "video"; size: string; desc: string; downloads: number; };

const ASSETS: Asset[] = [
  { id: "mk1", title: "Media Kit DOOHPLAY 2026", type: "pdf", size: "4.2 MB", desc: "One-pager completo com audiencia, formatos e CPMs", downloads: 1840 },
  { id: "mk2", title: "Pitch Deck - Anunciantes", type: "deck", size: "8.7 MB", desc: "Apresentacao comercial para agencias e marcas", downloads: 920 },
  { id: "mk3", title: "Case: FitSpace +320% Receita", type: "pdf", size: "1.8 MB", desc: "Estudo de caso completo com metricas", downloads: 2310 },
  { id: "mk4", title: "Especificacoes de Criativo", type: "pdf", size: "0.9 MB", desc: "Formatos aceitos, resolucoes e guidelines", downloads: 3480 },
];

const STATS = [
  { label: "Telas ativas", value: "2.840+", icon: Tv, color: T.primary },
  { label: "Cidades cobertas", value: "38", icon: Globe, color: T.success },
  { label: "Impressoes/mes", value: "18,4M", icon: Eye, color: T.accent },
  { label: "CPM medio", value: "R$42", icon: DollarSign, color: T.warning },
  { label: "Trust Score", value: "97,3/100", icon: Shield, color: T.gold },
  { label: "Anunciantes ativos", value: "340+", icon: Users, color: T.success },
];

const TYPE_CFG = {
  pdf:   { icon: FileText, color: T.danger,  bg: T.danger  + "15", label: "PDF" },
  deck:  { icon: Package,  color: T.warning, bg: T.warning + "15", label: "Deck" },
  image: { icon: Image,    color: T.primary, bg: T.primary + "15", label: "Imagem" },
  video: { icon: Play,     color: T.accent,  bg: T.accent  + "15", label: "Video" },
};

export default function MediaKit({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"assets" | "stats" | "formats" | "cpm">("assets");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = (id: string) => { setDownloading(id); setTimeout(() => setDownloading(null), 1600); };

  const CPM_TABLE = [
    { segment: "Farmacias e clinicas", cpmMin: 38, cpmMax: 52, audience: "Saude, 30-60 anos" },
    { segment: "Academias", cpmMin: 36, cpmMax: 48, audience: "Fitness, 20-45 anos" },
    { segment: "Restaurantes", cpmMin: 34, cpmMax: 46, audience: "Geral, horario de refeicao" },
    { segment: "Varejo", cpmMin: 40, cpmMax: 58, audience: "Consumidor, 18-55 anos" },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
        <div><h1 className="font-bold text-lg">Media Kit</h1><p className="text-xs" style={{ color: T.textSub }}>Materiais comerciais para anunciantes</p></div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: copied ? T.success + "20" : T.border, color: copied ? T.success : T.textSub }}>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}{copied ? "Copiado!" : "Copiar link"}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80" style={{ background: T.primary, color: "#fff" }}>
            <Share2 size={14} /> Compartilhar
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-1 p-1 rounded-2xl mb-8" style={{ background: T.card }}>
          {(["assets", "stats", "formats", "cpm"] as const).map(id => (
            <button key={id} onClick={() => setTab(id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: tab === id ? T.primary : "transparent", color: tab === id ? "#fff" : T.textSub }}>
              {id === "assets" ? "Materiais" : id === "stats" ? "Audiencia" : id === "formats" ? "Formatos" : "Tabela CPM"}
            </button>
          ))}
        </div>
        {tab === "assets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSETS.map(a => { const cfg = TYPE_CFG[a.type]; const Icon = cfg.icon; const isLoading = downloading === a.id; return (
              <div key={a.id} className="p-5 rounded-2xl border flex items-start gap-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}><Icon size={20} style={{ color: cfg.color }} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-semibold text-sm leading-snug">{a.title}</p><span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></div>
                  <p className="text-xs mt-1" style={{ color: T.textSub }}>{a.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs" style={{ color: T.textSub }}><span>{a.size}</span><span><Download size={10} className="inline" /> {a.downloads.toLocaleString("pt-BR")}</span></div>
                    <button onClick={() => handleDownload(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: isLoading ? T.success + "20" : T.primary + "20", color: isLoading ? T.success : T.primary }}>
                      {isLoading ? <><CheckCircle size={12} /> Baixando...</> : <><Download size={12} /> Baixar</>}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
        {tab === "stats" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STATS.map(s => { const Icon = s.icon; return (
              <div key={s.label} className="p-6 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: s.color + "20" }}><Icon size={18} style={{ color: s.color }} /></div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: T.textSub }}>{s.label}</p>
              </div>
            )})}
          </div>
        )}
        {tab === "cpm" && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
            <div className="grid grid-cols-4 px-5 py-3 text-xs font-semibold" style={{ background: T.card, color: T.textSub }}>
              <span>Segmento</span><span>CPM min.</span><span>CPM max.</span><span>Audiencia</span>
            </div>
            {CPM_TABLE.map((row, i) => (
              <div key={i} className="grid grid-cols-4 px-5 py-4 text-sm border-t" style={{ background: i % 2 === 0 ? T.panel : T.card, borderColor: T.border }}>
                <span className="font-semibold">{row.segment}</span>
                <span style={{ color: T.success }}>R${row.cpmMin}</span>
                <span style={{ color: T.warning }}>R${row.cpmMax}</span>
                <span className="text-xs" style={{ color: T.textSub }}>{row.audience}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
