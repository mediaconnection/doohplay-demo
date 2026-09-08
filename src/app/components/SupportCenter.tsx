import { useState } from "react";
import {
  ArrowLeft, MessageCircle, Plus, Search, CheckCircle, Clock, AlertCircle,
  ChevronRight, User, Send, Paperclip, X, Tag, Filter, Zap, BookOpen,
  ThumbsUp, Star
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: number;
  assignee?: string;
  description: string;
}

const ST_COLOR: Record<TicketStatus, string> = {
  open: T.primary, in_progress: T.warning, resolved: T.success, closed: T.textSub,
};
const ST_LABEL: Record<TicketStatus, string> = {
  open: "Aberto", in_progress: "Em andamento", resolved: "Resolvido", closed: "Fechado",
};
const PR_COLOR: Record<TicketPriority, string> = {
  low: T.textSub, medium: T.primary, high: T.warning, urgent: T.danger,
};
const PR_LABEL: Record<TicketPriority, string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};

const TICKETS: Ticket[] = [
  { id: "TKT-2024-0081", subject: "Tela offline há 2h — Shopping Ibirapuera P3",    requester: "Carlos Mendes",  category: "Hardware",   priority: "urgent",  status: "in_progress", createdAt: "23/07 08:30", updatedAt: "23/07 10:00", messages: 4, assignee: "Diego Suporte", description: "A tela P3 no piso 2 do Shopping Ibirapuera está offline. Não responde ao heartbeat e o painel mostra erro de rede." },
  { id: "TKT-2024-0080", subject: "Campanha não está veiculando no horário correto", requester: "Aline Ferreira", category: "Campanhas",  priority: "high",    status: "open",        createdAt: "23/07 07:15", updatedAt: "23/07 07:15", messages: 1, assignee: undefined,      description: "Programei a campanha para rodar das 18h às 22h mas ela está rodando em outros horários também." },
  { id: "TKT-2024-0079", subject: "Erro ao fazer upload de vídeo 4K",               requester: "Fernanda Castro",category: "Plataforma", priority: "medium",  status: "in_progress", createdAt: "22/07 16:40", updatedAt: "23/07 09:00", messages: 6, assignee: "Ana Dev",      description: "Ao tentar enviar um arquivo .mp4 4K (3840x2160), o upload falha com erro 413 após 80% de progresso." },
  { id: "TKT-2024-0078", subject: "Relatório de impressões com dados incorretos",   requester: "Diego Santos",   category: "Relatórios", priority: "medium",  status: "open",        createdAt: "22/07 14:00", updatedAt: "22/07 14:00", messages: 2, assignee: undefined,      description: "Os dados de impressões do mês de junho estão mostrando valores diferentes do ProofChain." },
  { id: "TKT-2024-0077", subject: "Dificuldade em integrar API com sistema ERP",    requester: "Paulo Teixeira", category: "API",        priority: "low",     status: "open",        createdAt: "21/07 11:20", updatedAt: "21/07 11:20", messages: 3, assignee: undefined,      description: "Seguindo a documentação, mas a autenticação OAuth está retornando 401 mesmo com token válido." },
  { id: "TKT-2024-0076", subject: "Solicitação de nota fiscal complementar",        requester: "Lucia Nunes",    category: "Financeiro", priority: "low",     status: "resolved",    createdAt: "20/07 09:00", updatedAt: "22/07 15:00", messages: 5, assignee: "Maria Fin",    description: "Preciso de nota fiscal complementar para os meses de maio e junho para prestação de contas." },
  { id: "TKT-2024-0075", subject: "App Android travando ao abrir tela de stats",    requester: "Roberto Lima",   category: "Mobile",     priority: "medium",  status: "resolved",    createdAt: "19/07 17:30", updatedAt: "21/07 10:00", messages: 8, assignee: "Pedro Mobile", description: "O app v0.7.1 congela ao tentar abrir a aba de Estatísticas com mais de 10 telas vinculadas." },
];

