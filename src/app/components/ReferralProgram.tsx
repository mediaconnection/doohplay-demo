import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check, Users, DollarSign, TrendingUp, Share2, Gift, ExternalLink, ChevronRight, Award, Clock, CheckCircle, XCircle, Wallet, ArrowDownToLine } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Referral {
  id: string;
  name: string;
  business: string;
  joinedAt: string;
  plan: "starter" | "pro" | "enterprise";
  status: "pending" | "active" | "churned";
  monthsActive: number;
  earned: number;
}

const SAMPLE_REFERRALS: Referral[] = [
  { id: "r1", name: "Paulo Henrique", business: "Barbearia Roots", joinedAt: "2025-11-03", plan: "pro", status: "active", monthsActive: 8, earned: 400 },
  { id: "r2", name: "Fernanda Lopes", business: "Academia FitSpace", joinedAt: "2025-12-15", plan: "enterprise", status: "active", monthsActive: 7, earned: 350 },
  { id: "r3", name: "Ricardo Monteiro", business: "Restaurante Sabor Local", joinedAt: "2026-01-20", plan: "starter", status: "active", monthsActive: 6, earned: 300 },
  { id: "r4", name: "Camila Dias", business: "Clínica Estética Bella", joinedAt: "2026-02-08", plan: "pro", status: "active", monthsActive: 5, earned: 250 },
  { id: "r5", name: "Thiago Alves", business: "Padaria Artesanal", joinedAt: "2026-04-01", plan: "starter", status: "pending", monthsActive: 0, earned: 0 },
  { id: "r6", name: "Mariana Costa", business: "Salão Glamour", joinedAt: "2026-06-10", plan: "pro", status: "pending", monthsActive: 0, earned: 0 },
];

const PLAN_COMMISSION: Record<string, { monthly: number; label: string; color: string }> = {
  starter:    { monthly: 30,  label: "Starter R$97",     color: T.primary },
  pro:        { monthly: 87,  label: "Pro R$290",         color: T.accent },
  enterprise: { monthly: 186, label: "Enterprise R$620",  color: T.gold },
};

const MILESTONES = [
  { ref: 1,  label: "Primeiro indicado",  reward: "R$50 bônus",      icon: "🎯" },
  { ref: 3,  label: "Trio de ouro",       reward: "R$50 extra",       icon: "🥉" },
  { ref: 5,  label: "Super Indicador",    reward: "Mês grátis",       icon: "🌟" },
  { ref: 10, label: "Embaixador DOOH",    reward: "Plaque + Badge",   icon: "🏆" },
  { ref: 25, label: "Lenda da Rede",      reward: "Convite VIP",      icon: "👑" },
];

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  session?: { name?: string; plan?: string } | null;
}

