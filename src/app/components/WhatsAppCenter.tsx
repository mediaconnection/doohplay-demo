import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageCircle, Send, Check, CheckCheck, Clock, Search, Plus, Phone, Users, Megaphone, Settings, ChevronRight, Bot, Smile, Image, Paperclip, X, Bell, Zap } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
  wa: "#25D366", waDark: "#128C7E",
};

type Tab = "inbox" | "broadcast" | "templates" | "otp-log";

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
  type: "owner" | "advertiser" | "support";
  messages: Message[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  status: "approved" | "pending" | "rejected";
  body: string;
  vars: string[];
  sent: number;
  open: number;
}

interface OTPLog {
  id: string;
  phone: string;
  name: string;
  time: string;
  status: "delivered" | "expired" | "used";
  attempts: number;
}

const CONTACTS: Contact[] = [
  {
    id: "c1", name: "Paulo Henrique", phone: "+55 11 9 8765-4321", lastMsg: "Recebi a prova, obrigado!", lastTime: "14:32",
    unread: 2, type: "owner",
    messages: [
      { id: "m1", from: "them", text: "Oi, quando sai o relatório de julho?", time: "14:10" },
      { id: "m2", from: "me", text: "Olá Paulo! O relatório de julho estará disponível dia 5 de agosto. Você receberá uma notificação.", time: "14:15", status: "read" },
      { id: "m3", from: "them", text: "Recebi a prova, obrigado!", time: "14:32" },
    ],
  },
  {
    id: "c2", name: "Nike Brasil (Mídia)", phone: "+55 11 3456-7890", lastMsg: "Campanha aprovada para agosto", lastTime: "12:05",
    unread: 0, type: "advertiser",
    messages: [
      { id: "m4", from: "them", text: "Quero expandir para mais 10 telas na região Sul", time: "11:50" },
      { id: "m5", from: "me", text: "Ótimo! Tenho 14 telas disponíveis com audiência masculina 20-40. Envio proposta?", time: "11:55", status: "read" },
      { id: "m6", from: "them", text: "Campanha aprovada para agosto", time: "12:05" },
    ],
  },
  {
    id: "c3", name: "Camila Dias", phone: "+55 11 9 7654-3210", lastMsg: "Minha tela ficou offline!", lastTime: "Ontem",
    unread: 1, type: "owner",
    messages: [
      { id: "m7", from: "them", text: "Minha tela ficou offline!", time: "Ontem 18:40" },
      { id: "m8", from: "me", text: "Olá Camila! Vi no sistema. Verifique a conexão WiFi e reinicie o player. Se persistir, abra um chamado.", time: "Ontem 18:45", status: "read" },
    ],
  },
  {
    id: "c4", name: "Suporte Técnico", phone: "Interno", lastMsg: "Caso #4821 resolvido", lastTime: "Ontem",
    unread: 0, type: "support",
    messages: [
      { id: "m9", from: "me", text: "Caso #4821 resolvido", time: "Ontem 09:00", status: "delivered" },
    ],
  },
];

const TEMPLATES: Template[] = [
  { id: "t1", name: "Boas-vindas Proprietário", category: "UTILITY", status: "approved", body: "Olá {{1}}! 👋 Sua tela *{{2}}* foi ativada no DOOHPLAY. Acesse o painel: https://app.doohplay.com.br", vars: ["nome", "nome_tela"], sent: 1248, open: 94 },
  { id: "t2", name: "Prova de Exibição", category: "UTILITY", status: "approved", body: "📺 *Prova de exibição disponível*\nCampanha: {{1}}\nTela: {{2}}\nData: {{3}}\nVerifique: https://verify.doohplay.com.br/{{4}}", vars: ["campanha", "tela", "data", "hash"], sent: 8920, open: 87 },
  { id: "t3", name: "Cobrança Mensal", category: "UTILITY", status: "approved", body: "Olá {{1}}, sua fatura de {{2}} no valor de *R$ {{3}}* está disponível. Vencimento: {{4}}.", vars: ["nome", "mes", "valor", "vencimento"], sent: 412, open: 91 },
  { id: "t4", name: "Alerta de Tela Offline", category: "ALERT", status: "approved", body: "⚠️ *Alerta DOOHPLAY:* A tela *{{1}}* está offline desde {{2}}. Verifique a conexão ou acesse o painel.", vars: ["nome_tela", "horario"], sent: 234, open: 98 },
  { id: "t5", name: "Nova Proposta de Campanha", category: "MARKETING", status: "pending", body: "🎯 *Nova proposta!* O anunciante *{{1}}* quer exibir na sua tela por *{{2}}* ao valor de R${{3}}/mês. Aceite em 48h.", vars: ["anunciante", "duracao", "valor"], sent: 0, open: 0 },
];

