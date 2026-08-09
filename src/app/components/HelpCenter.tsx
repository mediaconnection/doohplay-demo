import { useState } from "react";
import {
  ArrowLeft, Search, ChevronDown, ChevronRight, BookOpen,
  Play, CheckCircle, Clock, Star, Zap, Shield, DollarSign,
  Tv, BarChart2, MessageCircle, ExternalLink, ThumbsUp, ThumbsDown,
  Sparkles, FileText, Users, Globe
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ArticleStatus = "published" | "video";
interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  readMin: number;
  status: ArticleStatus;
  tags: string[];
  body: string[];
}

const CATEGORIES = [
  { id: "all",       label: "Todos",         icon: BookOpen,    count: 38 },
  { id: "start",     label: "Primeiros passos", icon: Zap,       count: 8  },
  { id: "screens",   label: "Telas & Player", icon: Tv,          count: 9  },
  { id: "campaigns", label: "Campanhas",      icon: BarChart2,   count: 7  },
  { id: "billing",   label: "Pagamentos",     icon: DollarSign,  count: 6  },
  { id: "proof",     label: "ProofChain",     icon: Shield,      count: 5  },
  { id: "team",      label: "Time & Acesso",  icon: Users,       count: 3  },
];

const ARTICLES: Article[] = [
  {
    id: "a1", category: "start", status: "published",
    title: "Como instalar o DOOHPLAY em uma TV Android",
    views: 4821, helpful: 97, readMin: 5, tags: ["instalação","android","tela"],
    body: [
      "Acesse a Play Store na sua TV Android e busque por 'DOOHPLAY Player'.",
      "Faça o download do app (versão mínima Android 7.0). Após instalar, abra o app e você verá um código de pareamento de 6 dígitos.",
      "No painel DOOHPLAY, vá em Telas → Adicionar Tela e insira o código de pareamento.",
      "Defina nome, localização e tamanho da tela. Em até 30 segundos a tela estará online e pronta para receber conteúdo.",
      "Dica: mantenha a TV conectada via cabo ethernet para maior estabilidade do player.",
    ],
  },
  {
    id: "a2", category: "start", status: "video",
    title: "Configuração inicial: do cadastro à primeira campanha em 10 minutos",
    views: 6340, helpful: 99, readMin: 10, tags: ["início rápido","cadastro","campanha"],
    body: [
      "Este tutorial em vídeo cobre o fluxo completo: criar conta → adicionar tela → subir criativo → lançar campanha.",
      "Pré-requisito: TV Android com acesso à internet e conta DOOHPLAY (qualquer plano).",
      "Duração do vídeo: 9 minutos e 42 segundos.",
    ],
  },
  {
    id: "a3", category: "screens", status: "published",
    title: "Entendendo os status da tela: Online, Offline, Warning",
    views: 2940, helpful: 94, readMin: 3, tags: ["status","monitoramento","player"],
    body: [
      "Online (verde): tela conectada, player ativo, heartbeat recebido nos últimos 60 segundos.",
      "Warning (amarelo): heartbeat recebido mas com latência acima de 500ms, ou fill rate abaixo de 30%.",
      "Offline (vermelho): sem heartbeat por mais de 5 minutos. O sistema envia notificação automática por WhatsApp.",
      "Updating (azul): player recebendo atualização de firmware ou nova playlist. Duração típica: 45 segundos.",
    ],
  },
  {
    id: "a4", category: "campaigns", status: "published",
    title: "Como criar uma campanha com segmentação por horário",
    views: 3120, helpful: 96, readMin: 6, tags: ["campanha","segmentação","horário"],
    body: [
      "No painel, acesse Campanhas → Nova Campanha.",
      "Em 'Agendamento', ative a opção 'Horário específico'. Defina os intervalos (ex: 12h–14h para almoço, 18h–20h para fim de tarde).",
      "O sistema aplica o agendamento com precisão de 1 minuto. Exibições fora do horário programado são automaticamente puladas.",
      "Dica pro: use o módulo Eventos & Datas para agendar campanhas em datas comemorativas com antecedência.",
    ],
  },
  {
    id: "a5", category: "billing", status: "published",
    title: "Entendendo o modelo de receita e split de pagamento",
    views: 2280, helpful: 98, readMin: 4, tags: ["receita","split","pagamento"],
    body: [
      "O DOOHPLAY opera com split automático: 70% da receita gerada pelos seus espaços vai direto para você.",
      "Os 30% restantes cobrem a plataforma, infraestrutura ProofChain e suporte.",
      "Pagamentos são processados via PIX até o 5º dia útil do mês seguinte.",
      "Plano Business inclui repasse antecipado (D+2) mediante solicitação no módulo Repasses.",
    ],
  },
  {
    id: "a6", category: "proof", status: "published",
    title: "O que é ProofChain e como verificar uma exibição",
    views: 1840, helpful: 100, readMin: 5, tags: ["proofchain","blockchain","auditoria"],
    body: [
      "ProofChain é o sistema de prova de exibição em 4 camadas do DOOHPLAY.",
      "Camada 1: Hash RSA-SHA256 gerado no momento da exibição pelo player.",
      "Camada 2: Árvore Merkle agregando 60 minutos de exibições por tela.",
      "Camada 3: Âncora on-chain na blockchain Polygon (transação imutável).",
      "Camada 4: Carimbo de tempo TSA RFC3161 por autoridade certificada.",
      "Para verificar: acesse o módulo Verificador de Prova e insira o ID da exibição ou hash.",
    ],
  },
  {
    id: "a7", category: "billing", status: "published",
    title: "Como fazer upgrade de plano e o que muda imediatamente",
    views: 1620, helpful: 95, readMin: 3, tags: ["upgrade","plano","billing"],
    body: [
      "Acesse Configurações → Plano → Fazer Upgrade.",
      "O novo plano é ativado em até 5 minutos após o pagamento confirmado.",
      "Mudanças imediatas: limite de telas aumenta, quota de AI sobe, acesso a módulos premium liberado.",
      "Valores: Starter R$97/mês · Pro R$290/mês · Business R$620/mês.",
      "Não há fidelidade. Você pode cancelar ou fazer downgrade a qualquer momento.",
    ],
  },
  {
    id: "a8", category: "screens", status: "published",
    title: "Configurando a playlist e o loop de exibição",
    views: 2760, helpful: 93, readMin: 4, tags: ["playlist","loop","conteúdo"],
    body: [
      "Acesse o módulo Playlist no painel.",
      "Arraste os criativos para definir a ordem. O loop é automático: ao terminar o último item, volta ao primeiro.",
      "Defina a duração de cada item (mínimo 5s, máximo 300s).",
      "Campanhas pagas têm prioridade sobre conteúdo próprio. A proporção é gerenciada pela loteria ponderada 60/20/15/5%.",
    ],
  },
  {
    id: "a9", category: "team", status: "published",
    title: "Como adicionar membros da equipe e definir permissões",
    views: 980, helpful: 91, readMin: 3, tags: ["equipe","permissões","acesso"],
    body: [
      "Disponível no plano Pro e Business.",
      "Acesse Controle de Acesso → Convidar membro.",
      "Perfis disponíveis: Admin (acesso total), Operador (gerencia telas e playlists), Analista (somente visualização), Financeiro (pagamentos e relatórios).",
      "O convite é enviado via WhatsApp. O novo membro faz login com OTP no número cadastrado.",
    ],
  },
  {
    id: "a10", category: "campaigns", status: "video",
    title: "Usando o Audience Builder para segmentar campanhas",
    views: 1340, helpful: 97, readMin: 7, tags: ["audience","segmentação","targeting"],
    body: [
      "O Audience Builder permite criar segmentos com filtros de idade, gênero, horário, localização, renda e interesse.",
      "Cada segmento mostra o alcance estimado e o CPM esperado em tempo real.",
      "Segmentos podem ser salvos e reutilizados em múltiplas campanhas.",
    ],
  },
];

