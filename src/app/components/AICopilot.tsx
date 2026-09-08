import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Send, Sparkles, BarChart2, Megaphone, Map, DollarSign,
  TrendingUp, RefreshCw, Copy, ThumbsUp, ThumbsDown, Zap, User
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Role = "user" | "assistant";
interface Message { id: number; role: Role; content: string; typing?: boolean; }

const SUGGESTIONS = [
  { icon: BarChart2,  label: "Analise minha performance esta semana" },
  { icon: Megaphone,  label: "Crie um plano de mídia para Black Friday" },
  { icon: Map,        label: "Quais regiões têm melhor CPM?" },
  { icon: DollarSign, label: "Como otimizar meu budget de R$50k?" },
  { icon: TrendingUp, label: "Preveja impressões para próximo mês" },
  { icon: Zap,        label: "Sugira criativos para campanha de varejo" },
];

const RESPONSES: Record<string, string> = {
  default: `Olá! Sou o **Gemini DOOH Copilot**, seu assistente de inteligência artificial especializado em publicidade Out-of-Home. Posso ajudar com:\n\n- 📊 **Análise de performance** de campanhas e telas\n- 🗺️ **Planejamento de mídia** com recomendações por região\n- 💰 **Otimização de budget** e CPM\n- 🎯 **Segmentação de audiência** baseada em dados reais\n- 📈 **Previsões** de impressões e ROI\n\nComo posso ajudar você hoje?`,

  performance: `## Análise de Performance — Semana Atual\n\nAqui está um resumo da sua performance esta semana:\n\n**Destaques positivos:**\n- CTR médio de **4.8%** — 14% acima da média do setor\n- Telas outdoor em SP com **ROI de 5.2x** (melhor da rede)\n- Campanha Ambev atingiu 98% do objetivo de awareness\n\n**Pontos de atenção:**\n- 3 telas offline em Recife — impacto estimado de R$2.4k/dia\n- CTR de criativos estáticos 40% abaixo dos dinâmicos\n- Orçamento campanha iFood: 78% consumido com 45% do período\n\n**Recomendação:** Migre pelo menos 30% do inventário de criativos estáticos para dinâmicos. Baseado em dados históricos, isso pode aumentar seu CTR médio em 1.8-2.4pp.\n\nQuer que eu gere um plano detalhado de migração?`,

  planejamento: `## Plano de Mídia — Black Friday 2025\n\n**Objetivo:** Maximizar conversões | Período: 20/11 a 30/11\n\n### Distribuição de Budget Recomendada\n\n| Canal | % Budget | Telas | CPM Est. | Imp. Proj. |\n|-------|----------|-------|----------|------------|\n| Outdoor SP/RJ | 35% | 48 | R$58 | 12.1M |\n| Retail (malls) | 28% | 89 | R$42 | 13.3M |\n| Trânsito | 22% | 120 | R$36 | 12.2M |\n| Aeroportos | 15% | 18 | R$82 | 3.7M |\n\n**Total projetado:** 41.3M impressões | CPM médio R$48 | ROI estimado **4.6x**\n\n### Horários de pico recomendados:\n- **Varejo:** 12h–14h e 18h–21h (pico de intenção de compra)\n- **Outdoor:** 7h–9h e 17h–20h (hora do rush)\n- **Aeroportos:** 6h–8h e 16h–18h\n\nPosso criar essa campanha diretamente no Campaign Wizard. Quer prosseguir?`,

  regioes: `## CPM por Região — Brasil\n\nBaseado nos dados de outubro de 2025:\n\n**Melhores CPMs:**\n1. 🥇 Aeroporto Congonhas (SP) — **R$94/mil**\n2. 🥈 Faria Lima / Itaim (SP) — **R$78/mil**\n3. 🥉 Ipanema/Leblon (RJ) — **R$72/mil**\n4. Aeroporto GRU — **R$88/mil**\n5. Shopping JK (SP) — **R$65/mil**\n\n**Melhor custo-benefício (CPM × Volume):**\n- Trânsito Grande SP — R$36/mil · 215 telas · 8.4M imp/dia\n- Nordeste (Recife + Fortaleza) — R$40/mil · mercado com baixa saturação\n\n**Insight:** Nordeste está com inventário 23% abaixo da demanda. Anunciantes early-adopter estão conseguindo CPMs 30% abaixo do mercado com performance similar ao Sudeste.`,

  budget: `## Otimização de Budget — R$50.000\n\nPara maximizar seu ROI com R$50k, recomendo a seguinte estratégia:\n\n### Alocação Otimizada\n\n**R$17.500 (35%) — Outdoor premium SP**\n- 12 telas Paulista + Faria Lima\n- 7.2M impressões projetadas\n- ROI esperado: 5.1x\n\n**R$14.000 (28%) — Retail media**\n- 25 telas em malls tier-1\n- 6.7M impressões\n- Melhor para conversão direta\n\n**R$11.000 (22%) — Trânsito**\n- Metrô SP + BRT RJ\n- 6.1M impressões — melhor alcance por real\n- ROI esperado: 4.2x\n\n**R$7.500 (15%) — Reserva para A/B test**\n- Teste criativo estático vs dinâmico\n- Resultado em 72h para realocar verba\n\n**Projeção total:** 20M impressões | CPM médio R$46 | **ROI estimado 4.8x**\n\nDevo criar essas campanhas automaticamente?`,

  previsao: `## Previsão de Impressões — Próximo Mês\n\nCom base em sazonalidade histórica e tendências atuais:\n\n**Novembro 2025 — Projeção**\n\n| Semana | Imp. Proj. | Variação | Motivo |\n|--------|-----------|----------|--------|\n| 03–09/11 | 312M | +8% | Alta por eleições locais |\n| 10–16/11 | 298M | baseline | — |\n| 17–23/11 | 348M | +17% | Pré-Black Friday |\n| 24–30/11 | 412M | +39% | Black Friday + Cyber Monday |\n\n**Total projetado:** 1.37 bilhões de impressões\n\n**Oportunidade identificada:** Black Friday semana (+39%) com inventário ainda 34% disponível. Anunciantes que reservarem até 15/11 terão acesso ao melhor inventário com CPM padrão.\n\nQuer que eu envie alertas automáticos quando o inventário dessa semana atingir 80% de ocupação?`,

  criativos: `## Sugestões de Criativos — Campanha Varejo\n\nBaseado em análise de 2.400+ criativos DOOH na plataforma:\n\n**O que funciona em varejo (dados de performance):**\n\n✅ **Formato recomendado:** Vídeo 6–10s (CTR 2.3x maior que estáticos)\n✅ **Mensagem:** Oferta com número específico ("50% OFF" > "Grande desconto")\n✅ **Visual:** Produto em destaque com fundo limpo — sem texto em excesso\n✅ **CTA:** Uma ação clara no máximo ("Acesse o QR code" > "Visite nossa loja ou site")\n\n**Tendência de alta performance em 2025:**\n- Criativos com hora local dinâmica (+34% CTR)\n- Contador regressivo para fim de promoção (+28%)\n- Integração com clima ("Com esse calor...") +19%\n\n**Templates disponíveis na plataforma:**\n1. "Flash Sale" — Contador + produto + preço\n2. "Social Proof" — Avaliações reais + produto\n3. "Weather Trigger" — Muda com temperatura\n4. "Horário dinâmico" — Mensagem muda por período\n\nQuer que eu gere um brief criativo completo para sua campanha?`,
};

