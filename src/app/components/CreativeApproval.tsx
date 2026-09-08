import { useState } from "react";
import {
  ArrowLeft, Image, Video, FileText, CheckCircle, XCircle, Clock,
  MessageSquare, Plus, Eye, Download, RotateCcw, AlertTriangle,
  ChevronRight, X, Send, User, Zap, Star, Filter
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type CreativeStatus = "pending" | "in_review" | "approved" | "rejected" | "changes_requested";
type AssetType = "video" | "image" | "html5" | "static";

interface Creative {
  id: string;
  title: string;
  brand: string;
  campaign: string;
  type: AssetType;
  status: CreativeStatus;
  version: number;
  resolution: string;
  duration?: string;
  fileSize: string;
  submittedBy: string;
  submittedAt: string;
  reviewer?: string;
  notes?: string;
  tags: string[];
}

interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
  type: "comment" | "approval" | "rejection" | "revision";
}

const STATUS_META: Record<CreativeStatus, { label: string; color: string; icon: any }> = {
  pending:           { label: "Aguardando",          color: T.textSub, icon: Clock },
  in_review:         { label: "Em Revisão",           color: T.warning, icon: Eye  },
  approved:          { label: "Aprovado",             color: T.success, icon: CheckCircle },
  rejected:          { label: "Reprovado",            color: T.danger,  icon: XCircle },
  changes_requested: { label: "Revisar",              color: T.gold,    icon: RotateCcw },
};

const TYPE_META: Record<AssetType, { label: string; color: string; icon: any }> = {
  video:  { label: "Vídeo",   color: T.accent,   icon: Video     },
  image:  { label: "Imagem",  color: T.primary,  icon: Image     },
  html5:  { label: "HTML5",   color: T.warning,  icon: FileText  },
  static: { label: "Static",  color: T.textSub,  icon: Image     },
};

const CREATIVES: Creative[] = [
  { id: "CRV-001", title: "Ambev Verão — Filme 30s",       brand: "Ambev",      campaign: "Ambev Verão",      type: "video",  status: "in_review",         version: 2, resolution: "1920×1080", duration: "0:30", fileSize: "48 MB",  submittedBy: "Ana Costa",      submittedAt: "23/07 09:30", reviewer: "Carlos M.",  notes: "Verificar transição do frame 12s",   tags: ["verão","bebida","produto"] },
  { id: "CRV-002", title: "Bradesco — Banner Animado",      brand: "Bradesco",   campaign: "Bradesco Ads",     type: "html5",  status: "approved",          version: 3, resolution: "1080×1920", duration: "0:15", fileSize: "2.1 MB", submittedBy: "Bia Santos",     submittedAt: "22/07 14:00", reviewer: "Juliana P.", notes: undefined,                            tags: ["banco","fintech"] },
  { id: "CRV-003", title: "iFood Delivery — Banner",        brand: "iFood",      campaign: "iFood OOH Jul",    type: "image",  status: "changes_requested", version: 1, resolution: "3840×2160", duration: undefined, fileSize: "8.4 MB", submittedBy: "Marcos V.",    submittedAt: "22/07 11:20", reviewer: "Carlos M.",  notes: "Logo muito pequeno, aumentar 20%",   tags: ["delivery","alimento"] },
  { id: "CRV-004", title: "Carrefour — Ofertas da Semana",  brand: "Carrefour",  campaign: "Carrefour Jul",    type: "video",  status: "pending",           version: 1, resolution: "1920×1080", duration: "0:20", fileSize: "31 MB",  submittedBy: "Léa Farias",     submittedAt: "23/07 08:00", reviewer: undefined,    notes: undefined,                            tags: ["varejo","oferta"] },
  { id: "CRV-005", title: "Unilever Q3 — Dove Skincare",   brand: "Unilever",   campaign: "Unilever Q3",      type: "video",  status: "approved",          version: 2, resolution: "1920×1080", duration: "0:30", fileSize: "52 MB",  submittedBy: "Pedro Alves",    submittedAt: "21/07 16:45", reviewer: "Juliana P.", notes: undefined,                            tags: ["beleza","skincare"] },
  { id: "CRV-006", title: "FitLife — Academia Promo",       brand: "FitLife",    campaign: "FitLife Academia", type: "static", status: "rejected",          version: 1, resolution: "1920×1080", duration: undefined, fileSize: "3.2 MB", submittedBy: "Gabi Torres",    submittedAt: "21/07 10:00", reviewer: "Carlos M.",  notes: "Texto violando área de segurança",   tags: ["academia","fitness"] },
  { id: "CRV-007", title: "Nivea UV — Protetor Solar",      brand: "Nivea",      campaign: "Nivea UV",         type: "image",  status: "in_review",         version: 1, resolution: "3840×2160", duration: undefined, fileSize: "9.1 MB", submittedBy: "Tiago Mendes",   submittedAt: "23/07 07:00", reviewer: "Juliana P.", notes: "Conferindo conformidade CONAR",      tags: ["beleza","solar"] },
];

