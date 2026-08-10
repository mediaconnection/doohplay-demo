import { useState } from "react";
import {
  ArrowLeft, Plus, Play, Pause, Eye, DollarSign, BarChart2, Calendar, Upload,
  CheckCircle, Clock, AlertTriangle, Target, Zap, Star, TrendingUp, ChevronRight,
  Image, FileText, Settings, CreditCard, Bell, Shield,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Tab = "campaigns" | "creatives" | "billing" | "settings";

interface Campaign {
  id: number; name: string; status: "active" | "paused" | "pending" | "ended";
  budget: number; spent: number; impressions: number; screens: number;
  start: string; end: string; type: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Verão 2026 — Happy Hour", status: "active", budget: 3200, spent: 1840, impressions: 284000, screens: 8, start: "01/07", end: "31/07", type: "Promoção" },
  { id: 2, name: "Lançamento Produto X", status: "pending", budget: 1500, spent: 0, impressions: 0, screens: 3, start: "25/07", end: "10/08", type: "Lançamento" },
  { id: 3, name: "Campanha Institucional Q2", status: "ended", budget: 2000, spent: 2000, impressions: 402000, screens: 5, start: "01/06", end: "30/06", type: "Institucional" },
  { id: 4, name: "Flash Sale Fim de Semana", status: "paused", budget: 800, spent: 320, impressions: 65000, screens: 2, start: "15/07", end: "22/07", type: "Flash Sale" },
];

const IMPRESSIONS_DATA = [
  { day: "Seg", imp: 42000 }, { day: "Ter", imp: 38000 }, { day: "Qua", imp: 51000 },
  { day: "Qui", imp: 47000 }, { day: "Sex", imp: 58000 }, { day: "Sáb", imp: 72000 }, { day: "Dom", imp: 64000 },
];

const CREATIVES = [
  { id: 1, name: "Banner Verão 16x9", size: "1920×1080", status: "approved", thumb: T.primary, type: "image" },
  { id: 2, name: "Vídeo 15s Produto X", size: "1920×1080", status: "reviewing", thumb: T.accent, type: "video" },
  { id: 3, name: "Card Institucional", size: "1080×1080", status: "approved", thumb: T.success, type: "image" },
  { id: 4, name: "Vertical Story", size: "1080×1920", status: "rejected", thumb: T.danger, type: "image" },
];

const statusConfig = {
  active:   { label: "Ativa",      color: T.success, icon: Play },
  paused:   { label: "Pausada",    color: T.warning, icon: Pause },
  pending:  { label: "Pendente",   color: T.primary, icon: Clock },
  ended:    { label: "Encerrada",  color: T.textSub, icon: CheckCircle },
};

const creativeStatus = {
  approved: { label: "Aprovado", color: T.success },
  reviewing: { label: "Em revisão", color: T.warning },
  rejected: { label: "Reprovado", color: T.danger },
};

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function ClientPortal({ onBack, onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const activeCampaigns = CAMPAIGNS.filter(c => c.status === "active");
  const totalImpressions = CAMPAIGNS.filter(c => c.status !== "pending").reduce((a, c) => a + c.impressions, 0);
  const totalSpent = CAMPAIGNS.reduce((a, c) => a + c.spent, 0);
  const totalBudget = CAMPAIGNS.reduce((a, c) => a + c.budget, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Star size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Portal do Anunciante</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Bar & Grill São Paulo · Plano Pro</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.primary, color: "#fff" }}>
            <Plus size={14} /> Nova Campanha
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-0 flex gap-1">
          {([
            { id: "campaigns" as Tab, label: "Campanhas", icon: Target },
            { id: "creatives" as Tab, label: "Criativos", icon: Image },
            { id: "billing" as Tab, label: "Financeiro", icon: CreditCard },
            { id: "settings" as Tab, label: "Configurações", icon: Settings },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t.id ? T.primary : T.textSub, borderColor: tab === t.id ? T.primary : "transparent" }}>
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Campanhas ativas", value: activeCampaigns.length, color: T.success, icon: Play },
            { label: "Impressões totais", value: `${(totalImpressions / 1000).toFixed(0)}k`, color: T.primary, icon: Eye },
            { label: "Gasto total", value: `R$${totalSpent.toLocaleString("pt-BR")}`, color: T.gold, icon: DollarSign },
            { label: "Saldo disponível", value: `R$${(totalBudget - totalSpent).toLocaleString("pt-BR")}`, color: T.accent, icon: TrendingUp },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {tab === "campaigns" && (
          <>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Impressões esta semana</h3>
                <span className="text-xs font-bold" style={{ color: T.success }}>+18% vs semana ant.</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={IMPRESSIONS_DATA}>
                  <defs>
                    <linearGradient key="cp-imp" id="cp-imp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${(v / 1000).toFixed(0)}k impressões`]} />
                  <Area key="area-imp" type="monotone" dataKey="imp" stroke={T.primary} fill="url(#cp-imp)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {CAMPAIGNS.map(c => {
                const cfg = statusConfig[c.status];
                const spentPct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
                return (
                  <div key={c.id} onClick={() => setSelectedCampaign(c === selectedCampaign ? null : c)}
                    className="p-5 rounded-2xl border cursor-pointer transition-all hover:border-opacity-60"
                    style={{ background: T.card, borderColor: selectedCampaign?.id === c.id ? cfg.color + "60" : T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.color + "20" }}>
                        <cfg.icon size={16} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold truncate">{c.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ background: cfg.color + "20", color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
                          <span><Calendar size={10} className="inline mr-1" />{c.start} – {c.end}</span>
                          <span><Eye size={10} className="inline mr-1" />{c.impressions > 0 ? `${(c.impressions / 1000).toFixed(0)}k imp.` : "Pendente"}</span>
                          <span><BarChart2 size={10} className="inline mr-1" />{c.screens} telas</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black" style={{ color: T.gold }}>R${c.spent.toLocaleString("pt-BR")}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>de R${c.budget.toLocaleString("pt-BR")}</div>
                      </div>
                      <ChevronRight size={16} style={{ color: T.textSub, transform: selectedCampaign?.id === c.id ? "rotate(90deg)" : "none" }} />
                    </div>

                    {c.status !== "pending" && (
                      <div className="mt-3">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panel }}>
                          <div className="h-full rounded-full" style={{ width: `${spentPct}%`, background: cfg.color }} />
                        </div>
                        <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                          <span>{spentPct.toFixed(0)}% do orçamento utilizado</span>
                          <span>R${(c.budget - c.spent).toLocaleString("pt-BR")} restante</span>
                        </div>
                      </div>
                    )}

                    {selectedCampaign?.id === c.id && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-3" style={{ borderColor: T.border }}>
                        {[
                          { label: "CPM médio", value: "R$42,80" },
                          { label: "Fill rate", value: "78%" },
                          { label: "Tipo", value: c.type },
                          { label: "Telas", value: `${c.screens} ativas` },
                        ].map((d, i) => (
                          <div key={i} className="p-3 rounded-xl" style={{ background: T.panel }}>
                            <div className="text-xs mb-1" style={{ color: T.textSub }}>{d.label}</div>
                            <div className="font-bold text-sm">{d.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "creatives" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Biblioteca de criativos</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: T.accent + "20", color: T.accent, border: `1px solid ${T.accent}30` }}>
                <Upload size={14} /> Upload criativo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CREATIVES.map(c => {
                const cs = creativeStatus[c.status as keyof typeof creativeStatus];
                return (
                  <div key={c.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="aspect-video rounded-xl mb-3 flex items-center justify-center"
                      style={{ background: `${c.thumb}20` }}>
                      <Image size={32} style={{ color: c.thumb + "80" }} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{c.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: cs.color + "20", color: cs.color }}>
                        {cs.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: T.textSub }}>
                      <span>{c.size}</span>
                      <span className="uppercase">{c.type}</span>
                    </div>
                    {c.status === "rejected" && (
                      <div className="mt-2 flex items-start gap-1.5 p-2.5 rounded-lg" style={{ background: T.danger + "10" }}>
                        <AlertTriangle size={12} style={{ color: T.danger, flexShrink: 0, marginTop: 1 }} />
                        <span className="text-xs" style={{ color: T.danger }}>Proporção incorreta. Reenvie em 16:9.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "billing" && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg,${T.primary}15,${T.accent}15)`, borderColor: T.primary + "30" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-xl">Plano Pro</h3>
                  <p className="text-sm" style={{ color: T.textSub }}>R$290/mês · Próxima cobrança: 01/08/2026</p>
                </div>
                <div className="text-right">
                  <div className="font-black text-3xl" style={{ color: T.primary }}>R$290</div>
                  <div className="text-xs" style={{ color: T.textSub }}>por mês</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.gold + "20", color: T.gold, border: `1px solid ${T.gold}30` }}>
                  <Zap size={14} /> Fazer upgrade
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                  <FileText size={14} /> Ver fatura
                </button>
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Histórico de pagamentos</h3>
              <div className="space-y-2">
                {[
                  { date: "01/07/2026", desc: "Plano Pro — Julho/2026", value: 290, status: "paid" },
                  { date: "01/06/2026", desc: "Plano Pro — Junho/2026", value: 290, status: "paid" },
                  { date: "15/06/2026", desc: "Crédito campanhas — R$500", value: 500, status: "paid" },
                  { date: "01/05/2026", desc: "Plano Pro — Maio/2026", value: 290, status: "paid" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
                    <div>
                      <div className="text-sm font-medium">{t.desc}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{t.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: T.success + "20", color: T.success }}>Pago</span>
                      <span className="font-bold" style={{ color: T.text }}>R${t.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            {[
              { icon: Bell, label: "Notificações", sub: "Email e WhatsApp para relatórios e alertas", action: "Configurar" },
              { icon: Shield, label: "Segurança da conta", sub: "Autenticação e controle de acesso", action: "Gerenciar" },
              { icon: CreditCard, label: "Método de pagamento", sub: "Cartão de crédito terminando em 4242", action: "Alterar" },
              { icon: BarChart2, label: "Relatórios automáticos", sub: "Semanal toda segunda-feira às 09:00", action: "Editar" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-2xl border flex items-center gap-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.primary + "20" }}>
                  <s.icon size={18} style={{ color: T.primary }} />
                </div>
                <div className="flex-1">
                  <div className="font-bold">{s.label}</div>
                  <div className="text-sm" style={{ color: T.textSub }}>{s.sub}</div>
                </div>
                <button className="text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ background: T.primary + "20", color: T.primary }}>
                  {s.action}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
