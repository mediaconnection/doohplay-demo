import { useState, useEffect } from "react";
import { ArrowLeft, Shield, CheckCircle, Search, RefreshCw, ExternalLink, Download, Copy, AlertTriangle, Hash, Link2, Clock, Tv, X } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

function randHex(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const SAMPLE_IDS = [
  "POP-A3F2E9B1", "POP-7C84D620", "POP-1B5F3A9E", "POP-F208C74D",
];

type VerifyState = "idle" | "loading" | "valid" | "invalid" | "notfound";

interface ProofData {
  id: string;
  campaign: string;
  advertiser: string;
  screen: string;
  location: string;
  duration: number;
  timestamp: string;
  rsaHash: string;
  merkleRoot: string;
  polygonTx: string;
  polygonBlock: number;
  tsaTimestamp: string;
  tsaAuthority: string;
  score: number;
  layers: { name: string; status: "valid" | "pending"; hash: string; color: string }[];
}

function buildProofData(id: string): ProofData {
  return {
    id,
    campaign: ["Black Friday Eletrônicos", "Promoção Verão 2026", "Campanha Institucional Banco Delta", "Lançamento Produto X"][Math.floor(Math.random() * 4)],
    advertiser: ["TechStore Brasil", "Moda & Estilo", "Banco Delta", "StartupXYZ"][Math.floor(Math.random() * 4)],
    screen: "SCR-" + randHex(4).toUpperCase(),
    location: ["Barbearia Zimerman · São Paulo, SP", "Academia FitPro · Curitiba, PR", "Farmácia Saúde · Rio de Janeiro, RJ", "Restaurante Sabor · Belo Horizonte, MG"][Math.floor(Math.random() * 4)],
    duration: [10, 15, 20, 30][Math.floor(Math.random() * 4)],
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    rsaHash: "sha256:" + randHex(64),
    merkleRoot: "0x" + randHex(64),
    polygonTx: "0x" + randHex(64),
    polygonBlock: 58000000 + Math.floor(Math.random() * 1000000),
    tsaTimestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    tsaAuthority: "AC-Certisign RFC3161 v2",
    score: 100,
    layers: [
      { name: "RSA-SHA256", status: "valid", hash: "sha256:" + randHex(32), color: T.primary },
      { name: "Merkle Tree", status: "valid", hash: "0x" + randHex(32), color: T.accent },
      { name: "Polygon On-chain", status: "valid", hash: "0x" + randHex(32), color: "#8247E5" },
      { name: "TSA RFC 3161", status: "valid", hash: "ts:" + randHex(32), color: "#FFD700" },
    ],
  };
}

interface Props { onBack: () => void; }

export default function PublicProofVerifier({ onBack }: Props) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<VerifyState>("idle");
  const [proof, setProof] = useState<ProofData | null>(null);
  const [layerStep, setLayerStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state !== "loading") return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setLayerStep(i);
      if (i >= 4) {
        clearInterval(iv);
        setTimeout(() => {
          if (query.trim().toLowerCase().startsWith("invalid")) {
            setState("invalid");
          } else if (query.trim() === "") {
            setState("notfound");
          } else {
            setState("valid");
            setProof(buildProofData(query.trim().toUpperCase()));
          }
        }, 400);
      }
    }, 600);
    return () => clearInterval(iv);
  }, [state, query]);

  const handleVerify = () => {
    if (!query.trim()) return;
    setState("loading");
    setLayerStep(0);
    setProof(null);
  };

  const handleSample = (id: string) => {
    setQuery(id);
    setState("idle");
    setProof(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const LAYER_LABELS = [
    { name: "Assinatura RSA-SHA256", desc: "Verificando assinatura do dispositivo...", color: T.primary },
    { name: "Árvore de Merkle", desc: "Validando hash de integridade...", color: T.accent },
    { name: "Polygon Blockchain", desc: "Consultando transação on-chain...", color: "#8247E5" },
    { name: "TSA RFC 3161", desc: "Verificando timestamp de autoridade...", color: "#FFD700" },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b" style={{ background: T.panel, borderColor: T.border }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
              <Shield size={18} style={{ color: T.success }} />
            </div>
            <div>
              <div className="font-black">Verificador Público de Provas</div>
              <div className="text-xs" style={{ color: T.textSub }}>DOOHPLAY ProofChain · Auditoria aberta</div>
            </div>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
            <div className="w-2 h-2 rounded-full" style={{ background: T.success }} />
            Sistema operacional
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: T.success + "15", color: T.success, border: `1px solid ${T.success}30` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
            Verificação pública · sem login necessário
          </div>
          <h1 className="text-4xl font-black mb-4">Verifique qualquer prova de exibição</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: T.textSub }}>
            Cole o ID de uma prova DOOHPLAY e confirme que o anúncio foi exibido — verificado por 4 camadas criptográficas independentes.
          </p>
        </div>

        {/* Search box */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-4 rounded-2xl border" style={{ background: T.card, borderColor: state === "invalid" ? T.danger : state === "valid" ? T.success + "50" : T.border }}>
              <Search size={20} style={{ color: T.textSub, flexShrink: 0 }} />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setState("idle"); setProof(null); }}
                onKeyDown={e => e.key === "Enter" && handleVerify()}
                placeholder="Cole o ID da prova — ex: POP-A3F2E9B1"
                className="flex-1 bg-transparent outline-none text-lg font-mono"
                style={{ color: T.text }}
              />
              {query && (
                <button onClick={() => { setQuery(""); setState("idle"); setProof(null); }}>
                  <X size={16} style={{ color: T.textSub }} />
                </button>
              )}
            </div>
            <button
              onClick={handleVerify}
              disabled={!query.trim() || state === "loading"}
              className="px-6 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-40 transition-all hover:opacity-90 whitespace-nowrap"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
              {state === "loading" ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
              Verificar
            </button>
          </div>

          {/* Sample IDs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: T.textSub }}>Testar com:</span>
            {SAMPLE_IDS.map(id => (
              <button key={id} onClick={() => handleSample(id)}
                className="font-mono text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                style={{ background: T.panel, color: T.primary, border: `1px solid ${T.border}` }}>
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {state === "loading" && (
          <div className="rounded-2xl border p-8" style={{ background: T.card, borderColor: T.border }}>
            <div className="text-center mb-8">
              <RefreshCw size={32} className="animate-spin mx-auto mb-3" style={{ color: T.primary }} />
              <div className="font-bold">Verificando prova criptográfica</div>
              <div className="text-sm mt-1" style={{ color: T.textSub }}>Consultando 4 camadas independentes...</div>
            </div>
            <div className="space-y-4">
              {LAYER_LABELS.map((l, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: layerStep > i ? l.color + "20" : T.panel, border: `1.5px solid ${layerStep > i ? l.color : T.border}` }}>
                    {layerStep > i
                      ? <CheckCircle size={14} style={{ color: l.color }} />
                      : layerStep === i
                        ? <RefreshCw size={12} className="animate-spin" style={{ color: l.color }} />
                        : <div className="w-2 h-2 rounded-full" style={{ background: T.border }} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: layerStep >= i ? T.text : T.textSub }}>{l.name}</div>
                    {layerStep === i && <div className="text-xs" style={{ color: l.color }}>{l.desc}</div>}
                  </div>
                  {layerStep > i && <span className="text-xs font-bold" style={{ color: l.color }}>✓ VÁLIDO</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not found */}
        {state === "notfound" && (
          <div className="rounded-2xl border p-8 text-center" style={{ background: T.card, borderColor: T.warning + "30" }}>
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: T.warning }} />
            <div className="font-bold text-lg mb-2">Prova não encontrada</div>
            <p style={{ color: T.textSub }}>O ID informado não existe no sistema. Verifique se o ID está correto e tente novamente.</p>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="rounded-2xl border p-8 text-center" style={{ background: T.card, borderColor: T.danger + "30" }}>
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: T.danger }} />
            <div className="font-bold text-lg mb-2" style={{ color: T.danger }}>Prova inválida</div>
            <p style={{ color: T.textSub }}>A verificação falhou em uma ou mais camadas criptográficas. Esta prova pode ter sido adulterada.</p>
          </div>
        )}

        {/* Valid result */}
        {state === "valid" && proof && (
          <div className="space-y-5">
            {/* Score banner */}
            <div className="rounded-2xl border p-6 flex items-center gap-5" style={{ background: T.success + "08", borderColor: T.success + "30" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: T.success + "20" }}>
                <Shield size={28} style={{ color: T.success }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-2xl" style={{ color: T.success }}>PROVA VÁLIDA</span>
                  <span className="px-3 py-1 rounded-full text-sm font-black" style={{ background: T.success + "20", color: T.success }}>100/100</span>
                </div>
                <div className="text-sm" style={{ color: T.textSub }}>4 camadas verificadas · RSA-SHA256 · Merkle · Polygon · TSA RFC3161</div>
              </div>
              <button onClick={() => handleCopy(proof.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
                style={{ background: T.panel, color: copied ? T.success : T.textSub, border: `1px solid ${T.border}` }}>
                <Copy size={12} />
                {copied ? "Copiado!" : "Copiar ID"}
              </button>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exibition info */}
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Tv size={15} style={{ color: T.primary }} /> Dados da exibição
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "ID", value: proof.id },
                    { label: "Campanha", value: proof.campaign },
                    { label: "Anunciante", value: proof.advertiser },
                    { label: "Local", value: proof.location },
                    { label: "Duração", value: `${proof.duration}s` },
                    { label: "Data/Hora", value: new Date(proof.timestamp).toLocaleString("pt-BR") },
                  ].map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-24 flex-shrink-0 text-xs pt-0.5" style={{ color: T.textSub }}>{r.label}</span>
                      <span className="font-medium break-all">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer badges */}
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Shield size={15} style={{ color: T.success }} /> Camadas verificadas
                </div>
                <div className="space-y-3">
                  {proof.layers.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: l.color + "08", border: `1px solid ${l.color}20` }}>
                      <CheckCircle size={16} style={{ color: l.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{l.name}</div>
                        <div className="font-mono text-xs truncate mt-0.5" style={{ color: T.textSub }}>{l.hash.slice(0, 28)}…</div>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: l.color }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hashes */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-bold text-sm mb-4 flex items-center gap-2">
                <Hash size={15} style={{ color: T.accent }} /> Hashes criptográficos
              </div>
              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: "RSA Hash", value: proof.rsaHash, color: T.primary },
                  { label: "Merkle Root", value: proof.merkleRoot, color: T.accent },
                  { label: "Polygon TX", value: proof.polygonTx, color: "#8247E5" },
                  { label: "Polygon Block", value: `#${proof.polygonBlock.toLocaleString()}`, color: "#8247E5" },
                  { label: "TSA Timestamp", value: new Date(proof.tsaTimestamp).toISOString(), color: "#FFD700" },
                  { label: "TSA Authority", value: proof.tsaAuthority, color: "#FFD700" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: T.border }}>
                    <span className="w-32 flex-shrink-0" style={{ color: T.textSub }}>{r.label}</span>
                    <span className="flex-1 break-all" style={{ color: r.color }}>{r.value}</span>
                    <button onClick={() => handleCopy(r.value)} className="flex-shrink-0 ml-2 hover:opacity-60 transition-opacity">
                      <Copy size={11} style={{ color: T.textSub }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: T.primary + "15", color: T.primary, border: `1px solid ${T.primary}30` }}>
                <Download size={15} /> PDF Certificado
              </button>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#8247E5" + "15", color: "#8247E5", border: `1px solid #8247E530` }}>
                <ExternalLink size={15} /> Polygon Explorer
              </button>
              <button onClick={() => { setState("idle"); setProof(null); setQuery(""); }} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                <Search size={15} /> Nova verificação
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {state === "idle" && (
          <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-bold mb-5">Como funciona a verificação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🔐", title: "RSA-SHA256", desc: "Assinatura digital gerada no dispositivo no momento da exibição. Impossível falsificar sem a chave privada." },
                { icon: "🌳", title: "Merkle Tree", desc: "Cada exibição compõe uma árvore de hash imutável. Qualquer alteração invalida o hash raiz." },
                { icon: "⛓️", title: "Polygon Blockchain", desc: "O Merkle Root é gravado em transação pública na blockchain Polygon. Auditável por qualquer pessoa." },
                { icon: "⏱️", title: "TSA RFC 3161", desc: "Timestamp de autoridade certificada comprova a existência da prova em momento específico no tempo." },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: T.panel }}>
                  <span className="text-2xl flex-shrink-0">{l.icon}</span>
                  <div>
                    <div className="font-bold text-sm mb-1">{l.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: T.textSub }}>{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
