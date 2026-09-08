import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Shield, CheckCircle, Link, FileText, Globe, Clock, Hash, Eye, Download, RefreshCw, ChevronRight, Lock, Cpu } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  text: "#ECF0FF", textSub: "#4A5280",
};

function randHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function genProof() {
  const ts = new Date();
  const hash = "0x" + randHex(64);
  return {
    id: "POP-" + randHex(8).toUpperCase(),
    timestamp: ts.toISOString(),
    screen: ["SCR-" + randHex(4).toUpperCase(), "SCR-" + randHex(4).toUpperCase(), "SCR-" + randHex(4).toUpperCase()][Math.floor(Math.random() * 3)],
    content: ["Campanha Verão", "Promoção Final", "Spot Institucional", "Banner Outlet"][Math.floor(Math.random() * 4)],
    rsaHash: "sha256:" + randHex(64),
    merkleRoot: "0x" + randHex(64),
    polygonTx: "0x" + randHex(64),
    tsaToken: randHex(40) + ".rfc3161",
    score: 100,
    duration: Math.floor(Math.random() * 20) + 5,
  };
}

const LAYERS = [
  {
    id: "rsa",
    title: "Assinatura RSA-SHA256",
    subtitle: "Camada 1 — Integridade",
    icon: Lock,
    color: T.success,
    description: "Cada exibição é assinada digitalmente com par de chaves RSA-2048. A assinatura garante que o hash não pode ser forjado ou alterado retroativamente.",
    detail: "SHA256 do payload de exibição + timestamp + ID da tela, assinado com a chave privada do servidor DOOHPLAY.",
  },
  {
    id: "merkle",
    title: "Árvore Merkle",
    subtitle: "Camada 2 — Agregação",
    icon: Hash,
    color: T.primary,
    description: "Grupos de provas são agregados em árvores Merkle binárias. O nó raiz representa de forma compacta e verificável todo o conjunto de exibições daquele lote.",
    detail: "Lotes de 256 provas → árvore de altura 8 → root hash gravado on-chain. Qualquer prova pode ser verificada contra o root com apenas 8 hashes.",
  },
  {
    id: "polygon",
    title: "Polygon Mainnet",
    subtitle: "Camada 3 — Imutabilidade",
    icon: Globe,
    color: T.accent,
    description: "O Merkle root de cada lote é gravado na Polygon Mainnet via contrato inteligente auditado. Uma vez na blockchain, o registro é imutável e acessível globalmente.",
    detail: "Contrato: 0x4D7F...A3B9 · Rede: Polygon PoS · Finalização: ~2 segundos · Custo médio: < $0,001/lote",
  },
  {
    id: "tsa",
    title: "Timestamp TSA RFC3161",
    subtitle: "Camada 4 — Validade jurídica",
    icon: Clock,
    color: T.warning,
    description: "Autoridade de carimbo de tempo (TSA) acreditada pelo ITI/ICP-Brasil emite token RFC3161 para cada prova. Isso confere validade jurídica plena no Brasil.",
    detail: "TSA: Certisign RA · Padrão: RFC 3161 · ICP-Brasil homologado · Equivale a autenticação em cartório para fins jurídicos.",
  },
];

interface Props { onBack: () => void; }