function detectIntent(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("performance") || m.includes("semana") || m.includes("analise") || m.includes("análise")) return "performance";
  if (m.includes("black friday") || m.includes("plano") || m.includes("mídia") || m.includes("midia")) return "planejamento";
  if (m.includes("região") || m.includes("regiao") || m.includes("cpm") || m.includes("regiões")) return "regioes";
  if (m.includes("budget") || m.includes("otimiz") || m.includes("r$") || m.includes("verba")) return "budget";
  if (m.includes("previsão") || m.includes("prev") || m.includes("proximo") || m.includes("próximo")) return "previsao";
  if (m.includes("criativo") || m.includes("varejo") || m.includes("formato")) return "criativos";
  return "default";
}

function renderMd(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) return <div key={i} className="font-black text-base mb-2 mt-4" style={{ color: T.text }}>{line.slice(3)}</div>;
    if (line.startsWith("### ")) return <div key={i} className="font-black text-sm mb-1.5 mt-3" style={{ color: T.primary }}>{line.slice(4)}</div>;
    if (line.startsWith("**") && line.endsWith("**")) return <div key={i} className="font-black text-sm mb-1" style={{ color: T.text }}>{line.slice(2,-2)}</div>;
    if (line.startsWith("- ") || line.startsWith("✅ ") || /^\d+\. /.test(line)) {
      return <div key={i} className="text-sm mb-0.5 ml-2" style={{ color: "#9BA3C8" }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${T.text}">$1</strong>`) }} />;
    }
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      return (
        <div key={i} className="flex gap-2 text-xs py-1 border-b" style={{ borderColor: T.border }}>
          {cells.map((c, j) => <div key={j} className="flex-1" style={{ color: c.startsWith("**") ? T.text : T.textSub }} dangerouslySetInnerHTML={{ __html: c.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`) }} />)}
        </div>
      );
    }
    if (line.trim() === "---" || line.trim() === "") return <div key={i} className="h-1" />;
    return (
      <div key={i} className="text-sm mb-1 leading-relaxed" style={{ color: "#9BA3C8" }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${T.text}">$1</strong>`) }} />
    );
  });
}

