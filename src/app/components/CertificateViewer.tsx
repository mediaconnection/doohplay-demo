import { useState } from "react";
import {
  ArrowLeft, ShieldCheck, Download, Share2, ExternalLink, Copy, Check,
  Lock, Hash, Link, Clock, Tv, FileText, ChevronDown, ChevronUp, Award
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const MOCK_CERT = {
  id:           "PROOF-2025-NV-00847291",
  campaignName: "Ambev — Brahma Black Friday 2025",
  advertiser:   "Ambev S.A.",
  agency:       "DPZ&T Propaganda",
  screen:       "Outdoor Av. Paulista #1374 — São Paulo, SP",
  screenId:     "DOOH-SP-OD-0042",
  startTime:    "2025-11-25T08:00:00-03:00",
  endTime:      "2025-11-25T08:00:15-03:00",
  duration:     "15s",
  impressions:  48200,
  status:       "VERIFIED",
  // ProofChain layers
  contentHash:  "sha256:a3f9e2c1d847b61f9e23c4a08d72b53e19f04c62738a91d5e06b2c749f18e3a1",
  merkleRoot:   "0x7f4a2c9d1e83b56f2a0c4d8e91b37a5c26f8d0e4b19a73c52d86e047f9b1a4c",
  polygonTx:    "0x4a9e1f2c3b8d0e57a6f19c2b4d37e08a5c6b1f3d92e04c57a8b16d293f0e5c8",
  tsaHash:      "RFC3161:2025-11-25T08:00:15.412Z:sha256:c8d1a47e2f93b60c5d2e8a1b4f7c9d3e",
  tsaProvider:  "Serpro — ICP-Brasil",
  blockNumber:  "19847265",
  blockTime:    "2025-11-25T08:00:17.412Z",
  polygonScan:  "https://polygonscan.com/tx/0x4a9e...",
};

function HashRow({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: T.border }}>
      <Icon size={13} style={{ color }} className="flex-shrink-0" />
      <div className="w-28 text-xs font-black flex-shrink-0" style={{ color: T.textSub }}>{label}</div>
      <div className="flex-1 font-mono text-xs truncate" style={{ color: T.text }}>{value}</div>
      <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0">
        {copied ? <Check size={11} style={{ color: T.success }} /> : <Copy size={11} style={{ color: T.textSub }} />}
      </button>
    </div>
  );
}

