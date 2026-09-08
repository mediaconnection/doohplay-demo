import { useState } from "react";
import { ArrowLeft, Award, TrendingUp, Star, Crown, Medal, Shield, Zap, DollarSign, Eye, ChevronRight, Users } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
  silver: "#C0C0C0", bronze: "#CD7F32",
};

type Category = "revenue" | "impressions" | "fill" | "growth";
type Scope = "national" | "city" | "segment";

interface Owner {
  id: string;
  name: string;
  business: string;
  city: string;
  segment: string;
  avatar: string;
  screens: number;
  revenue: number;
  impressions: number;
  fillRate: number;
  growth: number;
  badges: string[];
  proofChain: boolean;
  isMe?: boolean;
  rank: number;
  rankChange: number;
}

const OWNERS: Owner[] = [
  { id: "o1",  name: "Fernanda Lima",    business: "Academia FitSpace",    city: "São Paulo", segment: "Academia",    avatar: "F", screens: 4, revenue: 4820, impressions: 98400, fillRate: 97, growth: 34, badges: ["👑","🔐","⚡"], proofChain: true,  rank: 1,  rankChange: 0  },
  { id: "o2",  name: "Paulo Melo",       business: "Restaurante Gourmet",  city: "São Paulo", segment: "Restaurante", avatar: "P", screens: 6, revenue: 4210, impressions: 87200, fillRate: 94, growth: 28, badges: ["🥈","🔐"],      proofChain: true,  rank: 2,  rankChange: 1  },
  { id: "o3",  name: "Beatriz Santos",   business: "Clínica Bella",        city: "São Paulo", segment: "Clínica",     avatar: "B", screens: 3, revenue: 3980, impressions: 62100, fillRate: 91, growth: 41, badges: ["🥉","⚡"],       proofChain: false, rank: 3,  rankChange: -1 },
  { id: "o4",  name: "Carlos Zimerman",  business: "Barbearia Zimerman",   city: "São Paulo", segment: "Barbearia",   avatar: "C", screens: 1, revenue: 1240, impressions: 14400, fillRate: 82, growth: 18, badges: ["🎯"],            proofChain: true,  rank: 4,  rankChange: 2, isMe: true },
  { id: "o5",  name: "Luisa Fernandes",  business: "Salão Luxe",           city: "São Paulo", segment: "Salão",       avatar: "L", screens: 2, revenue: 2340, impressions: 41200, fillRate: 89, growth: 22, badges: ["🌟"],            proofChain: true,  rank: 5,  rankChange: 0  },
  { id: "o6",  name: "Ricardo Alves",    business: "Loja de Esportes",     city: "São Paulo", segment: "Varejo",      avatar: "R", screens: 3, revenue: 2180, impressions: 38700, fillRate: 86, growth: 15, badges: [],               proofChain: false, rank: 6,  rankChange: -2 },
  { id: "o7",  name: "Ana Costa",        business: "Farmácia AnaVida",     city: "São Paulo", segment: "Farmácia",    avatar: "A", screens: 2, revenue: 1980, impressions: 31400, fillRate: 88, growth: 31, badges: ["⚡"],            proofChain: true,  rank: 7,  rankChange: 3  },
  { id: "o8",  name: "Marcos Pereira",   business: "Pet Shop VetAmigo",    city: "São Paulo", segment: "Pet",         avatar: "M", screens: 1, revenue: 1640, impressions: 22800, fillRate: 79, growth: 12, badges: [],               proofChain: false, rank: 8,  rankChange: -1 },
  { id: "o9",  name: "Juliana Torres",   business: "Studio de Dança",      city: "São Paulo", segment: "Academia",    avatar: "J", screens: 2, revenue: 1520, impressions: 28900, fillRate: 84, growth: 27, badges: ["🎯"],            proofChain: true,  rank: 9,  rankChange: 1  },
  { id: "o10", name: "Thiago Carvalho",  business: "Hamburgueria Craft",   city: "São Paulo", segment: "Restaurante", avatar: "T", screens: 1, revenue: 1380, impressions: 19600, fillRate: 77, growth: 9,  badges: [],               proofChain: false, rank: 10, rankChange: 0  },
];

const BADGE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  "👑": { label: "Líder Geral",      desc: "Top 1 da rede",              color: T.gold    },
  "🥈": { label: "Vice-líder",       desc: "Top 2 da rede",              color: T.silver  },
  "🥉": { label: "Top 3",            desc: "Top 3 da rede",              color: T.bronze  },
  "🔐": { label: "ProofChain",       desc: "100% verificado",            color: T.success },
  "⚡": { label: "Crescimento",      desc: "+30% em 30 dias",            color: T.primary },
  "🌟": { label: "Consistência",     desc: "Fill rate >90% por 3 meses", color: T.warning },
  "🎯": { label: "Meta Atingida",    desc: "Meta mensal superada",       color: T.accent  },
};

