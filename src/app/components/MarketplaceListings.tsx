import { useState } from "react";
import { ArrowLeft, MapPin, Eye, DollarSign, Star, Search, Shield, Package, Radio, BarChart2, Plus, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ViewMode = "browse" | "my-listings" | "proposals" | "detail";

interface Screen {
  id: string; name: string; owner: string; location: string; city: string;
  type: string; size: string; dailyImpressions: number; cpm: number;
  monthlyRevenue: number; rating: number; reviews: number; tags: string[];
  online: boolean; proofChain: boolean; fillRate: number; photo: string;
  mine?: boolean; proposals?: number;
}

const SCREENS: Screen[] = [
  { id: "s1", name: "Barbearia Zimerman", owner: "Carlos Zimerman", location: "Pinheiros, SP", city: "Sao Paulo", type: "Barbearia", size: "55\"", dailyImpressions: 480, cpm: 42, monthlyRevenue: 1240, rating: 4.9, reviews: 23, fillRate: 94, tags: ["Masculino 25-45", "Classe B"], online: true, proofChain: true, photo: "photo-1503951914875-452162b0f3f1", mine: true, proposals: 3 },
  { id: "s2", name: "Academia FitSpace", owner: "Fernanda Lima", location: "Itaim Bibi, SP", city: "Sao Paulo", type: "Academia", size: "65\"", dailyImpressions: 820, cpm: 55, monthlyRevenue: 2380, rating: 4.8, reviews: 41, fillRate: 91, tags: ["Fitness", "18-40 anos"], online: true, proofChain: true, photo: "photo-1534438327276-14e5300c3a48", mine: false },
];

interface Props { onBack: () => void; onNavigate?: (view: string) => void; session?: { name?: string } | null; }

export default function MarketplaceListings({ onBack, onNavigate, session }: Props) {
  const [mode, setMode] = useState<ViewMode>("browse");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Screen | null>(null);

  const filtered = SCREENS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
              <Package size={18} style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Marketplace de Telas</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{SCREENS.filter(s => s.online).length} telas ativas</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por local, tipo..." className="w-full pl-10 pr-4 py-3 rounded-xl text-sm" style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
        </div>
        <div className="space-y-3">
          {filtered.map(screen => (
            <div key={screen.id} className="w-full text-left rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex gap-0">
                <div className="w-28 h-28 flex-shrink-0 relative">
                  <img src={`https://images.unsplash.com/${screen.photo}?w=200&h=200&fit=crop&auto=format`} alt={screen.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-3 min-w-0">
                  <div className="font-bold text-sm truncate">{screen.name}</div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: T.textSub }}><MapPin size={10} />{screen.location}</div>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span style={{ color: T.textSub }}><Eye size={10} className="inline" /> {screen.dailyImpressions}/dia</span>
                    <span style={{ color: T.success }}>CPM R${screen.cpm}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