export default function CertificateViewer({ onBack }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const share = () => {
    setShareMsg("Link copiado!");
    setTimeout(() => setShareMsg(""), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <ShieldCheck size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Certificado ProofChain</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Prova criptográfica de exibição — 4 camadas de verificação</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={share} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.card, color: shareMsg ? T.success : T.textSub, border: `1px solid ${T.border}` }}>
              {shareMsg ? <><Check size={13} /> {shareMsg}</> : <><Share2 size={13} /> Compartilhar</>}
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.success + "20", color: T.success }}>
              <Download size={13} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Hero certificate */}
        <div className="rounded-3xl overflow-hidden border" style={{ borderColor: T.success + "30" }}>
          {/* Header stripe */}
          <div className="px-8 py-6 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${T.success}18 0%, ${T.primary}12 100%)`, borderBottom: `1px solid ${T.success}25` }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: T.success + "20", border: `2px solid ${T.success}40` }}>
                <Award size={28} style={{ color: T.success }} />
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: T.text }}>Prova de Exibição</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: T.success }}>{MOCK_CERT.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: T.success + "20", border: `1px solid ${T.success}40` }}>
              <ShieldCheck size={16} style={{ color: T.success }} />
              <span className="font-black text-sm" style={{ color: T.success }}>VERIFICADO</span>
            </div>
          </div>

          {/* Campaign details */}
          <div className="px-8 py-6 grid grid-cols-2 gap-x-8 gap-y-4" style={{ background: T.card }}>
            {[
              { label: "CAMPANHA",     value: MOCK_CERT.campaignName, color: T.text    },
              { label: "ANUNCIANTE",   value: MOCK_CERT.advertiser,   color: T.text    },
              { label: "AGÊNCIA",      value: MOCK_CERT.agency,       color: T.textSub !== T.text ? "#9BA3C8" : T.textSub },
              { label: "TELA",         value: MOCK_CERT.screen,       color: T.primary },
              { label: "INÍCIO",       value: new Date(MOCK_CERT.startTime).toLocaleString("pt-BR"), color: T.textSub !== T.text ? "#9BA3C8" : T.textSub },
              { label: "DURAÇÃO",      value: MOCK_CERT.duration,     color: T.gold    },
            ].map((row, i) => (
              <div key={i}>
                <div className="text-xs font-black mb-0.5" style={{ color: T.textSub }}>{row.label}</div>
                <div className="text-sm font-bold" style={{ color: row.color }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Impressions big number */}
          <div className="px-8 py-5 flex items-center gap-6 border-t" style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center gap-3">
              <Tv size={20} style={{ color: T.primary }} />
              <div>
                <div className="font-black text-3xl" style={{ color: T.primary }}>{MOCK_CERT.impressions.toLocaleString("pt-BR")}</div>
                <div className="text-xs" style={{ color: T.textSub }}>Impressões verificadas</div>
              </div>
            </div>
            <div className="h-10 w-px" style={{ background: T.border }} />
            <div>
              <div className="font-black" style={{ color: T.success }}>100% verificado</div>
              <div className="text-xs" style={{ color: T.textSub }}>RSA-SHA256 · Merkle · Polygon · TSA</div>
            </div>
          </div>
        </div>

        {/* 4-layer proof chain */}
        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black">Cadeia de Prova Criptográfica</h3>
            <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs font-bold" style={{ color: T.textSub }}>
              {expanded ? <><ChevronUp size={14} /> Recolher</> : <><ChevronDown size={14} /> Ver hashes</>}
            </button>
          </div>

          {/* Visual chain */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { n: 1, label: "Conteúdo",  sub: "RSA-SHA256",     color: T.primary, icon: Lock    },
              { n: 2, label: "Merkle",    sub: "Árvore de hash", color: T.accent,  icon: Hash    },
              { n: 3, label: "Blockchain",sub: "Polygon PoS",    color: T.gold,    icon: Link    },
              { n: 4, label: "TSA",       sub: "RFC 3161",        color: T.success, icon: Clock   },
            ].map((layer, i, arr) => (
              <div key={layer.n} className="relative">
                <div className="p-3 rounded-xl border text-center"
                  style={{ background: layer.color + "10", borderColor: layer.color + "30" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ background: layer.color + "20" }}>
                    <layer.icon size={14} style={{ color: layer.color }} />
                  </div>
                  <div className="font-black text-xs" style={{ color: layer.color }}>{layer.n}. {layer.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{layer.sub}</div>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center mx-auto mt-2"
                    style={{ background: T.success + "20" }}>
                    <Check size={9} style={{ color: T.success }} />
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="absolute top-1/2 -right-2 w-3 h-px" style={{ background: T.border }} />
                )}
              </div>
            ))}
          </div>

          {/* Expanded hashes */}
          {expanded && (
            <div className="mt-2 p-4 rounded-xl" style={{ background: T.panel }}>
              <HashRow label="Content Hash" value={MOCK_CERT.contentHash} icon={Lock}     color={T.primary} />
              <HashRow label="Merkle Root"  value={MOCK_CERT.merkleRoot}  icon={Hash}     color={T.accent}  />
              <HashRow label="Polygon TX"   value={MOCK_CERT.polygonTx}   icon={Link}     color={T.gold}    />
              <HashRow label="Block"        value={`#${MOCK_CERT.blockNumber} · ${new Date(MOCK_CERT.blockTime).toLocaleString("pt-BR")}`} icon={FileText} color={T.gold} />
              <HashRow label="TSA"          value={MOCK_CERT.tsaHash}     icon={Clock}    color={T.success} />
              <HashRow label="TSA Provider" value={MOCK_CERT.tsaProvider}  icon={ShieldCheck} color={T.success} />

              <button className="mt-3 flex items-center gap-2 text-xs font-bold" style={{ color: T.primary }}>
                <ExternalLink size={12} /> Ver no PolygonScan
              </button>
            </div>
          )}
        </div>

        {/* Legal footer */}
        <div className="p-4 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
          <p className="text-xs leading-relaxed" style={{ color: T.textSub }}>
            Este certificado comprova criptograficamente a exibição do conteúdo descrito acima, com validade legal conforme{" "}
            <strong style={{ color: T.text }}>Medida Provisória 2.200-2/2001</strong> (ICP-Brasil) e {" "}
            <strong style={{ color: T.text }}>RFC 3161</strong> (TSA). O hash SHA-256 do conteúdo está ancorado na blockchain Polygon (PoS) e timestampado por autoridade certificadora credenciada. DOOHPLAY Certificação Digital — {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </div>
  );
}