const POPULAR = ARTICLES.sort((a, b) => b.views - a.views).slice(0, 4);

export default function HelpCenter({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const filtered = ARTICLES.filter(a => {
    const matchCat = cat === "all" || a.category === cat;
    const q = query.toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || a.body.some(b => b.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Central de Ajuda</h1>
          <p className="text-xs" style={{ color: T.textSub }}>38 artigos · atualizado hoje</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onNavigate?.("whatsapp")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}
          >
            <MessageCircle size={15} /> Suporte via WhatsApp
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero search */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Como podemos ajudar?</h2>
          <p className="mb-6" style={{ color: T.textSub }}>Busque artigos, tutoriais e guias da plataforma.</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: como instalar, proofchain, upgrade de plano..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}
            />
          </div>
        </div>

        {/* Popular when no search */}
        {!query && cat === "all" && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: T.textSub }}>Artigos mais acessados</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {POPULAR.map(a => (
                <button
                  key={a.id}
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                  className="text-left p-4 rounded-2xl border transition-colors hover:border-opacity-60"
                  style={{ background: T.card, borderColor: T.border }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{a.title}</span>
                    {a.status === "video" && (
                      <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: T.danger + "20", color: T.danger }}>
                        <Play size={10} /> Vídeo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.textSub }}><Clock size={11} /> {a.readMin} min</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.success }}><ThumbsUp size={11} /> {a.helpful}%</span>
                    <span className="text-xs" style={{ color: T.textSub }}>{a.views.toLocaleString("pt-BR")} visualizações</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Categories sidebar */}
          <aside className="w-44 shrink-0 hidden md:block">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: T.textSub }}>Categorias</p>
            <ul className="space-y-1">
              {CATEGORIES.map(c => {
                const Icon = c.icon;
                const isActive = cat === c.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setCat(c.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors"
                      style={{
                        background: isActive ? T.primary + "20" : "transparent",
                        color: isActive ? T.primary : T.textSub,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <span className="flex items-center gap-2"><Icon size={13} /> {c.label}</span>
                      <span className="text-xs" style={{ color: isActive ? T.primary : T.textSub }}>{c.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} style={{ color: T.gold }} />
                <span className="text-xs font-bold" style={{ color: T.gold }}>DOOH AI</span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: T.textSub }}>
                Pergunte ao assistente de IA da plataforma diretamente.
              </p>
              <button
                onClick={() => onNavigate?.("ai-assistant")}
                className="w-full py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: T.gold + "20", color: T.gold }}
              >
                Abrir assistente
              </button>
            </div>
          </aside>

          {/* Article list */}
          <div className="flex-1 min-w-0">
            <p className="text-xs mb-4" style={{ color: T.textSub }}>
              {filtered.length} artigo{filtered.length !== 1 ? "s" : ""}
              {query ? ` para "${query}"` : ""}
            </p>
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="py-16 text-center" style={{ color: T.textSub }}>
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Nenhum artigo encontrado</p>
                  <p className="text-xs mt-1">Tente outros termos ou fale com o suporte</p>
                </div>
              )}
              {filtered.map(a => (
                <div key={a.id} className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
                  <button
                    onClick={() => setOpenId(openId === a.id ? null : a.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">
                        {a.status === "video"
                          ? <Play size={14} style={{ color: T.danger }} />
                          : <FileText size={14} style={{ color: T.primary }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{a.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs" style={{ color: T.textSub }}><Clock size={10} /> {a.readMin} min</span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: T.success }}><ThumbsUp size={10} /> {a.helpful}%</span>
                          {a.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: T.border, color: T.textSub }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={16} className="shrink-0 transition-transform ml-2" style={{ color: T.textSub, transform: openId === a.id ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>

                  {openId === a.id && (
                    <div className="px-6 pb-5 border-t" style={{ borderColor: T.border }}>
                      <div className="pt-4 space-y-3">
                        {a.body.map((line, i) => (
                          <div key={`${a.id}-line-${i}`} className="flex gap-3">
                            <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: T.primary + "20", color: T.primary }}>{i + 1}</span>
                            <p className="text-sm leading-relaxed" style={{ color: T.textSub }}>{line}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-5 pt-4 border-t" style={{ borderColor: T.border }}>
                        <span className="text-xs" style={{ color: T.textSub }}>Este artigo foi útil?</span>
                        <button
                          onClick={() => setVoted(v => ({ ...v, [a.id]: true }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: voted[a.id] ? T.success + "20" : T.border, color: voted[a.id] ? T.success : T.textSub }}
                        >
                          <ThumbsUp size={12} /> Sim
                        </button>
                        <button
                          onClick={() => setVoted(v => ({ ...v, [a.id]: false }))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: T.border, color: T.textSub }}
                        >
                          <ThumbsDown size={12} /> Não
                        </button>
                        <button
                          onClick={() => onNavigate?.("support")}
                          className="ml-auto flex items-center gap-1.5 text-xs"
                          style={{ color: T.primary }}
                        >
                          Abrir ticket <ExternalLink size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