export default function ProofChainCenter({ onBack }: Props) {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [proofs, setProofs] = useState(() => Array.from({ length: 12 }, genProof));
  const [generating, setGenerating] = useState(false);
  const [selectedProof, setSelectedProof] = useState<ReturnType<typeof genProof> | null>(null);
  const [score] = useState(100);
  const [liveCount, setLiveCount] = useState(18_432);
  const [verified, setVerified] = useState(0);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const newProof = genProof();
      setProofs(prev => [newProof, ...prev.slice(0, 23)]);
      if (streamRef.current) {
        streamRef.current.scrollTop = 0;
      }
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setVerified(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setVerified(step);
      if (step >= 4) {
        clearInterval(iv);
        setGenerating(false);
        setProofs(prev => [genProof(), ...prev.slice(0, 23)]);
      }
    }, 700);
  };

  const layer = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: T.success }} />
            <span className="font-bold">ProofChain Center</span>
          </div>
          <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: T.success + "40", color: T.success }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
            Score 100/100
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Provas emitidas", value: liveCount.toLocaleString("pt-BR"), color: T.success, icon: Shield },
            { label: "Score de confiança", value: `${score}/100`, color: T.primary, icon: CheckCircle },
            { label: "Camadas ativas", value: "4/4", color: T.accent, icon: Link },
            { label: "Validade jurídica", value: "ICP-Brasil", color: T.warning, icon: FileText },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: T.textSub }}>{m.label}</span>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 4-layer diagram */}
          <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Cpu size={18} style={{ color: T.primary }} />
              Arquitetura de 4 camadas
            </h2>

            {/* Score ring */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke={T.border} strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={T.success} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: T.success }}>{score}</span>
                  <span className="text-xs" style={{ color: T.textSub }}>/ 100</span>
                </div>
              </div>
            </div>

            {/* Layer list */}
            <div className="space-y-3">
              {LAYERS.map((l) => {
                const Icon = l.icon;
                const active = activeLayer === l.id;
                return (
                  <button
                    key={l.id}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
                    style={{
                      background: active ? l.color + "15" : T.panel,
                      borderColor: active ? l.color + "50" : T.border,
                    }}
                    onClick={() => setActiveLayer(active ? null : l.id)}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: l.color + "20" }}>
                      <Icon size={16} style={{ color: l.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{l.title}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{l.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CheckCircle size={14} style={{ color: T.success }} />
                      <ChevronRight size={14} style={{ color: T.textSub, transform: active ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Layer detail */}
            {layer && (
              <div className="mt-4 p-4 rounded-xl border" style={{ background: layer.color + "08", borderColor: layer.color + "30" }}>
                <p className="text-sm mb-2 leading-relaxed">{layer.description}</p>
                <p className="text-xs font-mono" style={{ color: layer.color }}>{layer.detail}</p>
              </div>
            )}
          </div>

          {/* Live proof generator */}
          <div className="rounded-2xl border p-6 flex flex-col" style={{ background: T.card, borderColor: T.border }}>
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <RefreshCw size={18} style={{ color: T.accent }} />
              Gerador de Prova ao Vivo
            </h2>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 rounded-xl font-bold text-sm mb-6 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}
            >
              {generating ? "Gerando prova..." : "Gerar nova prova agora"}
            </button>

            {/* Verification steps */}
            <div className="space-y-3 mb-6">
              {LAYERS.map((l, i) => {
                const Icon = l.icon;
                const done = verified > i;
                const active = generating && verified === i;
                return (
                  <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    style={{ background: done ? l.color + "10" : T.panel, borderColor: done ? l.color + "30" : T.border }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: done ? l.color + "25" : T.border + "50" }}>
                      {active ? <RefreshCw size={12} className="animate-spin" style={{ color: l.color }} />
                        : done ? <CheckCircle size={12} style={{ color: l.color }} />
                          : <Icon size={12} style={{ color: T.textSub }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: done ? T.text : T.textSub }}>{l.title}</div>
                    </div>
                    {done && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: l.color + "20", color: l.color }}>✓ OK</span>}
                  </div>
                );
              })}
            </div>

            {/* Latest proof */}
            {proofs[0] && (
              <div className="flex-1 rounded-xl border p-4 overflow-hidden" style={{ background: T.panel, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: T.success }}>Última prova</span>
                  <button onClick={() => setSelectedProof(proofs[0])} className="text-xs" style={{ color: T.primary }}>Ver detalhes</button>
                </div>
                <div className="space-y-1.5 font-mono text-xs" style={{ color: T.textSub }}>
                  <div><span style={{ color: T.text }}>ID:</span> {proofs[0].id}</div>
                  <div><span style={{ color: T.text }}>Tela:</span> {proofs[0].screen}</div>
                  <div><span style={{ color: T.text }}>Conteúdo:</span> {proofs[0].content}</div>
                  <div className="truncate"><span style={{ color: T.text }}>Merkle:</span> {proofs[0].merkleRoot.slice(0, 24)}…</div>
                  <div className="truncate"><span style={{ color: T.text }}>Polygon:</span> {proofs[0].polygonTx.slice(0, 24)}…</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live stream */}
        <div className="rounded-2xl border p-6 mb-10" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Eye size={18} style={{ color: T.primary }} />
              Stream de provas em tempo real
            </h2>
            <div className="flex items-center gap-2 text-xs" style={{ color: T.success }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
              Ao vivo
            </div>
          </div>
          <div ref={streamRef} className="space-y-2 max-h-64 overflow-y-auto">
            {proofs.map((p, i) => (
              <div
                key={p.id + i}
                className="flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:opacity-90"
                style={{
                  background: i === 0 ? T.success + "08" : T.panel,
                  borderColor: i === 0 ? T.success + "30" : T.border,
                }}
                onClick={() => setSelectedProof(p)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? T.success : T.textSub, opacity: i === 0 ? 1 : 0.4 }} />
                <div className="font-mono text-xs flex-shrink-0 w-28" style={{ color: T.primary }}>{p.id}</div>
                <div className="text-xs flex-shrink-0 w-20" style={{ color: T.textSub }}>{p.screen}</div>
                <div className="text-xs flex-1 truncate" style={{ color: T.textSub }}>{p.content}</div>
                <div className="font-mono text-xs truncate flex-1 hidden md:block" style={{ color: T.textSub }}>{p.merkleRoot.slice(0, 20)}…</div>
                <div className="text-xs flex-shrink-0" style={{ color: T.success }}>✓ {p.score}/100</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal basis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Whitepaper técnico-jurídico", desc: "Documentação completa da arquitetura ProofChain com enquadramento legal LGPD e ICP-Brasil.", icon: FileText, color: T.primary, action: "Download PDF" },
            { title: "3 modelos de DPA", desc: "Data Processing Agreements prontos para assinatura com anunciantes, clientes e parceiros.", icon: Shield, color: T.accent, action: "Ver modelos" },
            { title: "Auditoria blockchain", desc: "Verifique qualquer prova na Polygon Mainnet usando o explorador público de transações.", icon: Globe, color: T.warning, action: "Abrir explorador" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <Icon size={24} className="mb-4" style={{ color: item.color }} />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: T.textSub }}>{item.desc}</p>
                <button className="flex items-center gap-2 text-sm font-medium" style={{ color: item.color }}>
                  <Download size={14} /> {item.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof detail modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "#000000CC", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6" style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Shield size={16} style={{ color: T.success }} />
                Prova #{selectedProof.id}
              </h3>
              <button onClick={() => setSelectedProof(null)} className="text-sm px-3 py-1 rounded-lg border" style={{ borderColor: T.border, color: T.textSub }}>Fechar</button>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { label: "Tela", value: selectedProof.screen },
                { label: "Conteúdo", value: selectedProof.content },
                { label: "Duração", value: `${selectedProof.duration}s` },
                { label: "Timestamp", value: selectedProof.timestamp },
                { label: "RSA-SHA256", value: selectedProof.rsaHash, color: T.success },
                { label: "Merkle Root", value: selectedProof.merkleRoot, color: T.primary },
                { label: "Polygon TX", value: selectedProof.polygonTx, color: T.accent },
                { label: "TSA Token", value: selectedProof.tsaToken, color: T.warning },
              ].map((row) => (
                <div key={row.label} className="rounded-lg p-3 border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="mb-1" style={{ color: T.textSub }}>{row.label}</div>
                  <div className="break-all" style={{ color: row.color || T.text }}>{row.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: T.success + "15", color: T.success }}>
              <CheckCircle size={12} /> Score 100/100 · Todas as camadas verificadas
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