const OTP_LOGS: OTPLog[] = [
  { id: "o1", phone: "+55 11 9 8765-4321", name: "Paulo Henrique", time: "14:28:03", status: "used", attempts: 1 },
  { id: "o2", phone: "+55 11 9 7654-3210", name: "Camila Dias", time: "14:25:11", status: "used", attempts: 2 },
  { id: "o3", phone: "+55 21 9 9876-5432", name: "Ricardo Monteiro", time: "14:10:44", status: "delivered", attempts: 1 },
  { id: "o4", phone: "+55 31 9 8765-1234", name: "Fernanda Lima", time: "13:55:20", status: "expired", attempts: 3 },
  { id: "o5", phone: "+55 11 9 5432-1098", name: "Thiago Alves", time: "13:40:07", status: "used", attempts: 1 },
  { id: "o6", phone: "+55 11 9 2345-6789", name: "Mariana Costa", time: "13:22:58", status: "used", attempts: 1 },
];

const STATUS_MSG: Record<string, { icon: typeof Check; color: string; label: string }> = {
  sent:      { icon: Check,      color: T.textSub, label: "Enviado" },
  delivered: { icon: CheckCheck, color: T.textSub, label: "Entregue" },
  read:      { icon: CheckCheck, color: T.wa,      label: "Lido" },
};

interface Props {
  onBack: () => void;
  session?: { name?: string } | null;
}