const COMMENTS: Comment[] = [
  { id: "C1", author: "Carlos M.",  role: "Revisor",    text: "Vídeo recebido. Vou verificar conformidade técnica e adequação ao CONAR.",  time: "09:32", type: "comment"   },
  { id: "C2", author: "Carlos M.",  role: "Revisor",    text: "Frame 12s tem uma transição brusca. Pode causar problema em telas com refresh lento. Solicito ajuste.",  time: "09:45", type: "revision"  },
  { id: "C3", author: "Ana Costa",  role: "Anunciante", text: "Entendido! Vou passar para a produtora e reenviar ainda hoje.",  time: "10:02", type: "comment"   },
  { id: "C4", author: "Juliana P.", role: "Supervisora",text: "Após ajuste, garantir que arquivo final seja no máximo 60MB para os players da rede.",  time: "10:15", type: "comment"   },
];

const CHECKLIST_ITEMS = [
  { label: "Resolução correta (1920×1080 ou 4K)",        ok: true  },
  { label: "Duração dentro do limite (máx 60s)",          ok: true  },
  { label: "Tamanho máximo 100MB",                        ok: true  },
  { label: "Codec H.264 ou H.265",                        ok: true  },
  { label: "Sem texto na área de segurança (<10%)",        ok: false },
  { label: "Logo com tamanho mínimo (5% da área)",         ok: false },
  { label: "Conformidade CONAR — sem claims exagerados",  ok: true  },
  { label: "Sem áudio (telas silenciosas)",               ok: true  },
];