const CATEGORY_CONFIG: Record<Category, { label: string; key: keyof Owner; format: (v: number) => string; color: string }> = {
  revenue:     { label: "Receita",      key: "revenue",     format: v => `R$${v.toLocaleString("pt-BR")}`, color: T.success },
  impressions: { label: "Impressões",   key: "impressions", format: v => `${(v / 1000).toFixed(1)}K`,      color: T.primary },
  fill:        { label: "Fill Rate",    key: "fillRate",    format: v => `${v}%`,                           color: T.accent  },
  growth:      { label: "Crescimento",  key: "growth",      format: v => `+${v}%`,                         color: T.warning },
};

const MY_BADGES = [
  { icon: "🎯", label: "Meta Atingida",    earned: true  },
  { icon: "🔐", label: "ProofChain",       earned: true  },
  { icon: "⚡", label: "Crescimento",      earned: false, progress: 60, target: "+30%" },
  { icon: "🌟", label: "Consistência",     earned: false, progress: 33, target: "3 meses" },
  { icon: "👑", label: "Líder Geral",      earned: false, progress: 26, target: "Top 1" },
];

const MEDALS = [
  { rank: 1, color: T.gold,   shadow: "rgba(255,215,0,0.4)",   icon: Crown  },
  { rank: 2, color: T.silver, shadow: "rgba(192,192,192,0.4)", icon: Medal  },
  { rank: 3, color: T.bronze, shadow: "rgba(205,127,50,0.4)",  icon: Award  },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS.find(m => m.rank === rank);
  if (medal) {
    const Icon = medal.icon;
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: medal.color + "20", boxShadow: `0 0 8px ${medal.shadow}` }}>
        <Icon size={16} style={{ color: medal.color }} />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center"
      style={{ background: T.panel, border: `1px solid ${T.border}` }}>
      <span className="text-xs font-black" style={{ color: T.textSub }}>{rank}</span>
    </div>
  );
}