export default function WhatsAppCenter({ onBack, session }: Props) {
  const [tab, setTab] = useState<Tab>("inbox");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(CONTACTS.map(c => [c.id, c.messages]))
  );
  const [input, setInput] = useState("");
  const [broadcastTemplate, setBroadcastTemplate] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("owners");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [otpFilter, setOtpFilter] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = CONTACTS.reduce((a, c) => a + c.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact, messages]);

  const sendMessage = () => {
    if (!input.trim() || !activeContact) return;
    const msg: Message = {
      id: `m${Date.now()}`, from: "me", text: input.trim(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] ?? []), msg] }));
    setInput("");
    // Auto-reply sim
    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`, from: "them",
        text: "Entendido, obrigado pela resposta! 👍",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] ?? []), reply] }));
    }, 2000);
  };

  const TYPE_COLORS: Record<string, string> = { owner: T.primary, advertiser: T.accent, support: T.success };
  const TYPE_LABELS: Record<string, string> = { owner: "Proprietário", advertiser: "Anunciante", support: "Suporte" };

  const filteredOtp = OTP_LOGS.filter(o => otpFilter === "all" || o.status === otpFilter);
  const OTP_STATUS: Record<string, { color: string; label: string }> = {
    used:      { color: T.success, label: "Usado" },
    delivered: { color: T.primary, label: "Aguardando" },
    expired:   { color: T.danger,  label: "Expirado" },
  };

  if (activeContact) {
    const msgs = messages[activeContact.id] ?? [];
    return (
      <div className="min-h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        {/* Chat header */}
        <div className="flex-shrink-0 border-b" style={{ background: T.panel, borderColor: T.border }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setActiveContact(null)} className="p-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: TYPE_COLORS[activeContact.type] + "25", color: TYPE_COLORS[activeContact.type] }}>
              {activeContact.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{activeContact.name}</div>
              <div className="text-xs" style={{ color: T.wa }}>● online</div>
            </div>
            <Phone size={16} style={{ color: T.textSub }} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
          {msgs.map(msg => {
            const isMe = msg.from === "me";
            const stCfg = msg.status ? STATUS_MSG[msg.status] : null;
            const StIcon = stCfg?.icon;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-xs px-3.5 py-2.5 rounded-2xl text-sm"
                  style={{
                    background: isMe ? T.wa : T.card,
                    color: isMe ? "#fff" : T.text,
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    border: isMe ? "none" : `1px solid ${T.border}`,
                  }}>
                  {msg.text}
                  <div className={`flex items-center gap-1 mt-0.5 text-xs justify-end`}
                    style={{ color: isMe ? "#ffffff80" : T.textSub }}>
                    {msg.time}
                    {isMe && stCfg && StIcon && <StIcon size={12} style={{ color: stCfg.color }} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t p-3" style={{ borderColor: T.border, background: T.panel }}>
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-white/5"><Smile size={20} style={{ color: T.textSub }} /></button>
            <button className="p-2 rounded-full hover:bg-white/5"><Paperclip size={20} style={{ color: T.textSub }} /></button>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Mensagem" className="flex-1 px-4 py-2.5 rounded-full text-sm"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none" }} />
            <button onClick={sendMessage}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90"
              style={{ background: T.wa }}>
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.wa + "20" }}>
              <MessageCircle size={18} style={{ color: T.wa }} />
            </div>
            <div>
              <h1 className="font-black text-lg">WhatsApp Business</h1>
              <p className="text-xs" style={{ color: T.textSub }}>DOOHPLAY · +55 11 4000-5678</p>
            </div>
          </div>
          {totalUnread > 0 && (
            <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center font-black text-xs"
              style={{ background: T.wa, color: "#fff" }}>
              {totalUnread}
            </div>
          )}
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["inbox", "broadcast", "templates", "otp-log"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-2.5 text-sm font-medium border-b-2 transition-all relative"
              style={{ borderColor: tab === t ? T.wa : "transparent", color: tab === t ? T.wa : T.textSub }}>
              {t === "inbox" ? "Conversas" : t === "broadcast" ? "Broadcast" : t === "templates" ? "Templates" : "OTP Log"}
              {t === "inbox" && totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-black"
                  style={{ background: T.danger, color: "#fff", fontSize: 8 }}>{totalUnread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">

        {/* ─── INBOX ─── */}
        {tab === "inbox" && (
          <>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.textSub }} />
              <input placeholder="Buscar conversa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
            </div>
            <div className="space-y-1">
              {CONTACTS.map(c => (
                <button key={c.id} onClick={() => setActiveContact(c)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/3 transition-all text-left"
                  style={{ background: c.unread > 0 ? T.card : "transparent", border: c.unread > 0 ? `1px solid ${T.border}` : "1px solid transparent" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-black flex-shrink-0"
                    style={{ background: TYPE_COLORS[c.type] + "25", color: TYPE_COLORS[c.type] }}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{c.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: TYPE_COLORS[c.type] + "15", color: TYPE_COLORS[c.type] }}>
                          {TYPE_LABELS[c.type]}
                        </span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{c.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate" style={{ color: T.textSub }}>{c.lastMsg}</span>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ml-2"
                          style={{ background: T.wa, color: "#fff" }}>{c.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── BROADCAST ─── */}
        {tab === "broadcast" && (
          <>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone size={16} style={{ color: T.wa }} />
                <h3 className="font-bold">Nova campanha de broadcast</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: T.textSub }}>Audiência</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "owners", label: "Proprietários", count: "412 contatos", icon: "🏪" },
                      { id: "advertisers", label: "Anunciantes", count: "187 contatos", icon: "📣" },
                      { id: "all", label: "Todos", count: "599 contatos", icon: "👥" },
                    ].map(a => (
                      <button key={a.id} onClick={() => setBroadcastTarget(a.id)}
                        className="p-3 rounded-xl border text-center transition-all"
                        style={{
                          background: broadcastTarget === a.id ? T.wa + "15" : T.panel,
                          borderColor: broadcastTarget === a.id ? T.wa : T.border,
                        }}>
                        <div className="text-xl mb-1">{a.icon}</div>
                        <div className="text-xs font-bold">{a.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{a.count}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: T.textSub }}>Template aprovado</label>
                  <select value={broadcastTemplate} onChange={e => setBroadcastTemplate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }}>
                    <option value="">Selecione um template...</option>
                    {TEMPLATES.filter(t => t.status === "approved").map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {broadcastTemplate && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: T.wa + "08", border: `1px solid ${T.wa}20`, color: T.textSub }}>
                    {TEMPLATES.find(t => t.id === broadcastTemplate)?.body}
                  </div>
                )}
                {!broadcastSent ? (
                  <button onClick={() => setBroadcastSent(true)}
                    disabled={!broadcastTemplate}
                    className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: T.wa, color: "#fff" }}>
                    Enviar para {broadcastTarget === "owners" ? "412" : broadcastTarget === "advertisers" ? "187" : "599"} contatos
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: T.success + "15", border: `1px solid ${T.success}30` }}>
                    <CheckCheck size={18} style={{ color: T.success }} />
                    <div>
                      <div className="font-bold text-sm" style={{ color: T.success }}>Broadcast enviado com sucesso!</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Entrega em andamento — acompanhe no log</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Enviados hoje", value: "1.248", color: T.wa },
                { label: "Taxa de leitura", value: "91%", color: T.success },
                { label: "Cliques", value: "23%", color: T.primary },
              ].map((k, i) => (
                <div key={i} className="rounded-xl border p-4 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── TEMPLATES ─── */}
        {tab === "templates" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Templates aprovados pela Meta</h2>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold"
                style={{ background: T.wa, color: "#fff" }}>
                <Plus size={12} /> Novo template
              </button>
            </div>
            <div className="space-y-3">
              {TEMPLATES.map(tp => (
                <div key={tp.id} className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm">{tp.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: T.panel, color: T.textSub }}>{tp.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tp.vars.map(v => (
                          <code key={v} className="text-xs px-1.5 py-0.5 rounded" style={{ background: T.primary + "15", color: T.primary }}>{`{{${v}}}`}</code>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                      style={{
                        background: tp.status === "approved" ? T.success + "15" : tp.status === "pending" ? T.warning + "15" : T.danger + "15",
                        color: tp.status === "approved" ? T.success : tp.status === "pending" ? T.warning : T.danger,
                      }}>
                      {tp.status === "approved" ? "✓ Aprovado" : tp.status === "pending" ? "⏳ Pendente" : "✗ Rejeitado"}
                    </span>
                  </div>
                  <p className="text-xs p-2.5 rounded-lg mb-3" style={{ background: T.panel, color: T.textSub, lineHeight: 1.6 }}>
                    {tp.body}
                  </p>
                  {tp.status === "approved" && (
                    <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
                      <span>{tp.sent.toLocaleString("pt-BR")} enviados</span>
                      <span style={{ color: T.success }}>{tp.open}% lidos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── OTP LOG ─── */}
        {tab === "otp-log" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Enviados hoje", value: OTP_LOGS.length.toString(), color: T.primary },
                { label: "Usados", value: OTP_LOGS.filter(o => o.status === "used").length.toString(), color: T.success },
                { label: "Expirados", value: OTP_LOGS.filter(o => o.status === "expired").length.toString(), color: T.danger },
              ].map((k, i) => (
                <div key={i} className="rounded-xl border p-3 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {["all", "used", "delivered", "expired"].map(f => (
                <button key={f} onClick={() => setOtpFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                  style={{
                    background: otpFilter === f ? T.primary : T.card,
                    color: otpFilter === f ? "#fff" : T.textSub,
                    border: `1px solid ${otpFilter === f ? T.primary : T.border}`,
                  }}>
                  {f === "all" ? "Todos" : f === "used" ? "Usados" : f === "delivered" ? "Aguardando" : "Expirados"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredOtp.map(o => {
                const sc = OTP_STATUS[o.status];
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: sc.color + "15", color: sc.color }}>
                      {o.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{o.name}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{o.phone} · {o.attempts} tentativa{o.attempts > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono" style={{ color: T.textSub }}>{o.time}</div>
                      <div className="text-xs font-medium" style={{ color: sc.color }}>{sc.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
