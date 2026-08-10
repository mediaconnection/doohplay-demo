import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Bot, Sparkles, TrendingUp, DollarSign, Shield, Zap, ChevronRight, X, RefreshCw, Star, Clock, BarChart2, Lightbulb } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: { label: string; view: string }[];
  chips?: string[];
  time: string;
}

interface Insight {
  id: string;
  title: string;
  body: string;
  impact: string;
  icon: string;
  color: string;
  view?: string;
}

const INSIGHTS: Insight[] = [
  { id: "i1", title: "Prime Time est\u00e1 subutilizado", body: "Seu fill rate das 18h\u201321h \u00e9 67% \u2014 m\u00e9dia da rede \u00e9 94%. Ativando 2 anunciantes em espera voc\u00ea recupera R$180/m\u00eas.", impact: "+R$180/m\u00eas", icon: "\u26a1", color: T.warning, view: "content-calendar" },
  { id: "i2", title: "3 propostas aguardam resposta", body: "Nike, Gillette e Nubank enviaram propostas para sua tela. Responder em menos de 24h aumenta a taxa de aceite em 2.4\u00d7.", impact: "+R$1.820/m\u00eas", icon: "\ud83d\udcbc", color: T.primary, view: "marketplace" },
  { id: "i3", title: "CPM pode subir com ProofChain", body: "Telas com ProofChain verificado cobram CPM 41% maior. Sua tela est\u00e1 eleg\u00edvel para o badge verificado.", impact: "CPM +41%", icon: "\ud83d\udd10", color: T.success, view: "proofchain-center" },
  { id: "i4", title: "Meta de julho em risco", body: "Voc\u00ea est\u00e1 a R$353 da meta de R$1.200 com 8 dias restantes. No ritmo atual projeta R$847.", impact: "R$353 restantes", icon: "\ud83c\udfaf", color: T.danger, view: "goals" },
  { id: "i5", title: "Dispositivo SCR-ZIM001 lento", body: "CPU acima de 85% nos \u00faltimos 30 min. Isso pode causar travamento de playlist. Reinicializa\u00e7\u00e3o preventiva recomendada.", impact: "Risco de offline", icon: "\u26a0\ufe0f", color: T.warning, view: "device-manager" },
];

