import { useState, useEffect, useRef } from "react";
import {
  Tv, Network, CheckCircle2, ArrowRight, Shield, Activity, Play, Globe,
  Lock, TrendingUp, DollarSign, Eye, Cpu, ShoppingBag, Link2, Menu, X,
  Database, Search, Brain, Layers, LayoutDashboard, BarChart2, MapPin,
  Star, ExternalLink, Copy, Award, Users, Calculator, Zap, Building2,
  ChevronDown, Check
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip
} from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.12)",
  primary: "#2563EB", secondary: "#0EA5E9", success: "#22C55E",
  warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

function AnimatedCounter({ end, suffix = "", prefix = "", decimals = 0 }: {
  end: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0; const inc = end / (1800 / 16);
        const t = setInterval(() => { cur = Math.min(cur + inc, end); setVal(cur); if (cur >= end) clearInterval(t); }, 16);
      }
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [end]);
  const d = val >= end ? (decimals > 0 ? end.toFixed(decimals) : end.toLocaleString("pt-BR"))
    : (decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString("pt-BR"));
  return <span ref={ref}>{prefix}{d}{suffix}</span>;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>{children}</div>;
}

function PulseDot({ color = "#22C55E" }: { color?: string }) {
  return <span className="relative inline-flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: color }} /><span className="relative inline-flex w-2 h-2 rounded-full" style={{ backgroundColor: color }} /></span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: `${T.primary}18`, color: T.secondary, border: `1px solid ${T.primary}30` }}>{children}</div>;
}

