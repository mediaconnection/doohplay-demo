import { useState } from "react";
import {
  ArrowLeft, Link2, Shield, CheckCircle, Clock, Hash,
  ExternalLink, Download, Search, RefreshCw, Lock,
  ChevronRight, Eye, Layers, Globe, Cpu, FileText
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "dashboard" | "records" | "verify";

const CHAIN_STEPS = [
  { step: 1, name: "Coleta de Impressão",    tech: "SDK DOOH",         color: T.primary, icon: Eye,      desc: "Registro de cada exibição com timestamp, resolução e hash do criativo" },
  { step: 2, name: "Assinatura RSA-SHA256",  tech: "Chave privada HSM", color: T.accent,  icon: Lock,     desc: "Cada evento assinado digitalmente pela tela com chave privada em HSM" },
  { step: 3, name: "Merkle Tree Batch",       tech: "Batch 1.000 events",color: T.success, icon: Layers,   desc: "Grupos de 1.000 eventos compactados em árvore Merkle — raiz armazena o batch" },
  { step: 4, name: "Registro Polygon",        tech: "Blockchain pública", color: T.gold,   icon: Globe,    desc: "Raíz Merkle gravada em smart contract na rede Polygon (MATIC) — imutável" },
  { step: 5, name: "TSA RFC3161",             tech: "IETF Time Stamp",   color: T.warning,  icon: Clock,    desc: "Carimbo de tempo qualificado RFC3161 vincula o hash ao tempo real do servidor" },
];

interface ProofRecord {
  id: string;
  screen: string;
  campaign: string;
  batchSize: number;
  merkleRoot: string;
  polygonTx: string;
  tsaHash: string;
  timestamp: string;
  status: "confirmed" | "pending" | "anchoring";
  blockNumber: number;
}

const RECORDS: ProofRecord[] = [
  { id: "PR001", screen: "Av. Paulista 1000",    campaign: "Ambev Verão",   batchSize: 1000, merkleRoot: "0x8f3a…e29c", polygonTx: "0x3f9a…c14b", tsaHash: "SHA256:4a7c…", timestamp: "23/07 14:52:01", status: "confirmed",  blockNumber: 48294012 },
  { id: "PR002", screen: "Metrô Paulista",       campaign: "iFood Almoço",  batchSize: 1000, merkleRoot: "0x2b1d…a48f", polygonTx: "0x7e2b…d93a", tsaHash: "SHA256:9f1a…", timestamp: "23/07 14:37:44", status: "confirmed",  blockNumber: 48293884 },
  { id: "PR003", screen: "Aeroporto GRU T2",     campaign: "Bradesco Q3",   batchSize: 1000, merkleRoot: "0xc4e9…7b2d", polygonTx: "0x1a4c…f82e", tsaHash: "SHA256:3d8b…", timestamp: "23/07 14:21:19", status: "confirmed",  blockNumber: 48293711 },
  { id: "PR004", screen: "Shopping Iguatemi",    campaign: "Natura Natura", batchSize: 843,  merkleRoot: "0x6d7f…2c1a", polygonTx: "–",           tsaHash: "–",             timestamp: "23/07 14:58:30", status: "anchoring",  blockNumber: 0        },
  { id: "PR005", screen: "Shopping Boa Viagem",  campaign: "iFood Almoço",  batchSize: 512,  merkleRoot: "0xf1e2…4d9c", polygonTx: "–",           tsaHash: "–",             timestamp: "23/07 15:02:11", status: "pending",    blockNumber: 0        },
];

const BATCHES_TREND = [
  { h: "08h", batches: 18 }, { h: "10h", batches: 34 }, { h: "12h", batches: 48 },
  { h: "14h", batches: 52 }, { h: "16h", batches: 44 }, { h: "18h", batches: 61 }, { h: "20h", batches: 38 },
];

const STATUS_META = {
  confirmed: { label: "Confirmado",  color: T.success },
  pending:   { label: "Pendente",    color: T.warning  },
  anchoring: { label: "Ancorando",   color: T.primary  },
};

export default function ProofOfPlay({ onBack }: Props) {
  const [tab, setTab]        = useState<TabId>("dashboard");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<"valid" | "invalid" | null>(null);
  const [expanded, setExpanded] = useState<string | null>("PR001");
  const [searchQ, setSearchQ]   = useState("");

  const confirmedCount = RECORDS.filter(r => r.status === "confirmed").length;
  const totalBatches   = 4218;
  const totalEvents    = totalBatches * 1000;

  const handleVerify = () => {
    setVerifyResult(verifyHash.length > 10 ? "valid" : "invalid");
  };

  const filtered = RECORDS.filter(r =>
    searchQ === "" || r.screen.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.campaign.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.merkleRoot.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.success + "20" }}>
                <Shield size={18} style={{ color: T.success }} />
              </div>
              <div>
                <h1 className="font-black text-lg">ProofChain</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Prova de exibição imutável — RSA-SHA256 → Merkle Tree → Polygon → TSA RFC3161</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["dashboard","records","verify"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.success + "20" : "transparent", color: tab === t ? T.success : T.textSub, border: `1px solid ${tab === t ? T.success + "30" : "transparent"}` }}>
                {t === "dashboard" ? "Dashboard" : t === "records" ? "Registros" : "Verificar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Eventos Certificados", value: `${(totalEvents/1000000).toFixed(1)}M`,  color: T.success, icon: Shield     },
            { label: "Batches na Blockchain", value: totalBatches.toLocaleString("pt-BR"),    color: T.gold,    icon: Layers     },
            { label: "Confirmados (hoje)",    value: `${confirmedCount}/${RECORDS.length}`,   color: T.primary, icon: CheckCircle},
            { label: "Rede",                  value: "Polygon",                               color: T.accent,  icon: Globe      },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Chain pipeline */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-5">Pipeline de Certificação — 4 Camadas</h3>
              <div className="flex items-start gap-2">
                {CHAIN_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="flex items-start gap-2 flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: step.color + "25", border: `2px solid ${step.color + "50"}` }}>
                          <Icon size={16} style={{ color: step.color }} />
                        </div>
                        <div className="w-full mt-2 px-2">
                          <div className="font-black text-xs text-center mb-0.5" style={{ color: step.color }}>{step.name}</div>
                          <div className="text-xs text-center" style={{ color: T.textSub }}>{step.tech}</div>
                          <p className="text-xs text-center mt-1.5" style={{ color: T.textSub + "CC" }}>{step.desc}</p>
                        </div>
                      </div>
                      {i < CHAIN_STEPS.length - 1 && (
                        <div className="mt-4 flex-shrink-0">
                          <ChevronRight size={16} style={{ color: T.textSub }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Batches Certificados — Hoje</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={BATCHES_TREND}>
                    <defs>
                      <linearGradient key="grad-proof" id="grad-proof" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="h" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [v, "Batches"]} />
                    <Area key="area-proof" type="monotone" dataKey="batches" stroke={T.success} strokeWidth={2.5} fill="url(#grad-proof)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Estatísticas em Tempo Real</h3>
                <div className="space-y-3">
                  {[
                    { label: "Tempo médio de certificação", value: "< 2 min",  color: T.success },
                    { label: "Confirmações Polygon",        value: "12 blocos", color: T.gold    },
                    { label: "Gas médio (MATIC)",           value: "~0.001",    color: T.primary },
                    { label: "Eventos/seg",                 value: "~340",      color: T.accent  },
                    { label: "Uptime do serviço",           value: "99.97%",    color: T.success },
                    { label: "Último bloco",                value: "#48294012", color: T.textSub },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b"
                      style={{ borderColor: T.border }}>
                      <span style={{ color: T.textSub }}>{m.label}</span>
                      <span className="font-black font-mono" style={{ color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECORDS TAB */}
        {tab === "records" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl border"
                style={{ background: T.card, borderColor: T.border }}>
                <Search size={15} style={{ color: T.textSub }} />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Buscar por tela, campanha ou hash Merkle..."
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.text }} />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                <Download size={11} /> Exportar
              </button>
            </div>

            <div className="space-y-2">
              {filtered.map(rec => {
                const sm = STATUS_META[rec.status];
                const isOpen = expanded === rec.id;
                return (
                  <div key={rec.id} className="rounded-2xl border overflow-hidden"
                    style={{ background: T.card, borderColor: isOpen ? T.success + "30" : T.border }}>
                    <div className="p-4 cursor-pointer hover:bg-white/2" onClick={() => setExpanded(isOpen ? null : rec.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: sm.color + "20" }}>
                          <Shield size={14} style={{ color: sm.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm">{rec.screen}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                            {rec.campaign} · {rec.batchSize.toLocaleString()} eventos · {rec.timestamp}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                          <div className="font-mono" style={{ color: T.textSub }}>{rec.merkleRoot}</div>
                          {rec.blockNumber > 0 && (
                            <div className="font-mono" style={{ color: T.gold }}>#{rec.blockNumber.toLocaleString()}</div>
                          )}
                          <ChevronRight size={14} style={{ color: T.textSub, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t p-4 space-y-3" style={{ borderColor: T.border }}>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Merkle Root",   value: rec.merkleRoot, color: T.success },
                            { label: "Polygon TX",    value: rec.polygonTx,  color: T.gold    },
                            { label: "TSA Hash",      value: rec.tsaHash,    color: T.accent  },
                            { label: "Bloco",         value: rec.blockNumber > 0 ? `#${rec.blockNumber.toLocaleString()}` : "Pendente", color: T.primary },
                          ].map((f, i) => (
                            <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                              <div className="text-xs font-black mb-1" style={{ color: T.textSub }}>{f.label}</div>
                              <div className="font-mono text-xs" style={{ color: f.color }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                        {rec.status === "confirmed" && (
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background: T.success + "20", color: T.success }}>
                              <ExternalLink size={11} /> Ver na Polygon
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                              <FileText size={11} /> Relatório PDF
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VERIFY TAB */}
        {tab === "verify" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-2">
                <Hash size={16} style={{ color: T.success }} />
                <h3 className="font-black">Verificar Prova de Exibição</h3>
              </div>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>
                Insira o hash Merkle, TX Polygon ou ID de batch para validar a autenticidade de uma exibição.
              </p>

              <div className="flex gap-3">
                <input type="text" value={verifyHash} onChange={e => { setVerifyHash(e.target.value); setVerifyResult(null); }}
                  placeholder="0x8f3a… ou SHA256:4a7c… ou PR001"
                  className="flex-1 px-4 py-3 rounded-xl font-mono text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                <button onClick={handleVerify}
                  className="px-6 py-3 rounded-xl text-sm font-black"
                  style={{ background: T.success, color: "#000" }}>
                  Verificar
                </button>
              </div>

              {verifyResult === "valid" && (
                <div className="mt-4 p-4 rounded-xl border" style={{ background: T.success + "10", borderColor: T.success + "30" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} style={{ color: T.success }} />
                    <span className="font-black" style={{ color: T.success }}>Prova Válida</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Tela",         value: "Av. Paulista 1000"   },
                      { label: "Campanha",     value: "Ambev Verão"         },
                      { label: "Timestamp",    value: "23/07/2025 14:52:01" },
                      { label: "Bloco",        value: "#48294012"           },
                      { label: "Assinatura",   value: "RSA-SHA256 ✓"        },
                      { label: "TSA RFC3161",  value: "Válido ✓"            },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span style={{ color: T.textSub }}>{f.label}</span>
                        <span className="font-black">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: T.success + "20", color: T.success }}>
                      <ExternalLink size={11} /> Polygon Explorer
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                      <Download size={11} /> Certificado PDF
                    </button>
                  </div>
                </div>
              )}

              {verifyResult === "invalid" && (
                <div className="mt-4 p-4 rounded-xl border" style={{ background: T.danger + "10", borderColor: T.danger + "30" }}>
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: T.danger }} />
                    <span className="font-black" style={{ color: T.danger }}>Hash não encontrado na blockchain</span>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: T.textSub }}>
                    O hash informado não corresponde a nenhum registro certificado no ProofChain. Verifique se o hash está correto ou se o batch ainda está sendo ancorando.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-4 text-sm">Garantias ProofChain</h3>
              <div className="space-y-3">
                {[
                  { label: "Imutabilidade",   desc: "Registros na Polygon não podem ser alterados ou deletados após confirmação.",     icon: Lock,      color: T.gold    },
                  { label: "Auditabilidade",  desc: "Qualquer terceiro pode verificar independentemente a validade de uma exibição.", icon: Eye,       color: T.primary },
                  { label: "Tempestividade",  desc: "TSA RFC3161 garante que o timestamp é o momento real de exibição.",             icon: Clock,     color: T.success },
                  { label: "Não-repúdio",     desc: "Assinatura RSA-SHA256 do dispositivo impede contestação de autenticidade.",      icon: Shield,    color: T.accent  },
                ].map((g, i) => {
                  const Icon = g.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.panel }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: g.color + "20" }}>
                        <Icon size={13} style={{ color: g.color }} />
                      </div>
                      <div>
                        <div className="font-black text-sm" style={{ color: g.color }}>{g.label}</div>
                        <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{g.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