const KNOWLEDGE: Record<string, { reply: string; actions?: { label: string; view: string }[]; chips?: string[] }> = {
  receita: {
    reply: "Analisei sua conta e identifiquei **3 oportunidades imediatas** para aumentar sua receita:\n\n1. **Fill rate Prime Time (18h\u201321h)**: Atualmente 67% vs 94% da rede. Adicionar anunciantes nesse hor\u00e1rio pode render +R$180/m\u00eas\n2. **CPM com ProofChain**: Seu CPM atual \u00e9 R$36. Com verifica\u00e7\u00e3o ProofChain ativa, a m\u00e9dia sobe para R$51 (+41%)\n3. **Propostas pendentes**: Nike e Gillette aguardam resposta h\u00e1 2 dias \u2014 total de R$1.420/m\u00eas em jogo\n\nQuer que eu aplique essas otimiza\u00e7\u00f5es automaticamente?",
    actions: [{ label: "Ver Otimizador", view: "revenue-optimizer" }, { label: "Propostas pendentes", view: "marketplace" }],
    chips: ["Como aumentar o CPM?", "Qual meu potencial m\u00e1ximo?"],
  },
  playlist: {
    reply: "Sua playlist atual tem **3 pontos de melhoria**:\n\n- **Peso do sorteio**: An\u00fancios premium t\u00eam peso 10% \u2014 poderiam ter 25% sem prejudicar a experi\u00eancia\n- **Slot noturno (22h\u20136h)**: Apenas 2 itens \u2014 fill rate de 41%. Canais DOOHPLAY preenchem automaticamente\n- **Dura\u00e7\u00e3o m\u00e9dia**: 42s/loop \u00e9 alto. Pe\u00e7as de 15s t\u00eam 23% mais reten\u00e7\u00e3o de audi\u00eancia\n\nPosso ajustar a configura\u00e7\u00e3o para voc\u00ea?",
    actions: [{ label: "Editar Playlist", view: "playlist" }, { label: "Canal DOOHPLAY", view: "content-studio" }],
    chips: ["Como funciona o sorteio ponderado?", "Qual dura\u00e7\u00e3o ideal?"],
  },
  prova: {
    reply: "O **ProofChain DOOHPLAY** usa 4 camadas de verifica\u00e7\u00e3o:\n\n1. **RSA-SHA256**: Cada exibi\u00e7\u00e3o gera uma assinatura criptogr\u00e1fica \u00fanica\n2. **Merkle Tree**: Grupos de provas s\u00e3o combinados em \u00e1rvores de hash\n3. **Polygon PoS**: A raiz Merkle \u00e9 ancorada na blockchain p\u00fablica\n4. **TSA RFC3161**: Timestamp certificado pela ICP-Brasil\n\nQualquer pessoa pode verificar em **verify.doohplay.com.br** usando o c\u00f3digo da prova. Isso garante que nenhuma exibi\u00e7\u00e3o pode ser fraudada ou removida.",
    actions: [{ label: "Verificar uma prova", view: "proof-verifier" }, { label: "Explorar ProofChain", view: "proofchain-center" }],
    chips: ["Gerar relat\u00f3rio de provas", "Compartilhar com anunciante"],
  },
  meta: {
    reply: "Para sua **meta de R$1.200 em julho** voc\u00ea precisa de +R$353 nos pr\u00f3ximos 8 dias (R$44/dia).\n\nCaminhos mais r\u00e1pidos:\n- Aceitar proposta da Nike hoje: +R$800/m\u00eas imediato\n- Ativar an\u00fancio Gillette: +R$600/m\u00eas\n- Aumentar peso Prime Time: +R$180/m\u00eas gradual\n\nCom os dois primeiros voc\u00ea ultrapassa a meta ainda essa semana. Quer que eu monte um plano de a\u00e7\u00e3o?",
    actions: [{ label: "Ver Metas", view: "goals" }, { label: "Propostas aguardando", view: "marketplace" }],
    chips: ["Criar plano de a\u00e7\u00e3o", "Quanto posso faturar por m\u00eas?"],
  },
  ajuda: {
    reply: "Posso te ajudar com:\n\n\ud83d\udcca **An\u00e1lise** \u2014 revenue, impress\u00f5es, fill rate, CPM\n\ud83c\udfaf **Metas** \u2014 acompanhamento e proje\u00e7\u00f5es\n\ud83d\udcfa **Conte\u00fado** \u2014 playlist, sorteio ponderado, canal DOOHPLAY\n\ud83d\udd10 **Provas** \u2014 como funciona o ProofChain, verifica\u00e7\u00e3o\n\ud83d\udcb0 **Monetiza\u00e7\u00e3o** \u2014 otimizar receita, propostas, CPM\n\ud83d\udd27 **Dispositivos** \u2014 alertas de hardware, reinicializa\u00e7\u00e3o\n\ud83d\udce3 **Campanhas** \u2014 criar, monitorar, relat\u00f3rios\n\nO que voc\u00ea quer explorar?",
    chips: ["Aumentar minha receita", "Entender ProofChain", "Atingir minha meta"],
  },
};

function getReply(msg: string): typeof KNOWLEDGE[string] {
  const lower = msg.toLowerCase();
  if (lower.includes("receit") || lower.includes("ganh") || lower.includes("dinheiro") || lower.includes("fatur") || lower.includes("cpM") || lower.includes("monetiz")) return KNOWLEDGE.receita;
  if (lower.includes("playlist") || lower.includes("conte\u00fado") || lower.includes("video") || lower.includes("sorteio") || lower.includes("peso")) return KNOWLEDGE.playlist;
  if (lower.includes("prova") || lower.includes("proof") || lower.includes("blockchain") || lower.includes("verif")) return KNOWLEDGE.prova;
  if (lower.includes("meta") || lower.includes("objetivo") || lower.includes("julho") || lower.includes("meta")) return KNOWLEDGE.meta;
  return KNOWLEDGE.ajuda;
}

function formatMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <div key={i} className="font-black mt-2">{line.slice(2, -2)}</div>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i} className={line.startsWith("-") || /^\d+\./.test(line) ? "ml-2" : ""}>
        {parts.map((p, j) => p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}
      </div>
    );
  });
}

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  session?: { name?: string } | null;
}