function HeroDashboardMockup() {
  const data = [
    { m: "Jan", v: 3.2 }, { m: "Fev", v: 4.1 }, { m: "Mar", v: 3.8 }, { m: "Abr", v: 5.2 },
    { m: "Mai", v: 6.1 }, { m: "Jun", v: 7.4 }, { m: "Jul", v: 6.8 }, { m: "Ago", v: 8.4 },
  ];
  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl border overflow-hidden shadow-2xl" style={{ background: T.card, borderColor: T.borderLight, transform: "rotateY(-6deg) rotateX(2deg)", boxShadow: "0 24px 80px rgba(37,99,235,0.25)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border, background: "#0A1628" }}>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 opacity-80" /><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" /><div className="w-3 h-3 rounded-full bg-green-500 opacity-80" /></div>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: T.textSub }}><PulseDot /><span style={{ color: T.success }}>LIVE</span> · NOC</div>
          <div className="text-xs" style={{ color: T.textSub }}>DOOHPLAY</div>
        </div>
        <div className="grid grid-cols-4 border-b" style={{ borderColor: T.border }}>
          {[{ l: "Telas", v: "12.847", c: T.success }, { l: "Impressões", v: "84.2M", c: T.secondary }, { l: "Trust", v: "97.3", c: T.primary }, { l: "SLA", v: "99.9%", c: T.success }].map((m, i) => (
            <div key={`hm-${i}`} className="px-4 py-3 border-r last:border-r-0" style={{ borderColor: T.border }}>
              <div className="text-lg font-bold" style={{ color: m.c }}>{m.v}</div>
              <div className="text-xs" style={{ color: T.textSub }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="text-xs font-semibold mb-2" style={{ color: T.textSub }}>Receita Mensal (R$ M)</div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={data}>
              <defs><linearGradient id="hero-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.4} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke={T.primary} strokeWidth={2} fill="url(#hero-g)" dot={false} />
              <Tooltip contentStyle={{ background: T.cardLight, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-8 rounded-xl border p-3 shadow-xl w-48" style={{ background: T.card, borderColor: T.borderLight, boxShadow: "0 8px 32px rgba(37,99,235,0.2)" }}>
        <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${T.purple}20` }}><Link2 size={12} style={{ color: T.purple }} /></div><span className="text-xs font-semibold" style={{ color: T.text }}>ProofChain</span><PulseDot color={T.purple} /></div>
        <div className="text-xs font-mono" style={{ color: T.textSub }}>0x7f2a...c4e1</div>
        <div className="text-xs mt-1" style={{ color: T.success }}>Verificado · Bloco #18.2M</div>
      </div>
      <div className="absolute -top-4 -right-6 rounded-xl border p-3 shadow-xl w-44" style={{ background: T.card, borderColor: T.borderLight, boxShadow: "0 8px 32px rgba(14,165,233,0.2)" }}>
        <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${T.secondary}20` }}><ShoppingBag size={12} style={{ color: T.secondary }} /></div><span className="text-xs font-semibold" style={{ color: T.text }}>Retail Media</span></div>
        <div className="text-xl font-bold" style={{ color: T.secondary }}>R$8.4M</div>
        <div className="text-xs mt-1 font-semibold" style={{ color: T.success }}>+23% esse mês</div>
      </div>
    </div>
  );
}

function LiveNetworkCard() {
  const [count, setCount] = useState(1247);
  const [proofs, setProofs] = useState(53);
  useEffect(() => {
    const t = setInterval(() => { setCount(c => c + Math.floor(Math.random() * 3)); setProofs(p => p + Math.floor(Math.random() * 2)); }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-2xl border p-4 mt-4" style={{ background: `${T.card}CC`, borderColor: `${T.success}40`, boxShadow: `0 0 24px ${T.success}18` }}>
      <div className="flex items-center gap-2 mb-3"><PulseDot /><span className="text-sm font-bold" style={{ color: T.success }}>LIVE NETWORK STATUS</span></div>
      <div className="grid grid-cols-2 gap-3">
        <div><div className="text-2xl font-bold" style={{ color: T.text }}>{count.toLocaleString("pt-BR")}</div><div className="text-xs" style={{ color: T.textSub }}>telas online agora</div></div>
        <div><div className="text-2xl font-bold" style={{ color: T.secondary }}>+{proofs}</div><div className="text-xs" style={{ color: T.textSub }}>exibições verificadas / 30s</div></div>
      </div>
      <div className="flex gap-3 mt-3 flex-wrap">
        {[{ l: "Blockchain Sync", c: T.success }, { l: "ICP Brasil Ativo", c: T.primary }, { l: "Trust 97.3", c: T.warning }].map((s, i) => (
          <div key={`lb-${i}`} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.c }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />{s.l}</div>
        ))}
      </div>
    </div>
  );
}

function MarketPositionSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 4000); return () => clearInterval(t); }, []);
  const metrics = [
    { label: "Telas Ativas", end: 12847, icon: Tv, color: T.primary },
    { label: "Impressões Mensais", end: 84.2, suffix: "M", decimals: 1, icon: Eye, color: T.secondary },
    { label: "Receita Processada", end: 8.4, suffix: "M", prefix: "R$", decimals: 1, icon: DollarSign, color: T.success },
    { label: "Provas Auditadas", end: 4.8, suffix: "M", decimals: 1, icon: CheckCircle2, color: T.purple },
    { label: "Trust Score", end: 97.3, decimals: 1, icon: Shield, color: T.warning },
    { label: "SLA", end: 99.9, suffix: "%", decimals: 1, icon: Activity, color: T.success },
  ];
  return (
    <section className="py-20 px-6" style={{ background: "linear-gradient(180deg, #020617 0%, #030D1F 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-3"><SectionLabel><Zap size={12} /> A Primeira Rede de Retail Media Auditável do Brasil</SectionLabel></div>
          <div className="text-center mb-2"><h2 className="text-4xl font-bold" style={{ color: T.text }}>A Primeira Rede de Retail Media Auditável do Brasil</h2></div>
          <div className="text-center mb-12"><p className="text-lg max-w-2xl mx-auto" style={{ color: T.textSub }}>Uma infraestrutura nacional que conecta comércios, redes varejistas, anunciantes e agências em uma única plataforma.</p></div>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <FadeIn key={`mp-${i}`} delay={i * 60}>
              <div className="relative p-5 rounded-2xl border flex flex-col gap-2 overflow-hidden" style={{ background: T.card, borderColor: `${m.color}30`, boxShadow: `0 4px 20px ${m.color}12` }}>
                <div className="absolute top-2 right-2 opacity-60"><PulseDot color={m.color} /></div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${m.color}18` }}><m.icon size={18} style={{ color: m.color }} /></div>
                <div className="text-2xl font-bold" style={{ color: T.text }}><AnimatedCounter end={m.end} suffix={m.suffix} prefix={m.prefix} decimals={m.decimals} /></div>
                <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function SegmentsSection() {
  const segs = [{ l: "Padarias", e: "🥐" }, { l: "Cafeterias", e: "☕" }, { l: "Restaurantes", e: "🍽️" }, { l: "Farmácias", e: "💊" }, { l: "Academias", e: "🏋️" }, { l: "Franquias", e: "🏪" }, { l: "Agências", e: "📺" }, { l: "Supermercados", e: "🛒" }, { l: "Shoppings", e: "🏬" }, { l: "Redes Varejistas", e: "🏷️" }];
  return (
    <section className="py-20 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-10"><h2 className="text-3xl font-bold mb-2" style={{ color: T.text }}>Utilizado por negócios em todo o Brasil</h2><p className="text-sm" style={{ color: T.textSub }}>De padarias locais a redes varejistas nacionais.</p></div></FadeIn>
        <div className="flex flex-wrap justify-center gap-3">
          {segs.map((s, i) => (
            <FadeIn key={`seg-${i}`} delay={i * 40}>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-default" style={{ background: T.card, borderColor: T.border, color: T.textSub, transition: "all 0.2s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${T.primary}60`; el.style.boxShadow = `0 0 16px ${T.primary}20`; el.style.color = T.text; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = T.border; el.style.boxShadow = "none"; el.style.color = T.textSub; }}>
                <span>{s.e}</span>{s.l}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const customers = [
    { name: "Padaria São Paulo", icon: "🥐", detail1: "3 telas", detail2: "Receita média:", value: "R$847/mês", color: T.success },
    { name: "Rede Farma", icon: "💊", detail1: "42 telas", detail2: "Receita média:", value: "R$18.400/mês", color: T.primary },
    { name: "Academia Fit", icon: "🏋️", detail1: "12 telas", detail2: "Trust Score:", value: "98.7", color: T.secondary },
    { name: "Shopping Center", icon: "🏬", detail1: "128 telas", detail2: "Impressões:", value: "4.2M/mês", color: T.warning },
    { name: "Rede de Cafeterias", icon: "☕", detail1: "24 telas", detail2: "Uptime:", value: "99.2%", color: T.purple },
    { name: "Agência Nacional", icon: "📺", detail1: "420 campanhas", detail2: "Proof-of-Play:", value: "Ativo", color: T.success },
  ];
  return (
    <section className="py-20 px-6" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Users size={12} /> Social Proof</SectionLabel><h2 className="text-4xl font-bold mb-3" style={{ color: T.text }}>Quem já utiliza DOOHPLAY</h2><p className="text-lg" style={{ color: T.textSub }}>De pequenos comércios até grandes redes nacionais.</p></div></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((c, i) => (
            <FadeIn key={`sp-${i}`} delay={i * 70}>
              <div className="p-6 rounded-2xl border cursor-default transition-all duration-300" style={{ background: T.card, borderColor: T.border }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.borderColor = `${c.color}50`; el.style.boxShadow = `0 12px 40px ${c.color}18`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.borderColor = T.border; el.style.boxShadow = "none"; }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${c.color}12` }}>{c.icon}</div>
                  <div><div className="font-bold" style={{ color: T.text }}>{c.name}</div><div className="text-xs" style={{ color: T.textSub }}>{c.detail1}</div></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.border }}>
                  <span className="text-xs" style={{ color: T.textSub }}>{c.detail2}</span>
                  <span className="text-base font-bold" style={{ color: c.color }}>{c.value}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  const metrics = [
    { label: "Telas Ativas", end: 12847, icon: Tv, color: T.primary, trend: "+12%" },
    { label: "Impressões Hoje", end: 84.2, suffix: "M", decimals: 1, icon: Eye, color: T.secondary },
    { label: "Receita Gerada", end: 8.4, suffix: "M", prefix: "R$", decimals: 1, icon: DollarSign, color: T.success, trend: "+23%" },
    { label: "Trust Score", end: 97.3, decimals: 1, icon: Shield, color: T.warning },
    { label: "SLA", end: 99.9, suffix: "%", decimals: 1, icon: Activity, color: T.success },
    { label: "Provas Auditadas", end: 4.8, suffix: "M", decimals: 1, icon: CheckCircle2, color: T.purple },
  ];
  return (
    <section className="py-20 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Activity size={12} /> Métricas em Tempo Real</SectionLabel><h2 className="text-4xl font-bold" style={{ color: T.text }}>Métricas da Rede em Tempo Real</h2></div></FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <FadeIn key={`met-${i}`} delay={i * 60}>
              <div className="p-6 rounded-2xl border flex flex-col gap-2 transition-all hover:-translate-y-1" style={{ background: T.card, borderColor: T.border, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}18` }}><m.icon size={20} style={{ color: m.color }} /></div>
                  {m.trend && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${T.success}18`, color: T.success }}>{m.trend}</span>}
                </div>
                <div className="text-2xl font-bold" style={{ color: T.text }}><AnimatedCounter end={m.end} suffix={m.suffix} prefix={m.prefix} decimals={m.decimals} /></div>
                <div className="text-sm" style={{ color: T.textSub }}>{m.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const features = [
    "Digital Signage", "Retail Media", "Blockchain", "ICP Brasil", "Proof-of-Play",
    "Explorer Público", "Revenue Share", "Trust Score", "LGPD", "APIs", "Multi-Tenant", "White Label",
  ];
  return (
    <section className="py-20 px-6" style={{ background: "#0A0F1E" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Award size={12} /> Diferenciais</SectionLabel><h2 className="text-4xl font-bold mb-3" style={{ color: T.text }}>Por que o DOOHPLAY e diferente?</h2><p className="text-lg" style={{ color: T.textSub }}>Compare com o mercado tradicional de Digital Signage.</p></div></FadeIn>
        <FadeIn delay={100}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="grid grid-cols-3 px-6 py-4 border-b" style={{ borderColor: T.border, background: T.cardLight }}>
              <span className="text-sm font-semibold" style={{ color: T.textSub }}>Recurso</span>
              <span className="text-sm font-bold text-center" style={{ color: T.primary }}>DOOHPLAY</span>
              <span className="text-sm font-semibold text-center" style={{ color: T.gray }}>Mercado Tradicional</span>
            </div>
            {features.map((f, i) => (
              <div key={`cf-${i}`} className="grid grid-cols-3 px-6 py-3.5 border-b last:border-b-0 hover:bg-white/3 transition-colors" style={{ borderColor: T.border }}>
                <span className="text-sm" style={{ color: T.textSub }}>{f}</span>
                <div className="flex justify-center"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${T.success}18`, color: T.success }}><Check size={11} /> Incluido</span></div>
                <div className="flex justify-center"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>✕ Não disponível</span></div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function NetworkScaleSection({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const cities = [
    { name: "São Paulo", x: 52, y: 65, screens: 4821, trust: 98.1, status: "online" },
    { name: "Rio de Janeiro", x: 57, y: 68, screens: 2140, trust: 97.4, status: "online" },
    { name: "Belo Horizonte", x: 53, y: 60, screens: 1203, trust: 96.8, status: "online" },
    { name: "Brasília", x: 50, y: 50, screens: 891, trust: 97.2, status: "online" },
    { name: "Curitiba", x: 50, y: 72, screens: 724, trust: 97.9, status: "online" },
    { name: "Porto Alegre", x: 48, y: 80, screens: 612, trust: 97.5, status: "online" },
    { name: "Salvador", x: 60, y: 45, screens: 589, trust: 96.1, status: "verified" },
    { name: "Fortaleza", x: 62, y: 28, screens: 487, trust: 95.8, status: "verified" },
    { name: "Manaus", x: 32, y: 28, screens: 234, trust: 93.2, status: "warning" },
    { name: "Recife", x: 67, y: 36, screens: 398, trust: 95.4, status: "verified" },
  ];
  const sc = (s: string) => s === "online" ? T.success : s === "verified" ? T.secondary : s === "warning" ? T.warning : "#EF4444";
  const [sel, setSel] = useState(cities[0]);
  return (
    <section style={{ background: T.bg }} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><Globe size={12} /> Infraestrutura Nacional</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Infraestrutura Nacional</h2><p className="text-lg" style={{ color: T.textSub }}>Monitoramento contínuo da maior rede auditável de midia digital do Brasil.</p></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border, minHeight: 400, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${T.primary}08, transparent)` }} />
              <div className="relative w-full h-96 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ opacity: 0.18 }}>
                  <path d="M35,15 L45,12 L55,14 L65,18 L72,25 L75,35 L73,42 L70,48 L68,55 L65,62 L60,68 L57,72 L55,78 L52,83 L50,88 L48,82 L45,75 L42,70 L38,65 L35,60 L30,55 L27,48 L25,40 L26,32 L30,24 Z" fill="none" stroke={T.primary} strokeWidth="0.8" />
                </svg>
                {cities.map((c, i) => cities.slice(i + 1, i + 3).map((d, j) => (
                  <svg key={`cl-${i}-${j}`} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke={T.primary} strokeWidth="0.2" opacity="0.25" />
                  </svg>
                )))}
                {cities.map((c, i) => (
                  <button key={`city-${i}`} onClick={() => setSel(c)} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                    <div className="w-3 h-3 rounded-full border-2 transition-all" style={{ background: sc(c.status), borderColor: sel.name === c.name ? T.text : sc(c.status), boxShadow: `0 0 ${sel.name === c.name ? 14 : 7}px ${sc(c.status)}90`, transform: sel.name === c.name ? "scale(1.6)" : "scale(1)" }} />
                    {sel.name === c.name && <div className="absolute z-10 bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg text-xs font-semibold pointer-events-none" style={{ background: T.cardLight, color: T.text, border: `1px solid ${T.border}` }}>{c.name}</div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 px-4 pb-4">
                {[{ l: "Online", c: T.success }, { l: "Verified", c: T.secondary }, { l: "Warning", c: T.warning }, { l: "Critical", c: "#EF4444" }, { l: "Offline", c: T.gray }].map((s, i) => (
                  <div key={`ns-leg-${i}`} className="flex items-center gap-1.5 text-xs" style={{ color: T.textSub }}><span className="w-2 h-2 rounded-full" style={{ background: s.c }} />{s.l}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-3"><MapPin size={14} style={{ color: T.primary }} /><span className="font-bold" style={{ color: T.text }}>{sel.name}</span><span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: `${sc(sel.status)}18`, color: sc(sel.status) }}>{sel.status}</span></div>
              {[{ l: "Telas", v: sel.screens.toLocaleString("pt-BR") }, { l: "Trust Score", v: sel.trust.toFixed(1) }].map((r, i) => (
                <div key={`ns-cd-${i}`} className="flex justify-between py-2 border-b last:border-b-0 text-sm" style={{ borderColor: T.border }}><span style={{ color: T.textSub }}>{r.l}</span><span className="font-semibold" style={{ color: T.text }}>{r.v}</span></div>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="px-4 py-2 border-b text-xs font-semibold grid grid-cols-3 gap-2" style={{ borderColor: T.border, color: T.textSub }}><span className="col-span-2">Cidade</span><span>Telas</span></div>
              <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                {cities.map((c, i) => (
                  <button key={`ns-cr-${i}`} onClick={() => setSel(c)} className="w-full px-4 py-2 grid grid-cols-3 gap-2 text-xs text-left hover:bg-white/5 transition-colors" style={{ background: sel.name === c.name ? `${T.primary}15` : "transparent" }}>
                    <span className="col-span-2 font-medium" style={{ color: T.text }}>{c.name}</span>
                    <span style={{ color: T.textSub }}>{c.screens.toLocaleString("pt-BR")}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => onNavigate?.("network-map")} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 16px ${T.primary}40` }}>
              <Network size={16} /> Abrir Network Center <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrazilMapSection({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const cities = [
    { name: "São Paulo", x: 52, y: 65, screens: 4821, campaigns: 312, trust: 98.1, sla: 99.9, status: "online" },
    { name: "Rio de Janeiro", x: 56, y: 68, screens: 2140, campaigns: 187, trust: 97.4, sla: 99.8, status: "online" },
    { name: "Belo Horizonte", x: 53, y: 60, screens: 1203, campaigns: 98, trust: 96.8, sla: 99.7, status: "online" },
    { name: "Brasília", x: 50, y: 50, screens: 891, campaigns: 72, trust: 97.2, sla: 99.9, status: "online" },
    { name: "Curitiba", x: 50, y: 72, screens: 724, campaigns: 61, trust: 97.9, sla: 100, status: "online" },
    { name: "Porto Alegre", x: 48, y: 80, screens: 612, campaigns: 48, trust: 97.5, sla: 99.8, status: "online" },
    { name: "Salvador", x: 60, y: 45, screens: 589, campaigns: 43, trust: 96.1, sla: 99.5, status: "verified" },
    { name: "Fortaleza", x: 62, y: 28, screens: 487, campaigns: 35, trust: 95.8, sla: 99.2, status: "verified" },
    { name: "Manaus", x: 32, y: 28, screens: 234, campaigns: 18, trust: 93.2, sla: 98.1, status: "warning" },
    { name: "Recife", x: 67, y: 36, screens: 398, campaigns: 29, trust: 95.4, sla: 99.0, status: "verified" },
  ];
  const [sel, setSel] = useState(cities[0]);
  const sc = (s: string) => s === "online" ? T.success : s === "verified" ? T.secondary : s === "warning" ? T.warning : "#EF4444";
  return (
    <section style={{ background: "#030D1F" }} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><Network size={12} /> Network Operations Center</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Rede Nacional em Tempo Real</h2><p className="text-lg" style={{ color: T.textSub }}>Monitoramento operacional de toda a infraestrutura DOOHPLAY.</p></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border, minHeight: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
              <div className="relative w-full h-96 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ opacity: 0.15 }}>
                  <path d="M35,15 L45,12 L55,14 L65,18 L72,25 L75,35 L73,42 L70,48 L68,55 L65,62 L60,68 L57,72 L55,78 L52,83 L50,88 L48,82 L45,75 L42,70 L38,65 L35,60 L30,55 L27,48 L25,40 L26,32 L30,24 Z" fill="none" stroke={T.primary} strokeWidth="1" />
                </svg>
                {cities.map((c, i) => (
                  <button key={`bmc-${i}`} onClick={() => setSel(c)} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                    <div className="w-3 h-3 rounded-full border-2 transition-all" style={{ background: sc(c.status), borderColor: sel.name === c.name ? T.text : sc(c.status), boxShadow: `0 0 ${sel.name === c.name ? 12 : 6}px ${sc(c.status)}80`, transform: sel.name === c.name ? "scale(1.5)" : "scale(1)" }} />
                    {sel.name === c.name && <div className="absolute z-10 bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg text-xs font-semibold pointer-events-none" style={{ background: T.cardLight, color: T.text, border: `1px solid ${T.border}` }}>{c.name}</div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 px-4 pb-4">
                {[{ l: "Online", c: T.success }, { l: "Verified", c: T.secondary }, { l: "Warning", c: T.warning }, { l: "Offline", c: "#EF4444" }].map((s, i) => (
                  <div key={`bmleg-${i}`} className="flex items-center gap-1.5 text-xs" style={{ color: T.textSub }}><span className="w-2 h-2 rounded-full" style={{ background: s.c }} />{s.l}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-2 mb-3"><MapPin size={14} style={{ color: T.primary }} /><span className="font-bold" style={{ color: T.text }}>{sel.name}</span><span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto" style={{ background: `${sc(sel.status)}18`, color: sc(sel.status) }}>{sel.status}</span></div>
              {[{ l: "Telas", v: sel.screens.toLocaleString("pt-BR") }, { l: "Campanhas", v: sel.campaigns.toString() }, { l: "Trust Score", v: sel.trust.toString() }, { l: "SLA", v: `${sel.sla}%` }].map((r, i) => (
                <div key={`bmcd-${i}`} className="flex justify-between py-2 border-b last:border-b-0 text-sm" style={{ borderColor: T.border }}><span style={{ color: T.textSub }}>{r.l}</span><span className="font-semibold" style={{ color: T.text }}>{r.v}</span></div>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="px-4 py-2 border-b text-xs font-semibold grid grid-cols-4 gap-2" style={{ borderColor: T.border, color: T.textSub }}><span className="col-span-2">Cidade</span><span>Telas</span><span>St.</span></div>
              <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                {cities.map((c, i) => (
                  <button key={`bmcr-${i}`} onClick={() => setSel(c)} className="w-full px-4 py-2 grid grid-cols-4 gap-2 text-xs text-left hover:bg-white/5 transition-colors" style={{ background: sel.name === c.name ? `${T.primary}15` : "transparent" }}>
                    <span className="col-span-2 font-medium" style={{ color: T.text }}>{c.name}</span>
                    <span style={{ color: T.textSub }}>{c.screens.toLocaleString("pt-BR")}</span>
                    <span className="w-2 h-2 rounded-full mt-0.5 block" style={{ background: sc(c.status) }} />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => onNavigate?.("network-map")} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 16px ${T.primary}40` }}>
              <Network size={16} /> Abrir Network Center <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofFlowSection() {
  const steps = [
    { icon: Tv, label: "TV", sub: "Exibição ao vivo", color: T.primary },
    { icon: Cpu, label: "Player", sub: "Captura em tempo real", color: T.secondary },
    { icon: Lock, label: "ICP Brasil", sub: "Assinatura A3", color: T.purple },
    { icon: Database, label: "Merkle Root", sub: "Hash verificável", color: T.warning },
    { icon: Link2, label: "Ethereum", sub: "Bloco #18.2M", color: T.success },
    { icon: Globe, label: "ProofChain", sub: "Explorer público", color: T.secondary },
    { icon: Shield, label: "Trust Center", sub: "Score 97.3", color: T.primary },
    { icon: Eye, label: "Auditoria", sub: "100% pública", color: T.success },
  ];
  return (
    <section style={{ background: T.bg }} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><Shield size={12} /> Proof-of-Play Auditável</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Cada exibição e registrada, assinada e auditável.</h2><p className="text-lg" style={{ color: T.textSub }}>Transparência total do player a blockchain.</p></div></FadeIn>
        <div className="flex flex-wrap justify-center gap-0 mb-12">
          {steps.map((s, i) => (
            <FadeIn key={`ps-${i}`} delay={i * 60}>
              <div className="flex items-center">
                <div className="flex flex-col items-center p-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all hover:scale-110" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, boxShadow: `0 4px 16px ${s.color}20` }}><s.icon size={24} style={{ color: s.color }} /></div>
                  <div className="text-sm font-semibold text-center" style={{ color: T.text }}>{s.label}</div>
                  <div className="text-xs text-center mt-0.5" style={{ color: T.textSub }}>{s.sub}</div>
                </div>
                {i < steps.length - 1 && <div className="text-xl mx-1" style={{ color: T.border }}>{"→"}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ v: "4.8M", l: "Provas Registradas", c: T.success }, { v: "100%", l: "Auditável", c: T.primary }, { v: "97.3", l: "Trust Score", c: T.warning }, { v: "0", l: "Fraudes Detectadas", c: T.success }].map((s, i) => (
            <FadeIn key={`pf-${i}`} delay={i * 80}><div className="text-center p-6 rounded-2xl border" style={{ background: T.card, borderColor: `${s.c}30` }}><div className="text-3xl font-bold mb-1" style={{ color: s.c }}>{s.v}</div><div className="text-sm" style={{ color: T.textSub }}>{s.l}</div></div></FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function RetailMediaSection() {
  const growthData = [
    { m: "Jan", local: 2.1, regional: 8.4, national: 42 }, { m: "Fev", local: 2.4, regional: 9.2, national: 48 },
    { m: "Mar", local: 2.8, regional: 10.1, national: 55 }, { m: "Abr", local: 3.2, regional: 11.4, national: 62 },
    { m: "Mai", local: 3.8, regional: 12.0, national: 71 }, { m: "Jun", local: 4.2, regional: 12.4, national: 84 },
  ];
  return (
    <section className="py-24 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><ShoppingBag size={12} /> Retail Media Network</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Monetize suas telas automaticamente.</h2><p className="text-lg" style={{ color: T.textSub }}>Anunciantes nacionais chegam diretamente na sua tela.</p></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            {[{ l: "Receita Local", v: "R$847", sub: "Por tela / mês", c: T.success, icon: Tv }, { l: "Receita Regional", v: "R$12.4K", sub: "Rede de lojas / mês", c: T.primary, icon: Layers }, { l: "Receita Nacional", v: "R$8.4M", sub: "Total rede / mês", c: T.secondary, icon: Globe }].map((r, i) => (
              <FadeIn key={`rc-${i}`} delay={i * 80}>
                <div className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:-translate-x-1" style={{ background: T.card, borderColor: `${r.c}30` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.c}18` }}><r.icon size={22} style={{ color: r.c }} /></div>
                  <div className="flex-1"><div className="text-sm" style={{ color: T.textSub }}>{r.l}</div><div className="text-2xl font-bold" style={{ color: T.text }}>{r.v}</div><div className="text-xs" style={{ color: T.gray }}>{r.sub}</div></div>
                  <TrendingUp size={20} style={{ color: r.c }} />
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={200}>
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4"><div className="font-semibold" style={{ color: T.text }}>Crescimento de Receita</div><div className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: `${T.success}18`, color: T.success }}>+23% / mês</div></div>
              {(() => {
                const W = 460, H = 170, pL = 8, pR = 8, pT = 10, pB = 24;
                const cW = W - pL - pR, cH = H - pT - pB, n = growthData.length;
                const pts = (key: "local" | "regional" | "national") => {
                  const vs = growthData.map(d => d[key]);
                  const lo = Math.min(...vs), range = Math.max(...vs) - lo;
                  return growthData.map((d, i) =>
                    `${(pL + (i / (n - 1)) * cW).toFixed(1)},${(pT + cH * (1 - (d[key] - lo) / range)).toFixed(1)}`
                  ).join(" ");
                };
                return (
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                    {[0.25, 0.5, 0.75].map(v => (
                      <line key={v} x1={pL} x2={W - pR} y1={pT + cH * (1 - v)} y2={pT + cH * (1 - v)}
                        stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 3" />
                    ))}
                    {growthData.map((d, i) => (
                      <text key={d.m} x={pL + (i / (n - 1)) * cW} y={H - 6}
                        textAnchor="middle" fontSize="10" fill={T.textSub}>{d.m}</text>
                    ))}
                    <polyline points={pts("local")} fill="none" stroke={T.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={pts("regional")} fill="none" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={pts("national")} fill="none" stroke={T.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                );
              })()}
              <div className="flex gap-4 mt-3">
                {[{ l: "Fill Rate", v: "78%" }, { l: "CPM", v: "R$18.40" }, { l: "Anunciantes", v: "1.247" }].map((m, i) => (
                  <div key={`rs-${i}`} className="flex-1 text-center"><div className="text-sm font-bold" style={{ color: T.text }}>{m.v}</div><div className="text-xs" style={{ color: T.textSub }}>{m.l}</div></div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function AIRevenueSection({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const nodePos = [
    { x: 10, y: 10 }, { x: 26, y: 10 }, { x: 42, y: 10 }, { x: 58, y: 10 }, { x: 74, y: 10 }, { x: 90, y: 10 },
    { x: 10, y: 35 }, { x: 26, y: 35 }, { x: 42, y: 35 }, { x: 58, y: 35 }, { x: 74, y: 35 }, { x: 90, y: 35 },
    { x: 10, y: 60 }, { x: 26, y: 60 }, { x: 42, y: 60 }, { x: 58, y: 60 }, { x: 74, y: 60 }, { x: 90, y: 60 },
    { x: 10, y: 85 }, { x: 26, y: 85 }, { x: 42, y: 85 }, { x: 58, y: 85 }, { x: 74, y: 85 }, { x: 90, y: 85 },
  ];
  const active = new Set([0, 1, 3, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
  const lines: { x1: number; y1: number; x2: number; y2: number; k: string; a: boolean }[] = [];
  nodePos.forEach((n, i) => { nodePos.slice(i + 1, i + 4).forEach((m, j) => { lines.push({ x1: n.x, y1: n.y, x2: m.x, y2: m.y, k: `nl-${i}-${j}`, a: active.has(i) && active.has(i + 1 + j) }); }); });
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #020617 0%, #0A1628 50%, #020617 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 70% 50%, ${T.primary}12, transparent)` }} />
      <div className="max-w-7xl mx-auto relative">
        <FadeIn><div className="text-center mb-16"><SectionLabel><Brain size={12} /> AI Revenue Engine</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Inteligência Artificial para maximizar receita.</h2><p className="text-lg" style={{ color: T.textSub }}>Algoritmos analisam ocupação, audiência e performance para aumentar faturamento.</p></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="relative rounded-2xl border p-6 overflow-hidden" style={{ background: `${T.card}CC`, borderColor: `${T.primary}30`, minHeight: 280, boxShadow: `0 0 60px ${T.primary}18` }}>
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                {lines.map(ln => <line key={ln.k} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke={T.primary} strokeWidth="0.3" opacity={ln.a ? 0.8 : 0.2} />)}
                {nodePos.map((n, i) => <circle key={`nn-${i}`} cx={n.x} cy={n.y} r={active.has(i) ? 1.2 : 0.6} fill={active.has(i) ? T.secondary : T.primary} opacity={active.has(i) ? 1 : 0.4} />)}
              </svg>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${T.primary}30`, border: `1px solid ${T.primary}40` }}><Brain size={20} style={{ color: T.secondary }} /></div>
                  <div><div className="font-bold" style={{ color: T.text }}>Neural Revenue Engine</div><div className="text-xs" style={{ color: T.textSub }}>Processando 84.2M impressões</div></div>
                  <PulseDot color={T.secondary} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[{ l: "Modelos Ativos", v: "14" }, { l: "Precisão", v: "97%" }, { l: "ROI", v: "+31%" }].map((m, i) => (
                    <div key={`am-${i}`} className="text-center p-3 rounded-xl" style={{ background: `${T.primary}12`, border: `1px solid ${T.primary}20` }}>
                      <div className="text-lg font-bold" style={{ color: T.secondary }}>{m.v}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 gap-4">
            {[{ l: "Revenue Optimization", v: "+21%", sub: "vs mês anterior", c: T.success, icon: TrendingUp }, { l: "Fill Rate", v: "68%", sub: "Ocupação média", c: T.primary, icon: BarChart2 }, { l: "Dynamic Pricing", v: "+14%", sub: "CPM otimizado", c: T.secondary, icon: DollarSign }, { l: "Campaign Matching", v: "97%", sub: "Precisão de targeting", c: T.warning, icon: BarChart2 }, { l: "Audience Prediction", v: "93%", sub: "Acurácia do modelo", c: T.purple, icon: Brain }].map((k, i) => (
              <FadeIn key={`ak-${i}`} delay={i * 60}>
                <div className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02]" style={{ background: `${T.card}99`, borderColor: `${k.c}20` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.c}18` }}><k.icon size={18} style={{ color: k.c }} /></div>
                  <div className="flex-1"><div className="text-sm" style={{ color: T.textSub }}>{k.l}</div><div className="text-xs" style={{ color: T.gray }}>{k.sub}</div></div>
                  <div className="text-2xl font-bold" style={{ color: k.c }}>{k.v}</div>
                </div>
              </FadeIn>
            ))}
            <button onClick={() => onNavigate?.("ai-revenue")} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: `${T.purple}18`, color: T.purple, border: `1px solid ${T.purple}30` }}>
              <Brain size={16} /> Explorar AI Revenue Engine <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueShareSection() {
  const flow = [
    { label: "Anunciante", icon: Building2, color: T.primary },
    { label: "DOOHPLAY Marketplace", icon: ShoppingBag, color: T.secondary },
    { label: "Rede de Telas", icon: Network, color: T.purple },
    { label: "Comércio", icon: Tv, color: T.success },
    { label: "Receita Compartilhada", icon: DollarSign, color: T.warning },
  ];
  return (
    <section className="py-24 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><DollarSign size={12} /> Revenue Share</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Como a monetização funciona</h2><p className="text-lg" style={{ color: T.textSub }}>Da campanha do anunciante a receita no seu bolso.</p></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="flex flex-col items-center gap-0">
              {flow.map((f, i) => (
                <div key={`rs-flow-${i}`} className="flex flex-col items-center w-full max-w-xs">
                  <div className="flex items-center gap-4 w-full p-4 rounded-2xl border transition-all hover:scale-105" style={{ background: T.card, borderColor: `${f.color}30`, boxShadow: `0 4px 20px ${f.color}12` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}18` }}><f.icon size={20} style={{ color: f.color }} /></div>
                    <span className="font-semibold" style={{ color: T.text }}>{f.label}</span>
                  </div>
                  {i < flow.length - 1 && <div className="flex flex-col items-center py-1"><div className="w-0.5 h-4" style={{ background: `linear-gradient(${flow[i].color}, ${flow[i + 1].color})` }} /><div className="text-sm" style={{ color: T.gray }}>↓</div><div className="w-0.5 h-4" style={{ background: `linear-gradient(${flow[i].color}, ${flow[i + 1].color})` }} /></div>}
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex flex-col gap-4">
              {[{ l: "Receita Local", v: "R$847", sub: "Por tela / mês", c: T.success, trend: "+18%" }, { l: "Receita Regional", v: "R$12.4K", sub: "Rede de 24 lojas / mês", c: T.primary, trend: "+24%" }, { l: "Receita Nacional", v: "R$8.4M", sub: "Total rede nacional / mês", c: T.secondary, trend: "+23%" }].map((r, i) => (
                <div key={`rsv-${i}`} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: `${r.c}30` }}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm" style={{ color: T.textSub }}>{r.l}</span><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${T.success}18`, color: T.success }}>{r.trend}</span></div>
                  <div className="text-3xl font-bold" style={{ color: r.c }}>{r.v}</div>
                  <div className="text-xs mt-1" style={{ color: T.gray }}>{r.sub}</div>
                </div>
              ))}
              <div className="p-4 rounded-2xl border" style={{ background: `${T.primary}08`, borderColor: `${T.primary}20` }}>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={14} style={{ color: T.success }} /><span className="text-sm font-semibold" style={{ color: T.text }}>Sem investimento inicial</span></div>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={14} style={{ color: T.success }} /><span className="text-sm font-semibold" style={{ color: T.text }}>Pagamento automático mensalmente</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} style={{ color: T.success }} /><span className="text-sm font-semibold" style={{ color: T.text }}>100% auditável via blockchain</span></div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CasesSection() {
  const cases = [
    { seg: "Padaria", icon: "🥐", metric: "+347%", label: "receita", color: T.success },
    { seg: "Farmácia", icon: "💊", metric: "+212%", label: "ocupação", color: T.primary },
    { seg: "Academia", icon: "🏋️", metric: "+184%", label: "engajamento", color: T.secondary },
    { seg: "Shopping", icon: "🏬", metric: "4.2M", label: "impressões", color: T.warning },
    { seg: "Rede Varejista", icon: "🏷️", metric: "99.9%", label: "SLA", color: T.purple },
    { seg: "Agência", icon: "📺", metric: "100%", label: "auditável", color: T.success },
  ];
  return (
    <section className="py-24 px-6" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Star size={12} /> Cases de Sucesso</SectionLabel><h2 className="text-4xl font-bold mb-3" style={{ color: T.text }}>Resultados Reais</h2><p className="text-lg" style={{ color: T.textSub }}>Números verificados na blockchain DOOHPLAY.</p></div></FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cases.map((c, i) => (
            <FadeIn key={`cs-${i}`} delay={i * 60}>
              <div className="p-5 rounded-2xl border flex flex-col items-center text-center transition-all hover:-translate-y-2" style={{ background: T.card, borderColor: `${c.color}25`, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${c.color}60`; el.style.boxShadow = `0 8px 32px ${c.color}20`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${c.color}25`; el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}>
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="text-xs font-semibold mb-2" style={{ color: T.textSub }}>{c.seg}</div>
                <div className="text-2xl font-bold" style={{ color: c.color }}>{c.metric}</div>
                <div className="text-xs mt-1" style={{ color: T.gray }}>{c.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ROICalculator({ onSelect }: { onSelect: (v: string) => void }) {
  const [tvs, setTvs] = useState(3);
  const [segment, setSegment] = useState("Padaria");
  const [hours, setHours] = useState(12);
  const segmentMultiplier: Record<string, number> = {
    "Padaria": 1.0, "Cafeteria": 1.1, "Restaurante": 1.3, "Farmácia": 1.5,
    "Academia": 1.2, "Supermercado": 1.8, "Shopping": 2.5, "Franquia": 1.6,
  };
  const baseCPM = 18.4;
  const fillRate = 0.68;
  const impressionsPerHour = 120;
  const mult = segmentMultiplier[segment] || 1.0;
  const monthlyImpressions = tvs * hours * impressionsPerHour * 30;
  const monthlyRevenue = Math.round((monthlyImpressions / 1000) * baseCPM * fillRate * mult);
  const annualRevenue = monthlyRevenue * 12;
  const cpm = (baseCPM * mult).toFixed(2);
  const fillPct = Math.round(fillRate * 100);
  return (
    <section className="py-24 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Calculator size={12} /> ROI Calculator</SectionLabel><h2 className="text-4xl font-bold mb-3" style={{ color: T.text }}>Quanto sua TV pode gerar?</h2><p className="text-lg" style={{ color: T.textSub }}>Simule a receita estimada para o seu negócio.</p></div></FadeIn>
        <FadeIn delay={100}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 border-b md:border-b-0 md:border-r" style={{ borderColor: T.border }}>
                <div className="text-sm font-bold mb-6" style={{ color: T.textSub }}>CONFIGURE SUA REDE</div>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: T.text }}>Quantidade de TVs: <span style={{ color: T.primary }}>{tvs}</span></label>
                    <input type="range" min={1} max={50} value={tvs} onChange={e => setTvs(Number(e.target.value))} className="w-full accent-blue-500" style={{ accentColor: T.primary }} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: T.gray }}><span>1</span><span>50</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: T.text }}>Segmento</label>
                    <div className="relative">
                      <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full px-4 py-3 rounded-xl appearance-none text-sm" style={{ background: T.cardLight, color: T.text, border: `1px solid ${T.border}` }}>
                        {Object.keys(segmentMultiplier).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3.5 pointer-events-none" style={{ color: T.gray }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: T.text }}>Horas por dia: <span style={{ color: T.primary }}>{hours}h</span></label>
                    <input type="range" min={4} max={24} value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full" style={{ accentColor: T.primary }} />
                    <div className="flex justify-between text-xs mt-1" style={{ color: T.gray }}><span>4h</span><span>24h</span></div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="text-sm font-bold mb-6" style={{ color: T.textSub }}>RECEITA ESTIMADA</div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl" style={{ background: `${T.success}10`, border: `1px solid ${T.success}30` }}>
                    <div className="text-xs" style={{ color: T.textSub }}>Receita mensal estimada</div>
                    <div className="text-4xl font-bold mt-1" style={{ color: T.success }}>R${monthlyRevenue.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: `${T.primary}10`, border: `1px solid ${T.primary}30` }}>
                    <div className="text-xs" style={{ color: T.textSub }}>Receita anual estimada</div>
                    <div className="text-3xl font-bold mt-1" style={{ color: T.primary }}>R${annualRevenue.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl text-center" style={{ background: T.cardLight }}>
                      <div className="text-sm font-bold" style={{ color: T.secondary }}>R${cpm}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>CPM medio</div>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: T.cardLight }}>
                      <div className="text-sm font-bold" style={{ color: T.warning }}>{fillPct}%</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Fill Rate</div>
                    </div>
                  </div>
                  <button onClick={() => onSelect("screen-setup")} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 16px ${T.primary}40` }}>
                    <Tv size={16} /> Começar Agora <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function DashboardShowcase() {
  const [tab, setTab] = useState<"local" | "business" | "enterprise">("local");
  return (
    <section className="py-24 px-6" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12"><SectionLabel><LayoutDashboard size={12} /> Dashboards por Perfil</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>A experiência certa para cada perfil.</h2></div>
          <div className="flex justify-center gap-2 mb-10">
            {(["local", "business", "enterprise"] as const).map(t => (
              <button key={`dt-${t}`} onClick={() => setTab(t)} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all" style={{ background: tab === t ? T.primary : T.card, color: tab === t ? "#fff" : T.textSub, border: `1px solid ${tab === t ? T.primary : T.border}`, boxShadow: tab === t ? `0 4px 12px ${T.primary}40` : "none" }}>
                {t === "local" ? "Local" : t === "business" ? "Business" : "Enterprise"}
              </button>
            ))}
          </div>
        </FadeIn>
        {tab === "local" && <FadeIn><div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}><div className="flex items-center justify-between mb-4"><div><div className="font-bold text-lg" style={{ color: T.text }}>Padaria São Paulo</div><div className="text-sm" style={{ color: T.textSub }}>Dashboard Local</div></div><div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${T.success}18`, color: T.success, border: `1px solid ${T.success}30` }}><PulseDot /> TV Online</div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ l: "Receita Hoje", v: "R$142", c: T.success }, { l: "Impressões", v: "1.847", c: T.primary }, { l: "Conteúdos", v: "12", c: T.secondary }, { l: "Ganhos Futuros", v: "R$3.2K", c: T.warning }].map((m, i) => (<div key={`lm-${i}`} className="p-4 rounded-xl text-center" style={{ background: T.cardLight }}><div className="text-xl font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-xs mt-1" style={{ color: T.textSub }}>{m.l}</div></div>))}</div></div></FadeIn>}
        {tab === "business" && <FadeIn><div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}><div className="font-bold text-lg mb-1" style={{ color: T.text }}>Rede de Lojas</div><div className="text-sm mb-4" style={{ color: T.textSub }}>Dashboard Business — 24 unidades</div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ l: "Receita Consolidada", v: "R$12.4K", c: T.success }, { l: "Campanhas Ativas", v: "8", c: T.primary }, { l: "Performance", v: "94%", c: T.secondary }, { l: "SLA", v: "99.8%", c: T.warning }].map((m, i) => (<div key={`bm-${i}`} className="p-4 rounded-xl text-center" style={{ background: T.cardLight }}><div className="text-xl font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-xs mt-1" style={{ color: T.textSub }}>{m.l}</div></div>))}</div></div></FadeIn>}
        {tab === "enterprise" && <FadeIn><div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}><div className="flex items-center justify-between mb-4"><div><div className="font-bold text-lg" style={{ color: T.text }}>Enterprise Dashboard</div><div className="text-sm" style={{ color: T.textSub }}>12.847 telas · Rede Nacional</div></div><div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${T.primary}18`, color: T.primary, border: `1px solid ${T.primary}30` }}><PulseDot color={T.primary} /> Blockchain Sync</div></div><div className="grid grid-cols-3 md:grid-cols-6 gap-4">{[{ l: "Impressões", v: "84.2M", c: T.primary }, { l: "CPM", v: "R$18.40", c: T.secondary }, { l: "Reach", v: "2.4M", c: T.success }, { l: "Blockchain", v: "SYNC", c: T.purple }, { l: "Trust Score", v: "97.3", c: T.warning }, { l: "SLA", v: "99.9%", c: T.success }].map((m, i) => (<div key={`em-${i}`} className="p-4 rounded-xl text-center" style={{ background: T.cardLight }}><div className="text-xl font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-xs mt-1" style={{ color: T.textSub }}>{m.l}</div></div>))}</div></div></FadeIn>}
      </div>
    </section>
  );
}

function TrustCenterSection({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const score = 97.3; const r = 54; const circ = 2 * Math.PI * r; const offset = circ * (1 - score / 100);
  const radarMetrics = [
    { label: "ICP", value: 98 }, { label: "Blockchain", value: 97 }, { label: "Merkle", value: 99 },
    { label: "SLA", value: 99 }, { label: "LGPD", value: 95 }, { label: "APIs", value: 92 }, { label: "Trust", value: 97 },
  ];
  const n = radarMetrics.length;
  const cx = 100; const cy = 100; const radius = 72;
  const getPoint = (i: number, scale: number) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    return { x: cx + radius * scale * (radarMetrics[i].value / 100) * Math.cos(angle), y: cy + radius * scale * (radarMetrics[i].value / 100) * Math.sin(angle) };
  };
  const getGrid = (scale: number) => radarMetrics.map((_, i) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    return `${cx + radius * scale * Math.cos(angle)},${cy + radius * scale * Math.sin(angle)}`;
  }).join(" ");
  const dataPoints = radarMetrics.map((_, i) => getPoint(i, 1));
  const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ");
  const labelPos = radarMetrics.map((_, i) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    return { x: cx + (radius + 18) * Math.cos(angle), y: cy + (radius + 18) * Math.sin(angle) };
  });
  return (
    <section style={{ background: "#030D1F" }} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-16"><SectionLabel><Shield size={12} /> Trust Center</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Confiança verificável.</h2></div></FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <FadeIn>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-6">
                <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r={r} fill="none" stroke={`${T.primary}18`} strokeWidth="10" />
                  <circle cx="64" cy="64" r={r} fill="none" stroke={T.primary} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-4xl font-bold" style={{ color: T.text }}>97.3</div><div className="text-xs font-semibold" style={{ color: T.primary }}>TRUST SCORE</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {[{ l: "Assinatura ICP", v: "A3 Ativo", c: T.success }, { l: "Blockchain", v: "Sync", c: T.success }, { l: "Merkle Root", v: "Verified", c: T.success }, { l: "SLA", v: "99.9%", c: T.primary }, { l: "LGPD", v: "Compliance", c: T.warning }, { l: "APIs", v: "Ativas", c: T.secondary }].map((m, i) => (
                  <div key={`tm-${i}`} className="flex justify-between px-3 py-2 rounded-lg text-sm" style={{ background: T.card, border: `1px solid ${T.border}` }}><span style={{ color: T.textSub }}>{m.l}</span><span className="font-semibold" style={{ color: m.c }}>{m.v}</span></div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="flex justify-center">
              <svg viewBox="0 0 200 200" width="280" height="280">
                {[0.25, 0.5, 0.75, 1].map((s, i) => (
                  <polygon key={`rg-${i}`} points={getGrid(s)} fill="none" stroke={`${T.primary}${i === 3 ? "30" : "15"}`} strokeWidth="0.8" />
                ))}
                {radarMetrics.map((_, i) => {
                  const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
                  return <line key={`rl-${i}`} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke={`${T.primary}20`} strokeWidth="0.8" />;
                })}
                <polygon points={polyPoints} fill={`${T.primary}25`} stroke={T.primary} strokeWidth="1.5" />
                {dataPoints.map((p, i) => (
                  <circle key={`rd-${i}`} cx={p.x} cy={p.y} r="3" fill={T.primary} stroke={T.secondary} strokeWidth="1.5" />
                ))}
                {labelPos.map((p, i) => (
                  <text key={`rlb-${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={T.textSub}>{radarMetrics[i].label}</text>
                ))}
              </svg>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[{ l: "Trust Score", v: "97.3", c: T.primary, icon: Shield }, { l: "Provas Auditadas", v: "4.8M", c: T.success, icon: CheckCircle2 }, { l: "SLA", v: "99.9%", c: T.warning, icon: Activity }, { l: "Auditável", v: "100%", c: T.secondary, icon: Eye }].map((c, i) => (
                <div key={`tc-${i}`} className="p-5 rounded-2xl border text-center" style={{ background: T.card, borderColor: `${c.c}30` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${c.c}18` }}><c.icon size={20} style={{ color: c.c }} /></div>
                  <div className="text-2xl font-bold" style={{ color: c.c }}>{c.v}</div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>{c.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate?.("trust-center")} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 16px ${T.primary}40` }}>
              <Shield size={16} /> Abrir Trust Center <ArrowRight size={14} />
            </button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function ProofChainExplorer({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const rows = [
    { hash: "0x7f2a...c4e1", screen: "SP-Centro-01", block: "18,241,872", status: "verified", city: "São Paulo", campaign: "Nike Q3" },
    { hash: "0x3b9c...f8d2", screen: "RJ-Copac-04", block: "18,241,871", status: "verified", city: "Rio de Janeiro", campaign: "Samsung" },
    { hash: "0xac4f...1e73", screen: "BH-Savas-02", block: "18,241,870", status: "verified", city: "BH", campaign: "iFood" },
    { hash: "0x2d8e...9b51", screen: "BSB-Pilot-07", block: "18,241,869", status: "pending", city: "Brasília", campaign: "Vivo" },
    { hash: "0xf71b...4c29", screen: "CTB-Água-03", block: "18,241,868", status: "verified", city: "Curitiba", campaign: "Renner" },
  ];
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "Hash", "Tela", "Campanha", "Bloco", "Cidade", "Status"];
  return (
    <section className="py-24 px-6" style={{ background: T.bg }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Link2 size={12} /> ProofChain Explorer</SectionLabel><h2 className="text-4xl font-bold mb-4" style={{ color: T.text }}>Cada prova verificável por qualquer pessoa.</h2></div></FadeIn>
        <FadeIn>
          <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="p-4 border-b flex flex-wrap gap-3" style={{ borderColor: T.border }}>
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-48" style={{ background: T.cardLight, border: `1px solid ${T.border}` }}><Search size={16} style={{ color: T.gray }} /><span className="text-sm" style={{ color: T.gray }}>Pesquisar hash, tela ou campanha...</span></div>
              <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                  <button key={`pcf-${f}`} onClick={() => setFilter(f)} className="px-3 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: filter === f ? T.primary : T.cardLight, color: filter === f ? "#fff" : T.textSub, border: `1px solid ${filter === f ? T.primary : T.border}` }}>{f}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: `${T.success}18`, color: T.success }}><PulseDot /> Atualização ao vivo</div>
            </div>
            <div className="grid grid-cols-4 px-4 py-2 text-xs font-semibold border-b" style={{ borderColor: T.border, color: T.textSub }}><span>Hash</span><span>Tela</span><span>Bloco</span><span>Status</span></div>
            {rows.map((rw, i) => (
              <div key={`pr-${i}`} className="grid grid-cols-4 px-4 py-3 border-b last:border-b-0 hover:bg-white/5 transition-colors" style={{ borderColor: T.border }}>
                <div className="flex items-center gap-2"><span className="text-sm font-mono" style={{ color: T.primary }}>{rw.hash}</span><button onClick={() => { setCopied(rw.hash); setTimeout(() => setCopied(null), 1500); }}>{copied === rw.hash ? <CheckCircle2 size={12} style={{ color: T.success }} /> : <Copy size={12} style={{ color: T.gray }} />}</button></div>
                <span className="text-sm" style={{ color: T.textSub }}>{rw.screen}</span>
                <span className="text-sm font-mono" style={{ color: T.text }}>#{rw.block}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold w-fit px-2 py-0.5 rounded-full" style={{ background: rw.status === "verified" ? `${T.success}18` : `${T.warning}18`, color: rw.status === "verified" ? T.success : T.warning }}>
                  {rw.status === "verified" ? <CheckCircle2 size={10} /> : <Activity size={10} />}{rw.status === "verified" ? "Verificado" : "Pendente"}
                </span>
              </div>
            ))}
            <div className="p-4 flex gap-3 justify-center">
              <button onClick={() => onNavigate?.("blockchain-explorer")} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: `${T.purple}18`, color: T.purple, border: `1px solid ${T.purple}30` }}><ExternalLink size={14} /> Abrir Explorer Completo</button>
              <button onClick={() => onNavigate?.("blockchain-explorer")} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 12px ${T.primary}40` }}><ExternalLink size={14} /> Abrir Explorer Enterprise</button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ProfileCards({ onSelect }: { onSelect: (v: string) => void }) {
  const profiles = [
    { title: "Comércio Local", sub: "Transforme sua TV em fonte de renda.", icon: Tv, color: T.success, features: ["Receita passiva", "TV Online 24/7", "Anúncios automáticos", "Sem contrato"], cta: "Começar Agora", view: "local" },
    { title: "Rede de Lojas", sub: "Gestão centralizada de multiplas unidades.", icon: Layers, color: T.primary, features: ["Campanhas unificadas", "Relatórios consolidados", "SLA garantido", "Suporte Business"], cta: "Gerenciar Rede", view: "business", highlight: true },
    { title: "Agência / Anunciante", sub: "Proof-of-Play auditável com blockchain.", icon: Shield, color: T.purple, features: ["Proof-of-Play", "Blockchain Ethereum", "ICP Brasil A3", "APIs Enterprise"], cta: "Acessar Enterprise", view: "enterprise" },
  ];
  return (
    <section className="py-24 px-6" style={{ background: "#030D1F" }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn><div className="text-center mb-12"><SectionLabel><Star size={12} /> Escolha seu Perfil</SectionLabel><h2 className="text-4xl font-bold" style={{ color: T.text }}>O plano certo para você.</h2></div></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((p, i) => (
            <FadeIn key={`pf-${i}`} delay={i * 100}>
              <div className="relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2" style={{ background: p.highlight ? `linear-gradient(135deg, ${T.primary}18, ${T.secondary}10)` : T.card, borderColor: p.highlight ? T.primary : T.border, boxShadow: p.highlight ? `0 8px 40px ${T.primary}25` : "none" }}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: T.primary, color: "#fff" }}>MAIS POPULAR</div>}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${p.color}18` }}><p.icon size={24} style={{ color: p.color }} /></div>
                <div className="font-bold text-xl mb-1" style={{ color: T.text }}>{p.title}</div>
                <div className="text-sm mb-5" style={{ color: T.textSub }}>{p.sub}</div>
                <div className="flex flex-col gap-2 flex-1 mb-6">
                  {p.features.map((f, j) => <div key={`pff-${i}-${j}`} className="flex items-center gap-2 text-sm" style={{ color: T.textSub }}><CheckCircle2 size={14} style={{ color: p.color }} /> {f}</div>)}
                </div>
                <button onClick={() => onSelect("login")} className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: p.highlight ? T.primary : `${p.color}18`, color: p.highlight ? "#fff" : p.color, border: p.highlight ? "none" : `1px solid ${p.color}30`, boxShadow: p.highlight ? `0 4px 16px ${T.primary}40` : "none" }}>{p.cta}</button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: T.bg }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${T.primary}18, transparent)` }} />
      <div className="max-w-3xl mx-auto text-center relative">
        <FadeIn>
          <SectionLabel><Zap size={12} /> Comece agora</SectionLabel>
          <h2 className="text-5xl font-bold mb-6" style={{ color: T.text }}>Sua TV pode começar a gerar receita ainda hoje.</h2>
          <div className="flex flex-col gap-2 mb-8">
            {["Instalação em menos de 3 minutos.", "Sem contrato.", "Sem taxa de adesão.", "Sem investimento inicial."].map((t, i) => (
              <div key={`cta-t-${i}`} className="flex items-center justify-center gap-2 text-base" style={{ color: T.textSub }}><CheckCircle2 size={16} style={{ color: T.success }} />{t}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => onSelect("screen-setup")} className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 24px ${T.primary}50` }}><Tv size={18} /> Instalar uma Tela — Grátis <ArrowRight size={16} /></button>
            <button onClick={() => onSelect("enterprise")} className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105" style={{ background: T.card, color: T.text, border: `1px solid ${T.border}` }}><LayoutDashboard size={18} /> Solicitar Demonstração Enterprise</button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "PLATAFORMA", links: ["Instalar Tela", "Planos", "Enterprise", "AI Revenue"] },
    { title: "RETAIL MEDIA", links: ["Marketplace", "Revenue Share", "Anunciantes", "Agências"] },
    { title: "INFRAESTRUTURA", links: ["Network Center", "Trust Center", "ProofChain", "Status da Rede"] },
    { title: "SEGURANÇA", links: ["Trust Center", "ProofChain Explorer", "Status da Rede", "Relatórios"] },
    { title: "CERTIFICAÇÕES", links: ["ICP Brasil A3", "Blockchain Ethereum", "LGPD Compliance", "ISO 27001"] },
  ];
  const badges = [
    { l: "12.847 telas", c: T.primary }, { l: "99.9% uptime", c: T.success }, { l: "97.3 Trust", c: T.warning },
    { l: "4.8M provas", c: T.purple }, { l: "ICP Brasil", c: T.secondary }, { l: "Ethereum", c: T.primary },
    { l: "LGPD", c: T.success }, { l: "ISO 27001", c: T.gray },
  ];
  return (
    <footer className="py-16 px-6 border-t" style={{ background: "#010B1A", borderColor: T.border }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1"><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primary }}><Tv size={16} color="#fff" /></div><span className="font-bold text-lg" style={{ color: T.text }}>DOOHPLAY</span></div><p className="text-sm leading-relaxed" style={{ color: T.gray }}>Infraestrutura nacional de Digital Signage, Retail Media e Proof-of-Play Auditável.</p></div>
          {cols.map((c, i) => (
            <div key={`fc-${i}`}><div className="text-xs font-bold mb-4 tracking-wider" style={{ color: T.gray }}>{c.title}</div><div className="flex flex-col gap-2">{c.links.map((l, j) => <a key={`fl-${i}-${j}`} href="#" className="text-sm transition-colors hover:opacity-100" style={{ color: T.textSub, opacity: 0.8 }}>{l}</a>)}</div></div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-8 border-t" style={{ borderColor: T.border }}>
          {badges.map((b, i) => (
            <div key={`fb-${i}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${b.c}12`, color: b.c, border: `1px solid ${b.c}25` }}><CheckCircle2 size={10} /> {b.l}</div>
          ))}
          <div className="ml-auto text-xs" style={{ color: T.gray }}>2026 DOOHPLAY. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onSelect }: { onSelect: (v: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <header className="sticky top-0 z-50 transition-all duration-300" style={{ background: scrolled ? `${T.bg}F0` : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primary }}><Tv size={16} color="#fff" /></div><span className="font-bold text-lg" style={{ color: T.text }}>DOOHPLAY</span></div>
          <nav className="hidden md:flex items-center gap-6">
            {[{ l: "Instalar Tela", v: "screen-setup" }, { l: "Planos", v: "pricing" }, { l: "Verificar Prova", v: "proof-verifier" }, { l: "Trust Center", v: "trust-center" }, { l: "Enterprise", v: "enterprise" }, { l: "Network", v: "network-map" }].map((n, i) => (
              <button key={`nav-${i}`} onClick={() => onSelect(n.v)} className="text-sm transition-colors hover:opacity-100" style={{ color: T.textSub, opacity: 0.8 }}>{n.l}</button>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onSelect("login")} className="text-sm px-4 py-2 rounded-lg transition-all hover:bg-white/5" style={{ color: T.textSub }}>Entrar</button>
            <button onClick={() => onSelect("screen-setup")} className="text-sm px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 2px 8px ${T.primary}40` }}>Instalar uma Tela</button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={24} style={{ color: T.text }} /> : <Menu size={24} style={{ color: T.text }} />}</button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${T.border}` }}>
            {[{ l: "Entrar / Instalar Tela", v: "login" }, { l: "Planos", v: "pricing" }, { l: "Enterprise", v: "enterprise" }, { l: "Trust Center", v: "trust-center" }, { l: "ProofChain", v: "blockchain-explorer" }].map((n, i) => (
              <button key={`mn-${i}`} onClick={() => { onSelect(n.v); setMenuOpen(false); }} className="text-left text-sm py-2" style={{ color: T.textSub }}>{n.l}</button>
            ))}
          </div>
        )}
      </header>

      <section className="relative pt-20 pb-16 px-6 overflow-hidden" style={{ background: T.bg }}>
        <div className="absolute inset-0 pointer-events-none"><div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${T.primary}12 0%, transparent 70%)` }} /></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {[{ l: "Digital Signage", c: T.success }, { l: "Retail Media", c: T.secondary }, { l: "Blockchain", c: T.purple }, { l: "ICP Brasil", c: T.warning }, { l: "ProofChain", c: T.primary }, { l: "Trust Score", c: T.success }].map((b, i) => (
                  <div key={`hb-${i}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${b.c}18`, color: b.c, border: `1px solid ${b.c}30` }}>
                    <CheckCircle2 size={10} className="mr-1" /> {b.l}
                  </div>
                ))}
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-5" style={{ color: T.text, letterSpacing: "-0.02em" }}>
                Transforme qualquer TV em uma plataforma de{" "}
                <span style={{ color: T.primary }}>conteúdo, publicidade e receita.</span>
              </h1>
              <p className="text-xl mb-8" style={{ color: T.textSub }}>Digital Signage, Retail Media e Proof-of-Play Auditável em uma única plataforma Enterprise.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => onSelect("install")} className="flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base transition-all hover:scale-105" style={{ background: T.primary, color: "#fff", boxShadow: `0 4px 24px ${T.primary}50` }}><Tv size={18} /> Instalar uma Tela <ArrowRight size={16} /></button>
                <button onClick={() => onSelect("enterprise")} className="flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base transition-all hover:scale-105" style={{ background: T.card, color: T.text, border: `1px solid ${T.border}` }}><LayoutDashboard size={18} /> Solicitar Demonstração</button>
                <button className="flex items-center gap-2 px-5 py-4 rounded-xl font-semibold text-base transition-all hover:bg-white/5" style={{ color: T.textSub, border: `1px solid ${T.border}` }}><Play size={16} /> Assistir Video</button>
              </div>
              <LiveNetworkCard />
            </div>
            <div className="hidden lg:block"><HeroDashboardMockup /></div>
          </div>
        </div>
      </section>

      <MarketPositionSection />
      <SegmentsSection />
      <SocialProofSection />
      <MetricsSection />
      <ComparisonSection />
      <NetworkScaleSection onNavigate={onSelect} />
      <BrazilMapSection onNavigate={onSelect} />
      <ProofFlowSection />
      <RetailMediaSection />
      <AIRevenueSection onNavigate={onSelect} />
      <RevenueShareSection />
      <DashboardShowcase />
      <CasesSection />
      <ROICalculator onSelect={onSelect} />
      <TrustCenterSection onNavigate={onSelect} />
      <ProofChainExplorer onNavigate={onSelect} />
      <ProfileCards onSelect={onSelect} />
      <FinalCTA onSelect={onSelect} />
      <Footer />
    </div>
  );
}
