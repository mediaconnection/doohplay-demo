import { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, Clock, Download, ExternalLink, Hash, Database, Link2, Server, Globe, Activity } from "lucide-react";

const dark = { bg: "#020617", card: "#071225", border: "#13233E", sub: "#94A3B8" };

const blocks = [
  { number: 19284721, time: "14:32:01", txs: 847, size: "1.2 MB", root: "0x9b4c...f21a", hash: "0x7f3a...d4b2", anchored: true },
  { number: 19284720, time: "14:31:58", txs: 923, size: "1.4 MB", root: "0x3d8f...b09c", hash: "0x2c8e...f91a", anchored: true },
  { number: 19284719, time: "14:31:55", txs: 701, size: "1.1 MB", root: "0x7a2e...c34d", hash: "0x9b1d...a337", anchored: true },
  { number: 19284718, time: "14:31:51", txs: 1024, size: "1.6 MB", root: "0x1f5b...e87f", hash: "0x4e7f...c28b", anchored: false },
  { number: 19284717, time: "14:31:47", txs: 612, size: "0.9 MB", root: "0x6c9d...a12e", hash: "0x1b3c...e84a", anchored: true },
];

const events = [
  { tx: "0x7f3a...d4b2", screen: "SCR-00847", campaign: "Bradesco Black Friday", ts: "14:32:01", verified: true, cert: "CERT-2024-00847" },
  { tx: "0x2c8e...f91a", screen: "SCR-00123", campaign: "iFood Cupons", ts: "14:31:58", verified: true, cert: "CERT-2024-00123" },
  { tx: "0x9b1d...a337", screen: "SCR-00512", campaign: "Samsung Galaxy", ts: "14:31:55", verified: true, cert: "CERT-2024-00512" },
  { tx: "0x4e7f...c28b", screen: "SCR-00089", campaign: "Natura Perfumes", ts: "14:31:51", verified: false, cert: "—" },
  { tx: "0x1b3c...e84a", screen: "SCR-01024", campaign: "Ambev Verão", ts: "14:31:47", verified: true, cert: "CERT-2024-01024" },
];

interface BlockchainExplorerProps {
  onBack: () => void;
}

export default function BlockchainExplorer({ onBack }: BlockchainExplorerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<typeof events[0] | null>(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>ProofChain Explorer</h1>
            <p className="text-xs" style={{ color: dark.sub }}>Blockchain · Ethereum Mainnet · ICP Brasil</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
          <Activity size={11} className="animate-pulse" /> Sincronizado · Block #19284721
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl border" style={{ backgroundColor: dark.card, borderColor: dark.border }}>
            <Search size={16} style={{ color: dark.sub }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por TX hash, block hash, Screen ID ou Campaign ID..."
              className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-[#475569] font-mono"
            />
          </div>
          <button className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity flex items-center gap-2">
            <Search size={15} /> Verificar hash
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Último Merkle Root", value: "0x9b4c...f21a", icon: Hash, color: "#00A3FF" },
            { label: "Último Block Hash", value: "0x7f3a...d4b2", icon: Database, color: "#2563EB" },
            { label: "Última TX Hash", value: "0x9b1d...a337", icon: Link2, color: "#22C55E" },
            { label: "Network", value: "Ethereum", icon: Globe, color: "#FACC15" },
            { label: "Anchored Events", value: "2.847K", icon: Server, color: "#FF6B00" },
          ].map((c, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: dark.card, borderColor: dark.border }}>
              <c.icon size={14} style={{ color: c.color }} className="mb-2" />
              <p className="font-mono text-xs font-bold text-white truncate">{c.value}</p>
              <p className="text-[10px] mt-1" style={{ color: dark.sub }}>{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
            <div className="p-5 border-b" style={{ borderColor: dark.border }}>
              <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Últimos Blocos</h3>
            </div>
            <div className="divide-y" style={{ borderColor: dark.border }}>
              {blocks.map((b, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div style={{ color: b.anchored ? "#22C55E" : "#FACC15" }} className="mt-0.5 shrink-0">
                    {b.anchored ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-white">#{b.number}</span>
                      <span className="text-xs" style={{ color: dark.sub }}>{b.time}</span>
                    </div>
                    <p className="font-mono text-xs truncate" style={{ color: "#475569" }}>Hash: {b.hash}</p>
                    <p className="font-mono text-xs truncate" style={{ color: "#475569" }}>Merkle: {b.root}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-white">{b.txs} TXs</p>
                    <p className="text-xs" style={{ color: dark.sub }}>{b.size}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: b.anchored ? "#22C55E20" : "#FACC1520", color: b.anchored ? "#22C55E" : "#FACC15" }}>
                      {b.anchored ? "Ancorado" : "Processando"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
            <div className="p-5 border-b" style={{ borderColor: dark.border }}>
              <h3 className="font-semibold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Últimos Eventos</h3>
            </div>
            <div className="divide-y" style={{ borderColor: dark.border }}>
              {events.map((ev, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(selected?.tx === ev.tx ? null : ev)}
                  className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div style={{ color: ev.verified ? "#22C55E" : "#FACC15" }} className="mt-0.5 shrink-0">
                    {ev.verified ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold" style={{ color: "#00A3FF" }}>{ev.tx}</p>
                    <p className="text-xs text-white mt-0.5">{ev.screen} · {ev.campaign}</p>
                    <p className="text-xs mt-0.5" style={{ color: dark.sub }}>{ev.ts}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: ev.verified ? "#22C55E20" : "#FACC1520", color: ev.verified ? "#22C55E" : "#FACC15" }}>
                    {ev.verified ? "Verified" : "Pending"}
                  </span>
                </button>
              ))}
            </div>

            {selected && (
              <div className="border-t p-5" style={{ borderColor: dark.border, background: "#060A15" }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">Detalhes do evento</h4>
                  <button onClick={() => setSelected(null)} className="text-xs" style={{ color: dark.sub }}>Fechar</button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "TX Hash", value: selected.tx },
                    { label: "Screen ID", value: selected.screen },
                    { label: "Campaign ID", value: selected.campaign },
                    { label: "Timestamp", value: selected.ts },
                    { label: "Certificate", value: selected.cert },
                    { label: "Status", value: selected.verified ? "✓ Verificado" : "⏳ Pendente" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: dark.border }}>
                      <span style={{ color: dark.sub }}>{item.label}</span>
                      <span className="font-mono text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-[#00A3FF] hover:opacity-90 flex items-center justify-center gap-1">
                    <Download size={12} /> Baixar certificado
                  </button>
                  <button className="px-3 py-2 rounded-lg text-xs border" style={{ color: dark.sub, borderColor: dark.border }}>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
          <h3 className="font-semibold text-white mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Anchoring Status — ICP Brasil</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { layer: "ICP Brasil", status: "Ativo", color: "#22C55E" },
              { layer: "Signature", status: "Válida", color: "#22C55E" },
              { layer: "Merkle Tree", status: "Sincronizado", color: "#22C55E" },
              { layer: "Blockchain", status: "Ancorado", color: "#22C55E" },
              { layer: "Timestamp", status: "Verificado", color: "#22C55E" },
              { layer: "Certificate", status: "Emitido", color: "#22C55E" },
              { layer: "Network", status: "Ethereum", color: "#00A3FF" },
              { layer: "Compliance", status: "LGPD ✓", color: "#FACC15" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: dark.bg }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                <div>
                  <p className="text-xs font-medium text-white">{l.layer}</p>
                  <p className="text-[10px]" style={{ color: l.color }}>{l.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