export default function AICopilot({ onBack }: Props) {
  const [messages, setMessages]   = useState<Message[]>([
    { id: 0, role: "assistant", content: RESPONSES.default },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const msgId                     = useRef(1);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: msgId.current++, role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const intent = detectIntent(text);
    const response = RESPONSES[intent] || RESPONSES.default;
    const typingMsg: Message = { id: msgId.current++, role: "assistant", content: "", typing: true };
    setMessages(m => [...m, typingMsg]);

    let i = 0;
    const chars = response.split("");
    const speed = 8;
    const reveal = () => {
      i += 3;
      if (i >= chars.length) {
        setMessages(m => m.map(msg => msg.typing ? { ...msg, content: response, typing: false } : msg));
        setLoading(false);
        return;
      }
      setMessages(m => m.map(msg => msg.typing ? { ...msg, content: chars.slice(0, i).join("") } : msg));
      setTimeout(reveal, speed);
    };
    setTimeout(reveal, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b flex-shrink-0" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                <Sparkles size={17} style={{ color: "#fff" }} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 animate-pulse" style={{ background: T.success, borderColor: T.bg }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Gemini DOOH Copilot</h1>
                <p className="text-xs" style={{ color: T.textSub }}>IA especializada em DOOH · Powered by Gemini 2.0</p>
              </div>
            </div>
          </div>
          <button onClick={() => { setMessages([{ id: 0, role: "assistant", content: RESPONSES.default }]); msgId.current = 1; }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
            <RefreshCw size={12} /> Nova conversa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: msg.role === "assistant" ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : T.card, border: msg.role === "user" ? `1px solid ${T.border}` : "none" }}>
                {msg.role === "assistant" ? <Sparkles size={14} style={{ color: "#fff" }} /> : <User size={14} style={{ color: T.textSub }} />}
              </div>
              <div className={`max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className="px-4 py-3 rounded-2xl"
                  style={{
                    background: msg.role === "user" ? T.primary + "20" : T.card,
                    border: `1px solid ${msg.role === "user" ? T.primary + "30" : T.border}`,
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  }}>
                  {msg.role === "user"
                    ? <p className="text-sm" style={{ color: T.text }}>{msg.content}</p>
                    : <div className="text-sm leading-relaxed">
                        {renderMd(msg.content)}
                        {msg.typing && <span className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm" style={{ background: T.primary }} />}
                      </div>
                  }
                </div>
                {msg.role === "assistant" && !msg.typing && msg.id > 0 && (
                  <div className="flex items-center gap-1 px-1">
                    {[{ icon: Copy, title: "Copiar" }, { icon: ThumbsUp, title: "Útil" }, { icon: ThumbsDown, title: "Melhorar" }].map(({ icon: Icon, title }) => (
                      <button key={title} title={title} className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                        <Icon size={11} style={{ color: T.textSub }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s.label} onClick={() => sendMessage(s.label)}
                className="flex items-center gap-2 p-3 rounded-xl text-xs text-left font-bold transition-all hover:scale-[1.01]"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                <s.icon size={13} style={{ color: T.primary }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 border-t px-6 py-4" style={{ background: T.panel, borderColor: T.border }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 p-3 rounded-2xl border"
            style={{ background: T.card, borderColor: loading ? T.primary + "40" : T.border }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre campanhas, performance, regiões, criativos…"
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
              style={{ color: T.text, maxHeight: 120 }}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: input.trim() && !loading ? T.primary : T.border, cursor: input.trim() && !loading ? "pointer" : "not-allowed" }}>
              {loading
                ? <RefreshCw size={15} className="animate-spin" style={{ color: T.textSub }} />
                : <Send size={15} style={{ color: input.trim() ? "#fff" : T.textSub }} />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs" style={{ color: T.textSub }}>Enter para enviar · Shift+Enter para nova linha</p>
            <p className="text-xs" style={{ color: T.textSub }}>Powered by Gemini 2.0 Flash</p>
          </div>
        </div>
      </div>
    </div>
  );
}
