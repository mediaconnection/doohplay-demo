import { useState } from "react";
import {
  ArrowLeft, Code2, Copy, Check, ChevronDown, ChevronRight,
  Zap, Shield, BarChart2, Tv, Megaphone, Globe
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Lang = "curl" | "js" | "python" | "go";
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Endpoint {
  method: Method;
  path: string;
  summary: string;
  description: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  response: string;
  codes: Record<Lang, string>;
}

const METHOD_COLOR: Record<Method, string> = {
  GET: T.success, POST: T.primary, PUT: T.warning, DELETE: T.danger, PATCH: T.accent,
};

const GROUPS: { id: string; label: string; icon: React.ElementType; color: string; endpoints: Endpoint[] }[] = [
  {
    id: "campaigns", label: "Campaigns", icon: Megaphone, color: T.primary,
    endpoints: [
      {
        method: "GET", path: "/v1/campaigns", summary: "Listar campanhas",
        description: "Retorna todas as campanhas do tenant autenticado com paginação.",
        params: [
          { name: "status", type: "string", required: false, desc: "Filtrar por: active, paused, draft, finished" },
          { name: "page",   type: "number", required: false, desc: "Página (padrão: 1)" },
          { name: "limit",  type: "number", required: false, desc: "Itens por página (máx: 100)" },
        ],
        response: `{
  "data": [
    {
      "id": "cmp_8f3a2d1c",
      "name": "Ambev Black Friday 2025",
      "status": "active",
      "budget": 45000.00,
      "spent": 12840.50,
      "impressions": 2480000,
      "ctr": 0.048,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "meta": { "total": 24, "page": 1, "limit": 10 }
}`,
        codes: {
          curl: `curl -X GET "https://api.doohplay.com.br/v1/campaigns" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"active","limit":10}'`,
          js: `import { DoohPlay } from '@doohplay/sdk';

const client = new DoohPlay({ apiKey: process.env.DOOHPLAY_KEY });

const campaigns = await client.campaigns.list({
  status: 'active',
  limit: 10,
});

console.log(campaigns.data);`,
          python: `from doohplay import DoohPlay

client = DoohPlay(api_key=os.environ["DOOHPLAY_KEY"])

campaigns = client.campaigns.list(
    status="active",
    limit=10
)

print(campaigns.data)`,
          go: `package main

import (
  "github.com/doohplay/doohplay-go"
)

func main() {
  client := doohplay.NewClient(os.Getenv("DOOHPLAY_KEY"))

  campaigns, _ := client.Campaigns.List(&doohplay.ListParams{
    Status: "active",
    Limit:  10,
  })

  fmt.Println(campaigns.Data)
}`,
        },
      },
      {
        method: "POST", path: "/v1/campaigns", summary: "Criar campanha",
        description: "Cria uma nova campanha. O status inicial é sempre `draft`.",
        params: [
          { name: "name",       type: "string",   required: true,  desc: "Nome da campanha" },
          { name: "objective",  type: "string",   required: true,  desc: "awareness | consideration | conversion | retention" },
          { name: "budget",     type: "number",   required: true,  desc: "Budget total em BRL" },
          { name: "start_date", type: "ISO 8601", required: true,  desc: "Data de início" },
          { name: "end_date",   type: "ISO 8601", required: true,  desc: "Data de fim" },
          { name: "screen_ids", type: "string[]", required: false, desc: "IDs das telas. Se vazio, usa recomendação IA" },
        ],
        response: `{
  "id": "cmp_9e2b3f4a",
  "name": "Minha Campanha",
  "status": "draft",
  "budget": 15000.00,
  "objective": "awareness",
  "projected_impressions": 4200000,
  "projected_ctr": 0.042,
  "created_at": "2025-08-08T14:30:00Z"
}`,
        codes: {
          curl: `curl -X POST "https://api.doohplay.com.br/v1/campaigns" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Minha Campanha",
    "objective": "awareness",
    "budget": 15000,
    "start_date": "2025-09-01",
    "end_date": "2025-09-30"
  }'`,
          js: `const campaign = await client.campaigns.create({
  name: 'Minha Campanha',
  objective: 'awareness',
  budget: 15000,
  start_date: '2025-09-01',
  end_date: '2025-09-30',
});`,
          python: `campaign = client.campaigns.create(
    name="Minha Campanha",
    objective="awareness",
    budget=15000,
    start_date="2025-09-01",
    end_date="2025-09-30",
)`,
          go: `campaign, _ := client.Campaigns.Create(&doohplay.CampaignParams{
  Name:      "Minha Campanha",
  Objective: "awareness",
  Budget:    15000,
  StartDate: "2025-09-01",
  EndDate:   "2025-09-30",
})`,
        },
      },
    ],
  },
  {
    id: "screens", label: "Screens", icon: Tv, color: T.success,
    endpoints: [
      {
        method: "GET", path: "/v1/screens", summary: "Listar telas",
        description: "Retorna todas as telas da rede com status em tempo real.",
        params: [
          { name: "status", type: "string", required: false, desc: "online | offline | maintenance" },
          { name: "city",   type: "string", required: false, desc: "Filtrar por cidade" },
          { name: "type",   type: "string", required: false, desc: "outdoor | indoor | transit | retail | airport" },
        ],
        response: `{
  "data": [
    {
      "id": "scr_sp_od_0042",
      "name": "Paulista Av. #1374",
      "type": "outdoor",
      "status": "online",
      "city": "São Paulo",
      "state": "SP",
      "cpm_base": 62.00,
      "daily_impressions": 48200,
      "last_seen": "2025-08-08T14:29:55Z"
    }
  ]
}`,
        codes: {
          curl: `curl -X GET "https://api.doohplay.com.br/v1/screens?status=online&city=São Paulo" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          js: `const screens = await client.screens.list({
  status: 'online',
  city: 'São Paulo',
  type: 'outdoor',
});`,
          python: `screens = client.screens.list(
    status="online",
    city="São Paulo",
    type="outdoor",
)`,
          go: `screens, _ := client.Screens.List(&doohplay.ScreenParams{
  Status: "online",
  City:   "São Paulo",
  Type:   "outdoor",
})`,
        },
      },
    ],
  },
  {
    id: "proof", label: "ProofChain", icon: Shield, color: T.gold,
    endpoints: [
      {
        method: "GET", path: "/v1/proof/{impression_id}", summary: "Buscar prova de exibição",
        description: "Retorna o certificado ProofChain completo para uma impressão específica.",
        params: [
          { name: "impression_id", type: "string", required: true, desc: "ID da impressão (path param)" },
        ],
        response: `{
  "impression_id": "imp_8f2c1a9e",
  "status": "VERIFIED",
  "content_hash": "sha256:a3f9e2c1d847...",
  "merkle_root": "0x7f4a2c9d1e83b56f...",
  "polygon_tx": "0x4a9e1f2c3b8d0e57...",
  "block_number": 19847265,
  "tsa_hash": "RFC3161:2025-11-25T08:00:15...",
  "verified_at": "2025-11-25T08:00:17Z"
}`,
        codes: {
          curl: `curl "https://api.doohplay.com.br/v1/proof/imp_8f2c1a9e" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          js: `const proof = await client.proof.get('imp_8f2c1a9e');
console.log(proof.polygon_tx);`,
          python: `proof = client.proof.get("imp_8f2c1a9e")
print(proof.polygon_tx)`,
          go: `proof, _ := client.Proof.Get("imp_8f2c1a9e")
fmt.Println(proof.PolygonTx)`,
        },
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
      style={{ background: T.border, color: copied ? T.success : T.textSub }}>
      {copied ? <><Check size={10} /> Copiado</> : <><Copy size={10} /> Copiar</>}
    </button>
  );
}

export default function PublicAPIDoc({ onBack }: Props) {
  const [activeGroup, setActiveGroup] = useState("campaigns");
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [lang, setLang]         = useState<Lang>("curl");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["campaigns-0"]));

  const group = GROUPS.find(g => g.id === activeGroup)!;

  const toggle = (key: string) => {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Code2 size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">API Reference</h1>
                <p className="text-xs" style={{ color: T.textSub }}>DOOHPLAY REST API v1 · Base: api.doohplay.com.br</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: T.success + "15", color: T.success, border: `1px solid ${T.success}25` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
            API Operacional · 99.98% uptime
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-60 border-r flex-shrink-0 py-4" style={{ borderColor: T.border }}>
          {/* Auth section */}
          <div className="px-4 mb-4">
            <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>AUTENTICAÇÃO</div>
            <div className="text-xs p-2.5 rounded-xl font-mono" style={{ background: T.card, color: T.warning }}>
              Authorization: Bearer API_KEY
            </div>
          </div>
          {/* Groups */}
          <div className="px-4">
            <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>ENDPOINTS</div>
            {GROUPS.map(g => (
              <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveEndpoint(0); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
                style={{ background: activeGroup === g.id ? g.color + "15" : "transparent" }}>
                <g.icon size={13} style={{ color: activeGroup === g.id ? g.color : T.textSub }} />
                <span className="text-sm font-bold" style={{ color: activeGroup === g.id ? g.color : T.textSub }}>{g.label}</span>
                <span className="ml-auto text-xs" style={{ color: T.textSub }}>{g.endpoints.length}</span>
              </button>
            ))}
          </div>
          {/* Rate limits */}
          <div className="px-4 mt-6">
            <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>RATE LIMITS</div>
            {[
              { plan: "Starter",    rps: "10 req/s"  },
              { plan: "Growth",     rps: "100 req/s" },
              { plan: "Enterprise", rps: "Unlimited" },
            ].map(r => (
              <div key={r.plan} className="flex justify-between text-xs py-1">
                <span style={{ color: T.textSub }}>{r.plan}</span>
                <span style={{ color: T.text }}>{r.rps}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {group.endpoints.map((ep, i) => (
            <div key={i} className="border-b" style={{ borderColor: T.border }}>
              {/* Endpoint header */}
              <button
                onClick={() => toggle(`${activeGroup}-${i}`)}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/2">
                <span className="px-2.5 py-1 rounded font-black text-xs w-16 text-center"
                  style={{ background: METHOD_COLOR[ep.method] + "20", color: METHOD_COLOR[ep.method] }}>
                  {ep.method}
                </span>
                <code className="font-mono text-sm" style={{ color: T.text }}>{ep.path}</code>
                <span className="text-sm" style={{ color: T.textSub }}>{ep.summary}</span>
                <div className="ml-auto">
                  {expanded.has(`${activeGroup}-${i}`)
                    ? <ChevronDown size={14} style={{ color: T.textSub }} />
                    : <ChevronRight size={14} style={{ color: T.textSub }} />}
                </div>
              </button>

              {/* Endpoint details */}
              {expanded.has(`${activeGroup}-${i}`) && (
                <div className="px-6 pb-6">
                  <p className="text-sm mb-4" style={{ color: T.textSub }}>{ep.description}</p>

                  {/* Params */}
                  {ep.params && (
                    <div className="mb-5">
                      <div className="text-xs font-black mb-2" style={{ color: T.textSub }}>PARÂMETROS</div>
                      <div className="rounded-xl overflow-hidden border" style={{ borderColor: T.border }}>
                        {ep.params.map((p, j) => (
                          <div key={j} className="flex items-center gap-4 px-4 py-2.5 border-b last:border-0" style={{ borderColor: T.border, background: j % 2 ? T.panel : T.card }}>
                            <code className="text-xs font-mono w-28 flex-shrink-0" style={{ color: T.primary }}>{p.name}</code>
                            <code className="text-xs font-mono w-20 flex-shrink-0" style={{ color: T.accent }}>{p.type}</code>
                            <span className="text-xs w-20 flex-shrink-0" style={{ color: p.required ? T.warning : T.textSub }}>
                              {p.required ? "obrigatório" : "opcional"}
                            </span>
                            <span className="text-xs flex-1" style={{ color: T.textSub }}>{p.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code + Response */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-black" style={{ color: T.textSub }}>EXEMPLO</div>
                        <div className="flex gap-1">
                          {(["curl","js","python","go"] as Lang[]).map(l => (
                            <button key={l} onClick={() => setLang(l)}
                              className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                              style={{ background: lang === l ? T.primary + "20" : "transparent", color: lang === l ? T.primary : T.textSub }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <pre className="p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed"
                          style={{ background: "#010208", color: "#9BA3C8", border: `1px solid ${T.border}` }}>
                          {ep.codes[lang]}
                        </pre>
                        <div className="absolute top-2 right-2">
                          <CopyButton text={ep.codes[lang]} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-black" style={{ color: T.textSub }}>RESPOSTA 200</div>
                        <CopyButton text={ep.response} />
                      </div>
                      <pre className="p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed"
                        style={{ background: "#010208", color: "#00DC82", border: `1px solid ${T.border}` }}>
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
