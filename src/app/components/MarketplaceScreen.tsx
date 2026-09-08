import { useState } from "react";
import { ArrowLeft, Store, Search, Star, MapPin, Monitor, DollarSign, Heart, Eye, CheckCircle, ShoppingCart } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "explore" | "cart" | "orders";

interface Listing {
  id: string; name: string; publisher: string; city: string; state: string;
  type: string; cpm: number; minBudget: number; dailyImpressions: number;
  rating: number; reviews: number; availability: number; featured: boolean; tags: string[];
}

const LISTINGS: Listing[] = [
  { id: "L001", name: "Av. Paulista 1000 - Billboard Premium", publisher: "OOH SP", city: "Sao Paulo", state: "SP", cpm: 68, minBudget: 8000, dailyImpressions: 54000, rating: 4.9, reviews: 142, availability: 22, featured: true, tags: ["premium"] },
  { id: "L002", name: "Aeroporto GRU - Terminal 2", publisher: "AereoMidia", city: "Guarulhos", state: "SP", cpm: 88, minBudget: 12000, dailyImpressions: 18000, rating: 4.8, reviews: 89, availability: 40, featured: true, tags: ["aeroporto"] },
  { id: "L003", name: "Shopping Iguatemi", publisher: "Mall Midia", city: "Sao Paulo", state: "SP", cpm: 52, minBudget: 5000, dailyImpressions: 22000, rating: 4.7, reviews: 204, availability: 15, featured: false, tags: ["shopping"] },
];

const CPM_DIST = [
  { range: "R$20-30", count: 4 }, { range: "R$30-50", count: 12 },
  { range: "R$50-70", count: 8 }, { range: "R$70-90", count: 5 }, { range: "R$90+", count: 2 },
];

const ORDERS = [
  { id: "ORD001", screen: "Av. Paulista 1000", publisher: "OOH SP", budget: 12000, status: "active", startDate: "01/07", endDate: "31/07", impressions: 1188000 },
];

const ORDER_STATUS = { active: { label: "Ativo", color: T.success }, completed: { label: "Encerrado", color: T.textSub }, pending: { label: "Pendente", color: T.warning } };

export default function MarketplaceScreen({ onBack }: Props) {
  const [tab, setTab] = useState<TabId>("explore");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(["L002"]);

  const toggleCart = (id: string) => setCart(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleFav  = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filtered = LISTINGS.filter(l => search === "" || l.name.toLowerCase().includes(search.toLowerCase()));
  const cartItems = LISTINGS.filter(l => cart.includes(l.id));
  const cartTotal = cartItems.reduce((s, l) => s + l.minBudget, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}><Store size={18} style={{ color: T.gold }} /></div>
              <div><h1 className="font-black text-lg">Marketplace de Telas</h1><p className="text-xs" style={{ color: T.textSub }}>Compre espaco publicitario de publishers verificados</p></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button onClick={() => setTab("cart")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black relative" style={{ background: T.gold + "20", color: T.gold }}>
                <ShoppingCart size={14} /> Carrinho
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center" style={{ background: T.danger, color: "#fff" }}>{cart.length}</span>
              </button>
            )}
            {(["explore", "cart", "orders"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub }}>
                {t === "explore" ? "Explorar" : t === "cart" ? "Carrinho" : "Pedidos"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {tab === "explore" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <Search size={16} style={{ color: T.textSub }} />
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.text }} />
            </div>
            <div className="space-y-2">
              {filtered.map(l => (
                <div key={l.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.primary + "20" }}><Monitor size={16} style={{ color: T.primary }} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm">{l.name}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{l.publisher} - {l.city}/{l.state} - {l.reviews} avaliacoes</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><div className="font-black" style={{ color: T.gold }}>R${l.cpm}</div><div className="text-xs" style={{ color: T.textSub }}>CPM</div></div>
                      <button onClick={() => toggleFav(l.id)} className="p-2 rounded-lg hover:bg-white/5"><Heart size={14} style={{ color: favorites.includes(l.id) ? T.danger : T.textSub }} /></button>
                      <button onClick={() => toggleCart(l.id)} className="px-4 py-2 rounded-xl text-xs font-black" style={{ background: cart.includes(l.id) ? T.success + "20" : T.primary + "20", color: cart.includes(l.id) ? T.success : T.primary }}>{cart.includes(l.id) ? "Adicionado" : "+ Carrinho"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "cart" && (
          <div>
            <h2 className="font-black mb-4">Carrinho de Compras</h2>
            {cartItems.length === 0 ? <div className="p-12 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}><div className="font-black" style={{ color: T.textSub }}>Carrinho vazio</div></div> : cartItems.map(l => (
              <div key={l.id} className="p-4 rounded-2xl border mb-2" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-4">
                  <div className="flex-1"><div className="font-black text-sm">{l.name}</div><div className="text-xs" style={{ color: T.textSub }}>{l.city}</div></div>
                  <div className="font-black" style={{ color: T.gold }}>R${l.minBudget.toLocaleString("pt-BR")}</div>
                  <button onClick={() => toggleCart(l.id)}><span className="text-xs font-bold" style={{ color: T.danger }}>Remover</span></button>
                </div>
              </div>
            ))}
            {cartItems.length > 0 && <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}><div className="flex justify-between mb-3"><span>Total</span><span className="font-black" style={{ color: T.gold }}>R${cartTotal.toLocaleString("pt-BR")}</span></div><button className="w-full py-3 rounded-xl text-sm font-black" style={{ background: T.gold, color: "#000" }}>Finalizar Pedido</button></div>}
          </div>
        )}
        {tab === "orders" && (
          <div>
            <h2 className="font-black mb-4">Meus Pedidos</h2>
            {ORDERS.map(o => { const sm = ORDER_STATUS[o.status as keyof typeof ORDER_STATUS]; return (
              <div key={o.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sm.color + "20" }}><CheckCircle size={16} style={{ color: sm.color }} /></div>
                  <div className="flex-1"><div className="flex items-center gap-2"><span className="font-black">{o.screen}</span><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span></div><div className="text-xs" style={{ color: T.textSub }}>{o.publisher} - {o.startDate} - {o.endDate}</div></div>
                  <div className="font-black" style={{ color: T.gold }}>R${o.budget.toLocaleString("pt-BR")}</div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