const FAQ = [
  { q: "Como adicionar uma nova tela à plataforma?", a: "Acesse Inventário → Telas → + Nova Tela. Instale o app DOOHPLAY no dispositivo Android e use o código de pareamento exibido.", views: 842 },
  { q: "O que é o ProofChain e como funciona?", a: "ProofChain é nossa camada de prova criptográfica. Cada exibição gera um hash RSA-SHA256, que é agregado em uma Merkle Tree e registrado no Polygon Blockchain.", views: 621 },
  { q: "Como configurar o horário de veiculação de uma campanha?", a: "Em Campanhas → Agendador, você pode definir dias da semana e faixas horárias. Use o modo Avançado para regras por tela individual.", views: 534 },
  { q: "Posso integrar o DOOHPLAY com meu DSP externo?", a: "Sim. Acesse Programático → Deals → New Deal e selecione o tipo PMP ou PG. A integração usa OpenRTB 2.6 via endpoint autorizado.", views: 398 },
  { q: "Como exportar dados de audiência para o cliente?", a: "Em Exportação de Dados, selecione o dataset Audiência, escolha o período e o formato (PDF para apresentações ou CSV para análise).", views: 287 },
];

export default function SupportCenter({ onBack, onNavigate }: Props) {
  const [tab, setTab]             = useState<"tickets" | "new" | "faq">("tickets");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [reply, setReply]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [newSubject, setNewSubject]   = useState("");
  const [newCategory, setNewCategory] = useState("Plataforma");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newDesc, setNewDesc]         = useState("");

  const filtered = TICKETS.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.requester.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount     = TICKETS.filter(t => t.status === "open").length;
  const inProgCount   = TICKETS.filter(t => t.status === "in_progress").length;
  const resolvedCount = TICKETS.filter(t => t.status === "resolved").length;

  function submitTicket() {
    setSubmitted(true);
    setTimeout(() => { setTab("tickets"); setSubmitted(false); setNewSubject(""); setNewDesc(""); }, 1500);
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <MessageCircle size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Central de Suporte</h1>
                <p className="text-xs" style={{ color: T.textSub }}>
                  {openCount > 0 ? <span style={{ color: T.warning }}>{openCount} aberto{openCount > 1 ? "s" : ""} aguardando</span> : "Tudo em dia"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["tickets","new","faq"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "tickets" ? "Tickets" : t === "new" ? "+ Novo Ticket" : "FAQ"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-5">

          {tab === "tickets" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Abertos",      value: openCount,     color: T.primary, icon: AlertCircle },
                  { label: "Em andamento", value: inProgCount,   color: T.warning, icon: Clock       },
                  { label: "Resolvidos",   value: resolvedCount, color: T.success, icon: CheckCircle },
                  { label: "SLA Médio",    value: "3.2h",        color: T.gold,    icon: Zap         },
                ].map((k, i) => (
                  <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                      <k.icon size={15} style={{ color: k.color }} />
                    </div>
                    <div>
                      <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-44">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar tickets..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                {(["all","open","in_progress","resolved","closed"] as const).map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: statusFilter === f ? (ST_COLOR[f as TicketStatus] || T.primary) + "20" : T.card, color: statusFilter === f ? (ST_COLOR[f as TicketStatus] || T.primary) : T.textSub, border: `1px solid ${statusFilter === f ? (ST_COLOR[f as TicketStatus] || T.primary) + "30" : T.border}` }}>
                    {f === "all" ? "Todos" : ST_LABEL[f as TicketStatus]}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filtered.map(ticket => (
                  <div key={ticket.id} onClick={() => setSelected(selected?.id === ticket.id ? null : ticket)}
                    className="p-4 rounded-2xl border cursor-pointer transition-all hover:border-opacity-80"
                    style={{ background: T.card, borderColor: selected?.id === ticket.id ? T.primary : T.border, borderLeft: `3px solid ${PR_COLOR[ticket.priority]}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-black text-sm">{ticket.subject}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: ST_COLOR[ticket.status] + "20", color: ST_COLOR[ticket.status] }}>
                            {ST_LABEL[ticket.status]}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{ background: PR_COLOR[ticket.priority] + "15", color: PR_COLOR[ticket.priority] }}>
                            {PR_LABEL[ticket.priority]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: T.textSub }}>
                          <span><User size={9} className="inline mr-1" />{ticket.requester}</span>
                          <span><Tag size={9} className="inline mr-1" />{ticket.category}</span>
                          <span><Clock size={9} className="inline mr-1" />{ticket.updatedAt}</span>
                          <span><MessageCircle size={9} className="inline mr-1" />{ticket.messages} msgs</span>
                          <span className="font-mono">{ticket.id}</span>
                        </div>
                      </div>
                      {ticket.assignee && (
                        <div className="text-xs text-right flex-shrink-0" style={{ color: T.textSub }}>
                          <div className="font-bold">{ticket.assignee}</div>
                          <div>Responsável</div>
                        </div>
                      )}
                    </div>
                    {selected?.id === ticket.id && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: T.border + "60" }}>
                        <p className="text-xs mb-3" style={{ color: T.textSub }}>{ticket.description}</p>
                        <div className="flex items-center gap-2">
                          <input value={reply} onChange={e => setReply(e.target.value)}
                            placeholder="Escrever resposta..."
                            className="flex-1 px-3 py-2 rounded-xl text-xs"
                            style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                          <button className="p-2 rounded-xl" style={{ background: T.primary + "20", color: T.primary }}>
                            <Paperclip size={13} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setReply(""); }}
                            className="p-2 rounded-xl text-xs font-black flex items-center gap-1"
                            style={{ background: T.primary, color: "#fff" }}>
                            <Send size={13} /> Enviar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "new" && (
            <div className="max-w-xl space-y-4">
              <h3 className="font-black text-lg">Abrir Novo Ticket</h3>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>ASSUNTO</label>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  placeholder="Descreva brevemente o problema..."
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>CATEGORIA</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {["Hardware","Plataforma","Campanhas","Relatórios","API","Mobile","Financeiro","Outros"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>PRIORIDADE</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["low","medium","high","urgent"] as TicketPriority[]).map(p => (
                      <button key={p} onClick={() => setNewPriority(p)}
                        className="py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: newPriority === p ? PR_COLOR[p] + "25" : T.card, color: newPriority === p ? PR_COLOR[p] : T.textSub, border: `1px solid ${newPriority === p ? PR_COLOR[p] + "40" : T.border}` }}>
                        {PR_LABEL[p]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: T.textSub }}>DESCRIÇÃO</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir, mensagens de erro, etc."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <button onClick={submitTicket} disabled={!newSubject || !newDesc}
                className="w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all"
                style={{ background: submitted ? T.success : T.primary, color: submitted ? "#000" : "#fff", opacity: (!newSubject || !newDesc) ? 0.5 : 1 }}>
                {submitted ? <><CheckCircle size={18} /> Ticket criado!</> : <><Send size={18} /> Abrir Ticket</>}
              </button>
            </div>
          )}

          {tab === "faq" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 p-4 rounded-2xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <BookOpen size={16} style={{ color: T.primary }} />
                <span className="text-sm">Base de conhecimento DOOHPLAY · {FAQ.length} artigos populares</span>
              </div>
              {FAQ.map((item, i) => (
                <details key={i} className="p-4 rounded-2xl border cursor-pointer" style={{ background: T.card, borderColor: T.border }}>
                  <summary className="font-black text-sm list-none flex items-center justify-between">
                    <span>{item.q}</span>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-xs font-normal" style={{ color: T.textSub }}>{item.views} views</span>
                      <ChevronRight size={14} style={{ color: T.textSub }} />
                    </div>
                  </summary>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: T.textSub }}>{item.a}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs" style={{ color: T.textSub }}>Isso foi útil?</span>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{ background: T.success + "15", color: T.success }}>
                      <ThumbsUp size={10} /> Sim
                    </button>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-black text-sm mb-4">SLA Garantido</h3>
            {[
              { label: "Urgente",  sla: "< 1h",  color: T.danger  },
              { label: "Alta",     sla: "< 4h",  color: T.warning },
              { label: "Média",    sla: "< 24h", color: T.primary },
              { label: "Baixa",    sla: "< 72h", color: T.textSub },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-bold">{s.label}</span>
                </div>
                <span className="text-xs font-black" style={{ color: s.color }}>{s.sla}</span>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-black text-sm mb-4">Contato Direto</h3>
            {[
              { label: "WhatsApp", value: "+55 11 9xxxx-xxxx",     color: T.success },
              { label: "E-mail",   value: "suporte@doohplay.com.br", color: T.primary },
              { label: "Horário",  value: "Seg–Sex 8h–20h",           color: T.textSub },
            ].map((c, i) => (
              <div key={i} className="mb-3">
                <div className="text-xs font-bold mb-0.5" style={{ color: c.color }}>{c.label}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{c.value}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl border" style={{ background: T.success + "08", borderColor: T.success + "20" }}>
            <div className="flex items-center gap-2 mb-1">
              <Star size={13} style={{ color: T.gold }} />
              <span className="text-xs font-black" style={{ color: T.gold }}>CSAT Médio</span>
            </div>
            <div className="font-black text-3xl" style={{ color: T.gold }}>4.8<span className="text-base font-normal" style={{ color: T.textSub }}>/5</span></div>
            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Baseado em 184 avaliações</div>
          </div>
        </div>
      </div>
    </div>
  );
}
