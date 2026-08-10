import { useState } from "react";
import {
  ArrowLeft, Database, Hash, Link2, CheckCircle2, Clock, Activity,
  Server, Globe, Shield, RefreshCw, ExternalLink, Copy, ChevronRight,
  Layers, Lock, TrendingUp, AlertCircle
} from "lucide-react";

const v = {
  bg: "#020817", card: "#071126", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", sub: "#94A3B8", muted: "#475569",
  primary: "#2563EB", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
};

interface Props { onBack: () => void; }

const blocks = [
  { block: "19284721", time: "14:32:01", txs: 847, size: "1.24 MB", root: "0x9b4c...f21a", anchored: true, gas: "42.1 Gwei" },
  { block: "19284720", time: "14:31:58", txs: 923, size: "1.41 MB", root: "0x3d8f...b09c", anchored: true, gas: "40.8 Gwei" },
  { block: "19284719", time: "14:31:55", txs: 701, size: "1.08 MB", root: "0x7a2e...c34d", anchored: true, gas: "38.5 Gwei" },
  { block: "19284718", time: "14:31:51", txs: 1024, size: "1.58 MB", root: "0x1f5b...e87f", anchored: false, gas: "44.2 Gwei" },
  { block: "19284717", time: "14:31:48", txs: 812, size: "1.25 MB", root: "0x6c9d...a12b", anchored: true, gas: "41.7 Gwei" },
];

const merkleRoots = [
  { root: "0x9b4c...f21a", proofs: 847, campaign: "Samsung Q4", verified: true, time: "14:32:01" },
  { root: "0x3d8f...b09c", proofs: 923, campaign: "Bradesco Black", verified: true, time: "14:31:58" },
  { root: "0x7a2e...c34d", proofs: 701, campaign: "iFood SP", verified: true, time: "14:31:55" },
  { root: "0x6c9d...a12b", proofs: 812, campaign: "Natura Natal", verified: true, time: "14:31:48" },
];

const anchorings = [
  { tx: "0x7f3a...d4b2", block: 19284721, chain: "Ethereum", timestamp: "14:32:01", proofs: 847, status: "confirmed" },
  { tx: "0x2c8e...f91a", block: 19284720, chain: "Ethereum", timestamp: "14:31:58", proofs: 923, status: "confirmed" },
  { tx: "0x9b1d...a337", block: 19284719, chain: "Polygon", timestamp: "14:31:55", proofs: 701, status: "confirmed" },
  { tx: "0x4e7f...c28b", block: 19284718, chain: "Ethereum", timestamp: "14:31:51", proofs: 1024, status: "pending" },
];