export default function AIAssistant({ onBack, onNavigate, session }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0", role: "assistant",
      content: `Ol\u00e1${session?.name ? `, ${session.name}` : ""}! \ud83d\udc4b Sou o **DOOH AI**, seu assistente inteligente.\n\nAnalisei sua conta e tenho **5 insights importantes** para voc\u00ea hoje. Tamb\u00e9m posso responder qualquer pergunta sobre receita, conte\u00fado, provas ou dispositivos.`,
      chips: ["Aumentar minha receita", "Atingir meta de julho", "Como funciona ProofChain", "Ajuda geral"],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "insights">("insights");
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text?: string) => {
    const msgText = text ?? input.trim();
    if (!msgText) return;
    const userMsg: Message = {
      id: `m${Date.now()}`, role: "user", content: msgText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { reply, actions, chips } = getReply(msgText);
      const botMsg: Message = {
        id: `m${Date.now() + 1}`, role: "assistant", content: reply, actions, chips,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const visibleInsights = INSIGHTS.filter(i => !dismissedInsights.has(i.id));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-shrink-0 sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
              <Bot size={18} color="#fff" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-pulse"
                style={{ background: T.success, borderColor: T.panel }} />
            </div>
            <div>
              <h1 className="font-black text-lg">DOOH AI</h1>
              <p className="text-xs" style={{ color: T.success }}>\u25cf Ativo \u00b7 Powered by Gemini</p>
            </div>
          </div>
          <div className="ml-auto text-xs px-2.5 py-1 rounded-full" style={{ background: T.gold + "15", color: T.gold }}>
            {visibleInsights.length} insights
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["insights", "chat"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
              style={{ borderColor: activeTab === t ? T.primary : "transparent", color: activeTab === t ? T.primary : T.textSub }}>
              {t === "insights" ? `Insights (${visibleInsights.length})` : "Chat"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "insights" && (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-6 py-6 space-y-4">
          {visibleInsights.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">\u2728</div>
              <h3 className="font-bold text-lg mb-1">Tudo em ordem!</h3>
              <p style={{ color: T.textSub }}>Sem insights pendentes. Continuarei monitorando.</p>
            </div>
          ) : (
            visibleInsights.map(ins => (
              <div key={ins.id} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: ins.color + "25" }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{ins.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">{ins.title}</h3>
                      <button onClick={() => setDismissedInsights(prev => new Set([...prev, ins.id]))} className="p-0.5 rounded hover:bg-white/10">
                        <X size={12} style={{ color: T.textSub }} />
                      </button>
                    </div>
                    <p className="text-sm" style={{ color: T.textSub }}>{ins.body}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: ins.color + "15", color: ins.color }}>{ins.impact}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { send(`Me explique mais sobre: ${ins.title}`); setActiveTab("chat"); }}
                      className="text-xs px-3 py-1.5 rounded-xl border hover:bg-white/5" style={{ borderColor: T.border, color: T.textSub }}>Mais detalhes</button>
                    {ins.view && (
                      <button onClick={() => onNavigate?.(ins.view!)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-bold hover:opacity-90"
                        style={{ background: ins.color, color: ins.color === T.warning ? "#05060E" : ins.color === T.success ? "#05060E" : "#fff" }}>
                        Resolver <ChevronRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-6 py-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    <Bot size={14} color="#fff" />
                  </div>
                )}
                <div className={`max-w-sm space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === "user" ? T.primary : T.card,
                      color: T.text,
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      border: msg.role === "assistant" ? `1px solid ${T.border}` : "none",
                    }}>
                    <div className="space-y-0.5">{formatMarkdown(msg.content)}</div>
                    <div className="text-xs mt-1.5" style={{ color: msg.role === "user" ? "#ffffff60" : T.textSub }}>{msg.time}</div>
                  </div>
                  {msg.actions && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.actions.map((a, i) => (
                        <button key={i} onClick={() => onNavigate?.(a.view)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-bold hover:opacity-90"
                          style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                          {a.label} <ChevronRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.chips.map((c, i) => (
                        <button key={i} onClick={() => send(c)}
                          className="text-xs px-2.5 py-1 rounded-full border hover:bg-white/5 transition-all"
                          style={{ borderColor: T.border, color: T.textSub }}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div className="px-4 py-3 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: T.primary, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex-shrink-0 border-t p-4" style={{ borderColor: T.border, background: T.panel }}>
            <div className="max-w-2xl mx-auto flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Pergunte sobre receita, playlist, provas..."
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
              <button onClick={() => send()} disabled={!input.trim() || typing}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                <Send size={16} color="#fff" />
              </button>
            </div>
            <div className="max-w-2xl mx-auto flex gap-2 mt-2 flex-wrap">
              {["Aumentar receita", "Status da tela", "Meta de julho", "Pr\u00f3xima a\u00e7\u00e3o"].map((s, i) => (
                <button key={i} onClick={() => send(s)} className="text-xs px-2.5 py-1 rounded-full border hover:bg-white/5" style={{ borderColor: T.border, color: T.textSub }}>{s}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