export default function ReferralProgram({ onBack, onNavigate, session }: Props) {
  const [tab, setTab] = useState<"overview" | "referrals" | "earnings" | "withdraw">("overview");
  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawKey, setWithdrawKey] = useState("");
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);

  const referralCode = "DOOH-ZIM23";
  const referralLink = `https://doohplay.com.br/i/${referralCode.toLowerCase()}`;

  const active = SAMPLE_REFERRALS.filter(r => r.status === "active");
  const pending = SAMPLE_REFERRALS.filter(r => r.status === "pending");
  const totalEarned = SAMPLE_REFERRALS.reduce((a, r) => a + r.earned, 0);
  const monthlyRecurring = active.reduce((a, r) => a + (PLAN_COMMISSION[r.plan]?.monthly ?? 0), 0);
  const availableBalance = totalEarned - 200; // simulating some already withdrawn

  const activeMilestone = MILESTONES.filter(m => active.length >= m.ref).length;
  const nextMilestone = MILESTONES[activeMilestone];

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 2000);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawKey) return;
    setWithdrawDone(true);
    setTimeout(() => { setWithdrawDone(false); setShowWithdrawModal(false); setWithdrawAmount(""); setWithdrawKey(""); }, 2500);
  };

  const planBadgeStyle = (plan: string) => ({
    background: PLAN_COMMISSION[plan]?.color + "20",
    color: PLAN_COMMISSION[plan]?.color,
    border: `1px solid ${PLAN_COMMISSION[plan]?.color}30`,
  });

  const statusStyle = (status: string) => ({
    pending:  { bg: T.warning + "15", text: T.warning },
    active:   { bg: T.success + "15", text: T.success },
    churned:  { bg: T.danger + "15",  text: T.danger },
  }[status] ?? { bg: T.border, text: T.textSub });

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Gift size={18} style={{ color: T.gold }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Programa de Indicação</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Ganhe R$50 + comissão recorrente</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: T.success + "15", color: T.success }}>
            <Wallet size={14} /> R${availableBalance}
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1">
          {(["overview","referrals","earnings","withdraw"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize"
              style={{
                borderColor: tab === t ? T.primary : "transparent",
                color: tab === t ? T.primary : T.textSub,
              }}>
              {t === "overview" ? "Visão Geral" : t === "referrals" ? "Indicados" : t === "earnings" ? "Ganhos" : "Saque"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* ──────── OVERVIEW ──────── */}
        {tab === "overview" && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Indicados ativos", value: active.length.toString(), sub: `${pending.length} pendentes`, icon: Users, color: T.primary },
                { label: "Receita recorrente", value: `R$${monthlyRecurring}`, sub: "por mês", icon: TrendingUp, color: T.success },
                { label: "Total ganho", value: `R$${totalEarned}`, sub: "desde sempre", icon: DollarSign, color: T.accent },
                { label: "Saldo disponível", value: `R$${availableBalance}`, sub: "para saque", icon: Wallet, color: T.gold },
              ].map((kpi, i) => (
                <div key={i} className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <kpi.icon size={16} style={{ color: kpi.color }} />
                    <span className="text-xs" style={{ color: T.textSub }}>{kpi.label}</span>
                  </div>
                  <div className="text-2xl font-black">{kpi.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div className="rounded-2xl border p-5" style={{ background: `linear-gradient(135deg, ${T.primary}10, ${T.accent}08)`, borderColor: T.primary + "25" }}>
              <div className="flex items-center gap-2 mb-3">
                <Share2 size={16} style={{ color: T.primary }} />
                <h3 className="font-bold text-sm">Seu link de indicação</h3>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                <code className="flex-1 text-sm truncate" style={{ color: T.primary }}>{referralLink}</code>
                <button onClick={copyLink} className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ color: copied ? T.success : T.textSub }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: shareClicked ? T.success : T.primary, color: "#fff" }}>
                  <Share2 size={14} /> {shareClicked ? "Copiado!" : "Compartilhar via WhatsApp"}
                </button>
                <button onClick={copyLink}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-white/5 border"
                  style={{ borderColor: T.border, color: T.textSub }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Como funciona</h3>
              <div className="space-y-3">
                {[
                  { step: "1", desc: "Compartilhe seu link único com donos de estabelecimentos", icon: "📤" },
                  { step: "2", desc: "Eles instalam a tela e ativam o plano DOOHPLAY", icon: "📺" },
                  { step: "3", desc: "Você recebe R$50 de bônus imediato por ativação confirmada", icon: "💰" },
                  { step: "4", desc: "Continue ganhando comissão mensal enquanto eles ficarem ativos", icon: "🔄" },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                      style={{ background: T.primary + "20", color: T.primary }}>
                      {s.step}
                    </div>
                    <div className="text-sm" style={{ color: T.textSub }}>
                      <span className="text-xl mr-2">{s.icon}</span>{s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission table */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Comissão por plano</h3>
              <div className="space-y-2">
                {Object.entries(PLAN_COMMISSION).map(([plan, info]) => (
                  <div key={plan} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                      <span className="text-sm font-medium">{info.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm" style={{ color: info.color }}>R${info.monthly}/mês</div>
                      <div className="text-xs" style={{ color: T.textSub }}>30% da mensalidade</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: T.success + "10", color: T.success, border: `1px solid ${T.success}20` }}>
                💡 Com 10 indicados Pro ativos você ganha R$870/mês de receita passiva
              </div>
            </div>

            {/* Milestones */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} style={{ color: T.gold }} />
                <h3 className="font-bold">Marcos de indicação</h3>
              </div>
              <div className="space-y-2">
                {MILESTONES.map((m, i) => {
                  const reached = active.length >= m.ref;
                  const isNext = m.ref === nextMilestone?.ref;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{ background: reached ? T.gold + "10" : isNext ? T.primary + "08" : "transparent", border: `1px solid ${reached ? T.gold + "25" : isNext ? T.primary + "20" : T.border}` }}>
                      <div className="text-xl">{m.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.label}</span>
                          {isNext && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: T.primary + "20", color: T.primary }}>próximo</span>}
                        </div>
                        <div className="text-xs" style={{ color: T.textSub }}>{m.ref} indicados ativos → {m.reward}</div>
                      </div>
                      {reached
                        ? <CheckCircle size={16} style={{ color: T.gold }} />
                        : <span className="text-xs font-medium" style={{ color: T.textSub }}>{m.ref - active.length} faltam</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ──────── REFERRALS ──────── */}
        {tab === "referrals" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{SAMPLE_REFERRALS.length} indicados</h2>
              <button onClick={() => setTab("overview")}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: T.primary }}>
                <Share2 size={14} /> Novo convite
              </button>
            </div>
            <div className="space-y-3">
              {SAMPLE_REFERRALS.map(ref => {
                const st = statusStyle(ref.status);
                const comm = PLAN_COMMISSION[ref.plan];
                return (
                  <div key={ref.id} className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-sm">{ref.name}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{ref.business}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                          style={{ ...planBadgeStyle(ref.plan) }}>
                          {ref.plan}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: st.bg, color: st.text }}>
                          {ref.status === "pending" ? "aguardando" : ref.status === "active" ? "ativo" : "cancelou"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: T.textSub }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(ref.joinedAt).toLocaleDateString("pt-BR")}</span>
                      {ref.status === "active" && (
                        <>
                          <span className="flex items-center gap-1"><TrendingUp size={11} /> {ref.monthsActive} meses ativo</span>
                          <span className="flex items-center gap-1 ml-auto font-medium" style={{ color: T.success }}>
                            <DollarSign size={11} /> R${comm.monthly}/mês
                          </span>
                        </>
                      )}
                      {ref.status === "pending" && (
                        <span className="ml-auto" style={{ color: T.warning }}>Aguardando primeira ativação</span>
                      )}
                    </div>
                    {ref.status === "active" && (
                      <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: T.border }}>
                        <span className="text-xs" style={{ color: T.textSub }}>Total acumulado</span>
                        <span className="text-sm font-black" style={{ color: T.success }}>R${ref.earned}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ──────── EARNINGS ──────── */}
        {tab === "earnings" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total ganho", value: `R$${totalEarned}`, color: T.success },
                { label: "Recorrente/mês", value: `R$${monthlyRecurring}`, color: T.primary },
                { label: "Disponível p/ saque", value: `R$${availableBalance}`, color: T.gold },
              ].map((k, i) => (
                <div key={i} className="rounded-2xl border p-4 text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Monthly projection */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Projeção de ganhos</h3>
              <div className="space-y-3">
                {[
                  { period: "Este mês (jul/26)", amount: monthlyRecurring, note: "já garantido" },
                  { period: "Próximos 3 meses", amount: monthlyRecurring * 3, note: "se mantiver base" },
                  { period: "Próximos 12 meses", amount: monthlyRecurring * 12, note: "se mantiver base" },
                  { period: "Se dobrar indicados", amount: monthlyRecurring * 24, note: "potencial em 12 meses" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                    <div>
                      <div className="text-sm font-medium">{p.period}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{p.note}</div>
                    </div>
                    <div className="font-black" style={{ color: T.success }}>R${p.amount.toLocaleString("pt-BR")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Histórico de pagamentos</h3>
              <div className="space-y-2">
                {[
                  { date: "01/06/2026", desc: "Comissão mensal — 4 ativos", amount: 537, type: "credit" },
                  { date: "20/05/2026", desc: "Saque via PIX", amount: -200, type: "debit" },
                  { date: "01/05/2026", desc: "Comissão mensal — 4 ativos", amount: 537, type: "credit" },
                  { date: "14/04/2026", desc: "Bônus ativação — Camila Dias", amount: 50, type: "bonus" },
                  { date: "01/04/2026", desc: "Comissão mensal — 3 ativos", amount: 327, type: "credit" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: h.type === "debit" ? T.danger + "15" : T.success + "15" }}>
                        {h.type === "debit" ? <ArrowDownToLine size={14} style={{ color: T.danger }} /> : <DollarSign size={14} style={{ color: T.success }} />}
                      </div>
                      <div>
                        <div className="text-sm">{h.desc}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{h.date}</div>
                      </div>
                    </div>
                    <div className="font-black text-sm" style={{ color: h.amount > 0 ? T.success : T.danger }}>
                      {h.amount > 0 ? "+" : ""}R${Math.abs(h.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ──────── WITHDRAW ──────── */}
        {tab === "withdraw" && (
          <>
            <div className="rounded-2xl border p-5 text-center" style={{ background: `linear-gradient(135deg, ${T.success}10, ${T.success}05)`, borderColor: T.success + "25" }}>
              <div className="text-4xl font-black mb-1" style={{ color: T.success }}>R${availableBalance}</div>
              <div className="text-sm" style={{ color: T.textSub }}>disponível para saque</div>
              <div className="mt-3 text-xs px-3 py-1.5 rounded-full inline-block" style={{ background: T.success + "15", color: T.success }}>
                Processamento em 1-2 dias úteis via PIX
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Solicitar saque</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Valor (mínimo R$50)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: T.textSub }}>R$</span>
                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="0,00" min="50" max={availableBalance}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{ background: T.panel, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 200, availableBalance].map(v => (
                      <button key={v} onClick={() => setWithdrawAmount(v.toString())}
                        className="flex-1 text-xs py-1.5 rounded-lg transition-all hover:bg-white/5 border"
                        style={{ borderColor: T.border, color: T.textSub }}>
                        R${v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: T.textSub }}>Chave PIX</label>
                  <input type="text" value={withdrawKey} onChange={e => setWithdrawKey(e.target.value)}
                    placeholder="CPF, CNPJ, e-mail ou chave aleatória"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ background: T.panel, border: `1.5px solid ${T.border}`, color: T.text, outline: "none" }} />
                </div>
                <button onClick={handleWithdraw}
                  disabled={!withdrawAmount || !withdrawKey || Number(withdrawAmount) < 50}
                  className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${T.success}, ${T.success}CC)`, color: "#05060E" }}>
                  Solicitar Saque via PIX
                </button>
              </div>
            </div>

            {/* Rules */}
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3">Regras do programa</h3>
              <ul className="space-y-2 text-sm" style={{ color: T.textSub }}>
                {[
                  "Comissão paga mensalmente, todo dia 1",
                  "Saque mínimo de R$50 via PIX",
                  "Processamento em 1-2 dias úteis",
                  "Comissão válida enquanto indicado mantiver assinatura ativa",
                  "Chargeback ou fraude cancela comissão da referência",
                  "Limite de 500 indicados por conta",
                ].map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: T.success }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Withdraw success toast */}
      {withdrawDone && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
          style={{ background: T.success, color: "#05060E" }}>
          <CheckCircle size={18} />
          <span className="font-bold text-sm">Saque de R${withdrawAmount} solicitado com sucesso!</span>
        </div>
      )}
    </div>
  );
}