export default function CreativeApproval({ onBack, onNavigate }: Props) {
  const [statusFilter, setStatusFilter] = useState<CreativeStatus | "all">("all");
  const [selected, setSelected]         = useState<Creative | null>(CREATIVES[0]);
  const [newComment, setNewComment]     = useState("");
  const [comments, setComments]         = useState<Comment[]>(COMMENTS);
  const [tab, setTab]                   = useState<"list" | "review">("list");

  const filtered = statusFilter === "all" ? CREATIVES : CREATIVES.filter(c => c.status === statusFilter);

  const pending   = CREATIVES.filter(c => c.status === "pending" || c.status === "in_review").length;
  const approved  = CREATIVES.filter(c => c.status === "approved").length;
  const rejected  = CREATIVES.filter(c => c.status === "rejected" || c.status === "changes_requested").length;

  function sendComment() {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: `C${Date.now()}`, author: "Você", role: "Revisor",
      text: newComment.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "comment",
    }]);
    setNewComment("");
  }

  function approveCreative() {
    if (!selected) return;
    setComments(prev => [...prev, {
      id: `C${Date.now()}`, author: "Você", role: "Revisor",
      text: "Criativo aprovado para veiculação.", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "approval",
    }]);
  }

  const COLOR_TYPE: Record<"comment" | "approval" | "rejection" | "revision", string> = {
    comment:   T.primary,
    approval:  T.success,
    rejection: T.danger,
    revision:  T.gold,
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <CheckCircle size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Creative Approval</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Revisão, aprovação e versionamento de criativos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textSub }}>
              <span className="font-black" style={{ color: T.warning }}>{pending}</span> pendentes
              <span className="font-black ml-2" style={{ color: T.success }}>{approved}</span> aprovados
              <span className="font-black ml-2" style={{ color: T.danger }}>{rejected}</span> revisão
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["all","pending","in_review","approved","changes_requested","rejected"] as const).map(f => {
                const meta = f === "all" ? null : STATUS_META[f as CreativeStatus];
                const color = meta?.color || T.primary;
                return (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{ background: statusFilter === f ? color + "20" : T.card, color: statusFilter === f ? color : T.textSub, border: `1px solid ${statusFilter === f ? color + "30" : T.border}` }}>
                    {f === "all" ? "Todos" : meta!.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {filtered.map(c => {
                const sm = STATUS_META[c.status];
                const tm = TYPE_META[c.type];
                const TypeIcon = tm.icon;
                const StatusIcon = sm.icon;
                return (
                  <div key={c.id} onClick={() => setSelected(c)}
                    className="p-3.5 rounded-2xl border cursor-pointer transition-all"
                    style={{ background: selected?.id === c.id ? T.accent + "10" : T.card, borderColor: selected?.id === c.id ? T.accent + "50" : T.border }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tm.color + "20" }}>
                        <TypeIcon size={14} style={{ color: tm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs leading-tight truncate">{c.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{c.brand} · v{c.version}</div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <StatusIcon size={10} style={{ color: sm.color }} />
                          <span className="text-xs font-bold" style={{ color: sm.color }}>{sm.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selected ? (
            <div className="flex-1 min-w-0 space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-black text-lg">{selected.title}</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: STATUS_META[selected.status].color + "20", color: STATUS_META[selected.status].color }}>
                        {STATUS_META[selected.status].label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>
                      {selected.brand} · {selected.campaign} · v{selected.version} · {selected.submittedAt} por {selected.submittedBy}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.panel }}>
                      <Download size={15} style={{ color: T.textSub }} />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.panel }}>
                      <Eye size={15} style={{ color: T.textSub }} />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden mb-4" style={{ background: T.bg, border: `1px solid ${T.border}`, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div className="text-center">
                    {(() => { const TypeIcon = TYPE_META[selected.type].icon; return <TypeIcon size={40} style={{ color: TYPE_META[selected.type].color + "60" }} />; })()}
                    <div className="mt-2 text-xs font-bold" style={{ color: T.textSub }}>{selected.type.toUpperCase()} · {selected.resolution}</div>
                    {selected.duration && <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Duração: {selected.duration}</div>}
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{selected.fileSize}</div>
                  </div>
                  {selected.notes && (
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl flex items-start gap-2"
                      style={{ background: T.warning + "20", border: `1px solid ${T.warning}30` }}>
                      <AlertTriangle size={12} style={{ color: T.warning, flexShrink: 0, marginTop: 1 }} />
                      <span className="text-xs" style={{ color: T.warning }}>{selected.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selected.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: T.panel, color: T.textSub }}>#{tag}</span>
                  ))}
                  {selected.reviewer && (
                    <span className="text-xs ml-auto" style={{ color: T.textSub }}>
                      Revisor: <span style={{ color: T.text }}>{selected.reviewer}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-black text-sm mb-3">Checklist Técnico</h3>
                  <div className="space-y-2">
                    {CHECKLIST_ITEMS.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {item.ok
                          ? <CheckCircle size={13} style={{ color: T.success, flexShrink: 0 }} />
                          : <XCircle size={13} style={{ color: T.danger, flexShrink: 0 }} />}
                        <span className="text-xs" style={{ color: item.ok ? T.text : T.danger }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: T.border }}>
                    <span style={{ color: T.success }}>{CHECKLIST_ITEMS.filter(c => c.ok).length} OK</span>
                    <span className="mx-2" style={{ color: T.textSub }}>·</span>
                    <span style={{ color: T.danger }}>{CHECKLIST_ITEMS.filter(c => !c.ok).length} problema(s)</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border space-y-3" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-black text-sm">Decisão de Revisão</h3>
                  <button onClick={approveCreative}
                    className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                    style={{ background: T.success, color: "#000" }}>
                    <CheckCircle size={15} /> Aprovar Criativo
                  </button>
                  <button className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                    style={{ background: T.gold + "20", color: T.gold, border: `1px solid ${T.gold}30` }}>
                    <RotateCcw size={15} /> Solicitar Revisão
                  </button>
                  <button className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{ background: T.danger + "20", color: T.danger, border: `1px solid ${T.danger}30` }}>
                    <XCircle size={15} /> Reprovar
                  </button>
                  <div className="pt-2 border-t" style={{ borderColor: T.border }}>
                    <div className="text-xs font-bold mb-1" style={{ color: T.textSub }}>VERSÃO HISTÓRICO</div>
                    {Array.from({ length: selected.version }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === selected.version - 1 ? T.success : T.border }} />
                        <span style={{ color: i === selected.version - 1 ? T.text : T.textSub }}>v{i + 1} — {i === selected.version - 1 ? "atual" : "anterior"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-4">Histórico de Revisão</h3>
                <div className="space-y-3 mb-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: COLOR_TYPE[c.type] + "20" }}>
                        <User size={12} style={{ color: COLOR_TYPE[c.type] }} />
                      </div>
                      <div className="flex-1 p-3 rounded-xl" style={{ background: T.panel }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold">{c.author}</span>
                          <span className="text-xs" style={{ color: T.textSub }}>{c.role}</span>
                          <span className="text-xs ml-auto" style={{ color: T.textSub }}>{c.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: c.type !== "comment" ? COLOR_TYPE[c.type] : T.text }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input value={newComment} onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendComment()}
                    placeholder="Adicionar comentário..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  <button onClick={sendComment}
                    className="px-4 py-2.5 rounded-xl"
                    style={{ background: T.accent, color: "#fff" }}>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: T.textSub }}>
              <div className="text-center">
                <CheckCircle size={32} className="mx-auto mb-3" style={{ color: T.border }} />
                <p className="text-sm">Selecione um criativo para revisar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