export default function LeaderboardRanking({ onBack, onNavigate }: Props) {
  const [category, setCategory] = useState<Category>("revenue");
  const [scope, setScope] = useState<Scope>("city");
  const [showMyBadges, setShowMyBadges] = useState(false);

  const cfg = CATEGORY_CONFIG[category];
  const me = OWNERS.find(o => o.isMe)!;

  const sorted = [...OWNERS].sort((a, b) => (b[cfg.key] as number) - (a[cfg.key] as number)).map((o, i) => ({ ...o, displayRank: i + 1 }));
  const myDisplayRank = sorted.findIndex(o => o.isMe) + 1;

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Crown size={18} style={{ color: T.gold }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Ranking DOOHPLAY</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Julho 2026 · {OWNERS.length} proprietários</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-black text-sm" style={{ color: T.gold }}>#{myDisplayRank}</div>
            <div className="text-xs" style={{ color: T.textSub }}>sua posição</div>
          </div>
        </div>

        {/* Scope tabs */}
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["city", "national", "segment"] as const).map(s => (
            <button key={s} onClick={() => setScope(s)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: scope === s ? T.primary : "transparent", color: scope === s ? T.primary : T.textSub }}>
              {s === "city" ? "São Paulo" : s === "national" ? "Nacional" : "Barbearias"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

        {/* Category pills */}
        <div className="flex gap-2">
          {(Object.entries(CATEGORY_CONFIG) as [Category, typeof cfg][]).map(([k, v]) => (
            <button key={k} onClick={() => setCategory(k)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: category === k ? v.color + "20" : T.card,
                color: category === k ? v.color : T.textSub,
                border: `1px solid ${category === k ? v.color + "40" : T.border}`,
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Podium top 3 */}
        <div className="flex items-end justify-center gap-4 pt-4 pb-2">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="text-2xl">{top3[1]?.badges[0] ?? "🥈"}</div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl"
              style={{ background: T.silver + "20", border: `2px solid ${T.silver}40`, color: T.silver }}>
              {top3[1]?.avatar}
            </div>
            <div className="text-center">
              <div className="font-bold text-xs">{top3[1]?.name.split(" ")[0]}</div>
              <div className="text-xs font-black" style={{ color: T.silver }}>{cfg.format(top3[1]?.[cfg.key] as number ?? 0)}</div>
            </div>
            <div className="w-full rounded-t-xl pt-5 text-center"
              style={{ background: `linear-gradient(to top, ${T.silver}15, transparent)`, border: `1px solid ${T.silver}20` }}>
              <span style={{ color: T.silver }} className="font-black text-lg">#2</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2 flex-1 -mb-2">
            <div className="text-3xl animate-bounce">👑</div>
            <div className="w-18 h-18 rounded-2xl flex items-center justify-center font-black text-2xl"
              style={{ width: 72, height: 72, background: T.gold + "20", border: `2px solid ${T.gold}60`, color: T.gold, boxShadow: `0 0 20px ${T.gold}30` }}>
              {top3[0]?.avatar}
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">{top3[0]?.name.split(" ")[0]}</div>
              <div className="text-sm font-black" style={{ color: T.gold }}>{cfg.format(top3[0]?.[cfg.key] as number ?? 0)}</div>
            </div>
            <div className="w-full rounded-t-xl pt-7 text-center"
              style={{ background: `linear-gradient(to top, ${T.gold}20, transparent)`, border: `1px solid ${T.gold}30` }}>
              <span style={{ color: T.gold }} className="font-black text-xl">#1</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="text-2xl">{top3[2]?.badges[0] ?? "🥉"}</div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl"
              style={{ background: T.bronze + "20", border: `2px solid ${T.bronze}40`, color: T.bronze }}>
              {top3[2]?.avatar}
            </div>
            <div className="text-center">
              <div className="font-bold text-xs">{top3[2]?.name.split(" ")[0]}</div>
              <div className="text-xs font-black" style={{ color: T.bronze }}>{cfg.format(top3[2]?.[cfg.key] as number ?? 0)}</div>
            </div>
            <div className="w-full rounded-t-xl pt-4 text-center"
              style={{ background: `linear-gradient(to top, ${T.bronze}15, transparent)`, border: `1px solid ${T.bronze}20` }}>
              <span style={{ color: T.bronze }} className="font-black">#3</span>
            </div>
          </div>
        </div>

        {/* My position card (if not top 3) */}
        {myDisplayRank > 3 && (
          <div className="rounded-2xl border p-4" style={{ background: T.primary + "10", borderColor: T.primary + "30" }}>
            <div className="flex items-center gap-3">
              <RankBadge rank={myDisplayRank} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                style={{ background: T.primary + "20", color: T.primary }}>
                {me.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Você — {me.business}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.primary + "20", color: T.primary }}>Você</span>
                </div>
                <div className="text-xs" style={{ color: T.textSub }}>
                  {cfg.format(me[cfg.key] as number)} · {myDisplayRank - 1 > 0 ? `${myDisplayRank - 1} posições para subir` : "no topo!"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-xl" style={{ color: T.primary }}>#{myDisplayRank}</div>
                <div className="text-xs" style={{ color: me.rankChange > 0 ? T.success : me.rankChange < 0 ? T.danger : T.textSub }}>
                  {me.rankChange > 0 ? `▲ ${me.rankChange}` : me.rankChange < 0 ? `▼ ${Math.abs(me.rankChange)}` : "—"}
                </div>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ background: T.panel, color: T.textSub }}>
              💡 Para subir para #3 você precisa de <strong className="text-white">+R${(sorted[2][cfg.key] as number - (me[cfg.key] as number)).toLocaleString("pt-BR")}</strong> em {cfg.label.toLowerCase()}
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm" style={{ color: T.textSub }}>Classificação completa</h3>
          {rest.map((owner) => {
            const isMe = owner.isMe;
            return (
              <div key={owner.id} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                style={{ background: isMe ? T.primary + "08" : T.card, borderColor: isMe ? T.primary + "30" : T.border }}>
                <RankBadge rank={owner.displayRank} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: isMe ? T.primary + "25" : T.panel, color: isMe ? T.primary : T.textSub }}>
                  {owner.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{owner.name}</span>
                    {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.primary + "20", color: T.primary }}>Você</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                    <span>{owner.business}</span>
                    {owner.badges.slice(0, 3).map((b, i) => <span key={i}>{b}</span>)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-sm" style={{ color: cfg.color }}>{cfg.format(owner[cfg.key] as number)}</div>
                  <div className="text-xs" style={{ color: owner.rankChange > 0 ? T.success : owner.rankChange < 0 ? T.danger : T.textSub }}>
                    {owner.rankChange > 0 ? `▲${owner.rankChange}` : owner.rankChange < 0 ? `▼${Math.abs(owner.rankChange)}` : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My badges */}
        <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Suas conquistas</h3>
            <span className="text-xs" style={{ color: T.textSub }}>
              {MY_BADGES.filter(b => b.earned).length}/{MY_BADGES.length} conquistadas
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {MY_BADGES.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all"
                  style={{
                    background: b.earned ? T.gold + "15" : T.panel,
                    border: `2px solid ${b.earned ? T.gold + "40" : T.border}`,
                    filter: b.earned ? "none" : "grayscale(1) opacity(0.4)",
                  }}>
                  {b.icon}
                </div>
                <span className="text-xs text-center leading-tight" style={{ color: b.earned ? T.text : T.textSub, fontSize: 9 }}>
                  {b.label}
                </span>
                {!b.earned && b.progress && (
                  <div className="w-full">
                    <div className="h-1 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full" style={{ width: `${b.progress}%`, background: T.primary }} />
                    </div>
                    <div className="text-center" style={{ fontSize: 8, color: T.textSub }}>{b.progress}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border p-5 text-center" style={{ background: `linear-gradient(135deg, ${T.gold}08, ${T.card})`, borderColor: T.gold + "20" }}>
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="font-bold mb-1">Suba no ranking!</h3>
          <p className="text-sm mb-3" style={{ color: T.textSub }}>
            Otimize sua receita e conquiste os badges que faltam para chegar ao top 3.
          </p>
          <button onClick={() => onNavigate?.("revenue-optimizer")}
            className="px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
            Ver Otimizador de Receita
          </button>
        </div>
      </div>
    </div>
  );
}