const chains = [
  { name: "Ethereum Mainnet", status: "operational", blockTime: "12.1s", tps: "14.2", gasPrice: "42 Gwei", lastBlock: "19,284,721", color: "#8B5CF6", icon: "Ξ" },
  { name: "Polygon PoS", status: "operational", blockTime: "2.3s", tps: "142", gasPrice: "180 Gwei", lastBlock: "51,284,293", color: "#8B5CF6", icon: "⬡" },
  { name: "ICP Brasil", status: "operational", blockTime: "~1s", tps: "500+", gasPrice: "N/A", lastBlock: "8,124,441", color: "#22C55E", icon: "🔒" },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] ${className}`}
      style={{ background: v.card, border: `1px solid ${v.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
      {children}
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? "bg-[#22C55E] animate-pulse" : "bg-[#EF4444]"}`} />;
}

export default function BlockchainCenter({ onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: v.bg, fontFamily: "'Inter', sans-serif" }}>
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
        style={{ borderColor: v.border, background: `${v.bg}e0` }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: v.sub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="w-px h-5" style={{ background: v.border }} />
          <div>
            <p className="text-xs font-medium" style={{ color: v.sub }}>DOOHPLAY</p>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Blockchain Center</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#22C55E15", color: "#22C55E", border: "1px solid #22C55E30" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> SYNCED
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: v.sub }}>
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: "3s" }} /> Live
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chains.map((chain, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${chain.color}20`, border: `1px solid ${chain.color}40` }}>
                    {chain.icon}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{chain.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StatusDot ok={chain.status === "operational"} />
                      <span className="text-[11px] capitalize" style={{ color: v.success }}>{chain.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "Block Time", val: chain.blockTime },
                  { l: "TPS", val: chain.tps },
                  { l: "Gas", val: chain.gasPrice },
                  { l: "Bloco atual", val: chain.lastBlock },
                ].map((s, j) => (
                  <div key={j} className="rounded-xl p-2" style={{ background: "#020817" }}>
                    <p className="text-[10px]" style={{ color: v.muted }}>{s.l}</p>
                    <p className="font-mono text-xs font-bold" style={{ color: chain.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de provas", value: "4.8M", icon: Hash, color: "#8B5CF6" },
            { label: "Blocos ancorados", value: "19.284", icon: Layers, color: v.primary },
            { label: "Merkle Roots", value: "2.847", icon: Database, color: v.success },
            { label: "Sync Rate", value: "100%", icon: Activity, color: v.success },
          ].map((s, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}20` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: v.sub }}>{s.label}</p>
                <p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Últimos Blocos</h2>
                <p className="text-xs" style={{ color: v.sub }}>Ethereum Mainnet · atualizando ao vivo</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: v.success }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: v.border }}>
              {blocks.map((b, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelected(b.block === selected ? null : b.block)}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: b.anchored ? "#22C55E15" : "#F59E0B15" }}>
                    <Layers size={14} style={{ color: b.anchored ? v.success : v.warning }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">#{b.block}</span>
                      {b.anchored && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#22C55E15", color: v.success }}>Ancorado</span>}
                    </div>
                    <p className="text-[11px] font-mono" style={{ color: v.muted }}>{b.root}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">{b.txs} TXs</p>
                    <p className="text-[10px]" style={{ color: v.muted }}>{b.time} · {b.size}</p>
                  </div>
                  {b.block === selected && <ChevronRight size={14} style={{ color: v.primary }} />}
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ancoragens ProofChain</h2>
                <p className="text-xs" style={{ color: v.sub }}>Transações de prova na blockchain</p>
              </div>
              <Link2 size={15} style={{ color: v.sub }} />
            </div>
            <div className="divide-y" style={{ borderColor: v.border }}>
              {anchorings.map((a, i) => (
                <div key={i} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{a.tx}</span>
                      <button onClick={() => copy(a.tx)} className="opacity-40 hover:opacity-100 transition-opacity">
                        <Copy size={11} style={{ color: copied === a.tx ? v.success : v.sub }} />
                      </button>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.status === "confirmed" ? "text-[#22C55E]" : "text-[#F59E0B]"}`}
                      style={{ background: a.status === "confirmed" ? "#22C55E15" : "#F59E0B15" }}>
                      {a.status === "confirmed" ? "✓ Confirmado" : "⏳ Pendente"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]" style={{ color: v.muted }}>
                    <span>Block #{a.block}</span>
                    <span style={{ color: "#8B5CF6" }}>{a.chain}</span>
                    <span>{a.proofs} provas</span>
                    <span>{a.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Merkle Roots Recentes</h2>
              <p className="text-xs" style={{ color: v.sub }}>Raízes de árvore Merkle geradas por campanha</p>
            </div>
            <Shield size={15} style={{ color: v.sub }} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${v.border}` }}>
                  {["Merkle Root", "Campanha", "Provas", "Status", "Timestamp"].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: v.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: v.border }}>
                {merkleRoots.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white">{r.root}</span>
                        <button onClick={() => copy(r.root)} className="opacity-40 hover:opacity-100 transition-opacity">
                          <Copy size={10} style={{ color: v.sub }} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: v.sub }}>{r.campaign}</td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: "#8B5CF6" }}>{r.proofs.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: v.success }}>
                        <CheckCircle2 size={12} /> Verificado
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]" style={{ color: v.muted }}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
